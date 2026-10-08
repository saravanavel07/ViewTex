import { engineDb } from './db';
import { DocumentChunk, SearchResult, SearchMode, AdaptiveWeights, QueryIntent } from '../search_engine/types';
import { normalizeQuery } from '../search_engine/normalizer';
import { detectQueryIntent } from '../search_engine/intent';
import { computeAdaptiveWeights } from '../search_engine/adaptive';
import { BM25Engine } from '../retrieval/bm25';
import { SemanticEngine } from '../retrieval/semantic';
import { HybridFusionEngine } from '../ranking/hybrid_fusion';
import { Reranker } from '../ranking/reranker';
import { computeReasonLayer } from '../search_engine/reason_layer';
import { extractEvidence } from '../search_engine/evidence_extractor';
import { buildEvidenceMap } from '../search_engine/evidence_map';

export interface SearchRequestOptions {
  query: string;
  mode?: SearchMode;
  collectionId?: string;
  weights?: { keyword: number; semantic: number };
  activeContext?: string;
}

export interface SearchResponsePayload {
  query: string;
  normalizedQuery: string;
  mode: SearchMode;
  intent: QueryIntent;
  results: SearchResult[];
  totalResults: number;
  latencyMs: number;
  retrievalStrategy: string;
  adaptiveWeights: AdaptiveWeights;
  evidenceMap: ReturnType<typeof buildEvidenceMap>;
  typoCorrection: string | null;
  serviceNotice?: string;
}

export class ServerSearchService {
  private bm25Engine: BM25Engine;
  private semanticEngine: SemanticEngine;
  private hybridFusion: HybridFusionEngine;
  private reranker: Reranker;

  // Evidence and reason caches for direct ID lookup
  private evidenceCache: Map<string, any> = new Map();
  private reasonCache: Map<string, any> = new Map();

  // Service health flags for testing fallback behavior (Section 47)
  private isKeywordHealthy = true;
  private isSemanticHealthy = true;

  constructor() {
    const chunks = this.getCorpusFromDb();
    this.bm25Engine = new BM25Engine(chunks);
    this.semanticEngine = new SemanticEngine(chunks);
    this.hybridFusion = new HybridFusionEngine();
    this.reranker = new Reranker();
  }

  public refreshIndexes(): void {
    const chunks = this.getCorpusFromDb();
    this.bm25Engine.index(chunks);
    this.semanticEngine.index(chunks);
  }

  private getCorpusFromDb(): DocumentChunk[] {
    const metadataChunks = engineDb.getAllChunks();
    return metadataChunks.map((c) => ({
      id: c.chunk_id,
      docId: c.document_id,
      docTitle: c.title,
      category: 'Documentation',
      section: c.section,
      page: c.page,
      content: c.text,
      tokens: c.text.toLowerCase().replace(/[^\w\s_-]/g, ' ').split(/\s+/).filter((t) => t.length > 2),
      sourceUrl: c.source.startsWith('http') ? c.source : undefined,
    }));
  }

  public executeSearch(options: SearchRequestOptions): SearchResponsePayload {
    const tStart = performance.now();
    const rawQuery = options.query?.trim() || '';

    // Step 1: Preprocessing & Normalization
    const normResult = normalizeQuery(rawQuery);
    const queryToSearch = normResult.normalized;

    if (!queryToSearch) {
      return {
        query: rawQuery,
        normalizedQuery: '',
        mode: options.mode || 'smart',
        intent: detectQueryIntent(''),
        results: [],
        totalResults: 0,
        latencyMs: 0,
        retrievalStrategy: 'idle',
        adaptiveWeights: { keywordWeight: 0.5, semanticWeight: 0.5, rationale: 'Empty query' },
        evidenceMap: buildEvidenceMap('', detectQueryIntent(''), { keywordWeight: 0.5, semanticWeight: 0.5, rationale: '' }, []),
        typoCorrection: null,
      };
    }

    // Step 2: Query Understanding & Intent
    const intent = detectQueryIntent(queryToSearch, options.activeContext);

    // Step 3: Retrieval Strategy & Fallback Handling (Section 47)
    let effectiveMode: SearchMode = options.mode || (options.mode === 'smart' ? intent.suggestedMode : 'hybrid');
    if (!options.mode || options.mode === 'smart') {
      effectiveMode = intent.suggestedMode;
    }

    let serviceNotice: string | undefined;

    // Check Fallback requirements
    if (effectiveMode === 'semantic' && !this.isSemanticHealthy) {
      effectiveMode = 'exact';
      serviceNotice = 'Semantic retrieval service unavailable; fell back to Exact Keyword retrieval.';
    } else if (effectiveMode === 'exact' && !this.isKeywordHealthy) {
      effectiveMode = 'semantic';
      serviceNotice = 'Keyword retrieval service unavailable; fell back to Dense Semantic retrieval.';
    }

    // Step 4: Adaptive Weights
    let adaptiveWeights = computeAdaptiveWeights(queryToSearch, intent, effectiveMode);
    if (options.weights) {
      adaptiveWeights = {
        keywordWeight: options.weights.keyword,
        semanticWeight: options.weights.semantic,
        rationale: 'User configured custom hybrid retrieval weights.',
      };
    }

    // Filter corpus if collectionId specified (Section 23)
    let chunks = this.getCorpusFromDb();
    if (options.collectionId) {
      const col = engineDb.getCollection(options.collectionId);
      if (col && col.items.length > 0) {
        const allowedDocIds = new Set(col.items.map((it) => it.resultId));
        chunks = chunks.filter((c) => allowedDocIds.has(c.id) || allowedDocIds.has(c.docId));
        this.bm25Engine.index(chunks);
        this.semanticEngine.index(chunks);
      }
    }

    // Step 5: Keyword & Semantic Retrieval
    const bm25Matches = this.isKeywordHealthy ? this.bm25Engine.search(normResult.tokens) : [];
    const semanticMatches = this.isSemanticHealthy ? this.semanticEngine.search(queryToSearch, options.activeContext) : [];

    // Step 6: Hybrid Fusion (RRF k=60)
    const fused = this.hybridFusion.fuse(bm25Matches, semanticMatches, adaptiveWeights);

    // Step 7: Deduplication & Cross-encoder Reranking
    const reranked = this.reranker.rerank(fused, rawQuery, options.activeContext);

    // Step 8: Reason Layer & Evidence Extraction
    const finalResults: SearchResult[] = reranked.slice(0, 10).map((cand) => {
      const reasonLayer = computeReasonLayer(cand, rawQuery, options.activeContext);
      const evidence = extractEvidence(cand, rawQuery);

      // Cache for direct ID lookup endpoints
      this.evidenceCache.set(cand.chunk.id, evidence);
      this.reasonCache.set(cand.chunk.id, reasonLayer);

      return {
        id: cand.chunk.id,
        title: cand.chunk.docTitle,
        snippet: cand.chunk.content.slice(0, 240) + '...',
        source: cand.chunk.docTitle,
        sourceUrl: cand.chunk.sourceUrl,
        category: cand.chunk.category,
        page: cand.chunk.page,
        section: cand.chunk.section,
        date: cand.chunk.date,
        searchTypeMatched: effectiveMode,
        reasonLayer,
        evidence,
        codeSnippet: cand.chunk.codeSnippet,
        rawText: cand.chunk.content,
        tags: cand.chunk.tokens.slice(0, 4),
      };
    });

    const latencyMs = Math.round(performance.now() - tStart);

    // Step 9: Build Evidence Map
    const evidenceMap = buildEvidenceMap(rawQuery, intent, adaptiveWeights, finalResults);

    // Log query in DB
    engineDb.logQuery({
      id: `q-${Date.now()}`,
      query: rawQuery,
      mode: effectiveMode,
      latency_ms: latencyMs,
      result_count: finalResults.length,
      strategy: adaptiveWeights.rationale,
      timestamp: new Date().toISOString(),
      confidence: finalResults[0]?.reasonLayer.retrievalRelevance ? finalResults[0].reasonLayer.retrievalRelevance / 100 : 0,
    });

    return {
      query: rawQuery,
      normalizedQuery: queryToSearch,
      mode: effectiveMode,
      intent,
      results: finalResults,
      totalResults: finalResults.length,
      latencyMs,
      retrievalStrategy: adaptiveWeights.rationale,
      adaptiveWeights,
      evidenceMap,
      typoCorrection: normResult.suggestedCorrection,
      serviceNotice,
    };
  }

  public getEvidenceById(id: string) {
    return this.evidenceCache.get(id) || null;
  }

  public getReasonById(id: string) {
    return this.reasonCache.get(id) || null;
  }

  public setServiceHealth(keyword: boolean, semantic: boolean) {
    this.isKeywordHealthy = keyword;
    this.isSemanticHealthy = semantic;
  }

  public getHealthStatus() {
    const totalDocs = engineDb.getDocuments().length;
    const totalChunks = engineDb.getAllChunks().length;

    return {
      keywordIndex: {
        status: this.isKeywordHealthy ? 'Healthy' : 'Unavailable',
        totalTokens: totalChunks * 28,
        engine: 'Okapi BM25',
      },
      vectorIndex: {
        status: this.isSemanticHealthy ? 'Healthy' : 'Unavailable',
        dimension: 64,
        totalVectors: totalChunks,
        metric: 'Cosine Similarity',
      },
      embeddingService: {
        status: 'Healthy',
        model: 'VIEWTEX Normalized Semantic Concept Space',
      },
      database: {
        status: 'Healthy',
        documentsCount: totalDocs,
        chunksCount: totalChunks,
        demoDatasetActive: engineDb.isDemoActive(),
      },
      reranker: {
        status: 'Healthy',
        algorithm: 'Cross-Attention Co-Occurrence Multiplier',
      },
      documentProcessor: {
        status: 'Healthy',
        supportedFormats: ['PDF', 'TXT', 'DOCX', 'CSV', 'Markdown', 'Source Code', 'JSON'],
      },
      voiceService: {
        status: 'Ready',
        api: 'Web Speech API (SpeechRecognition)',
      },
    };
  }
}

export const serverSearchService = new ServerSearchService();
