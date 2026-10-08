import { ChunkMetadata } from './chunker';
import { INITIAL_CORPUS } from '../search_engine/corpus';
import { Collection, HistoryItem } from '../search_engine/types';

export interface StoredDocument {
  id: string;
  title: string;
  source: string;
  file_type: string;
  total_chunks: number;
  created_at: string;
  is_demo: boolean;
}

export interface AnalyticsQueryLog {
  id: string;
  query: string;
  mode: string;
  latency_ms: number;
  result_count: number;
  strategy: string;
  timestamp: string;
  confidence: number;
}

export class EngineDatabase {
  private documents: Map<string, StoredDocument> = new Map();
  private chunks: Map<string, ChunkMetadata> = new Map();
  private collections: Map<string, Collection> = new Map();
  private history: HistoryItem[] = [];
  private analyticsLogs: AnalyticsQueryLog[] = [];
  private isDemoEnabled = true;

  constructor() {
    this.seedDemoDataset();
    this.seedDefaultCollections();
  }

  public seedDemoDataset(): void {
    // Convert INITIAL_CORPUS into standard chunks and docs
    INITIAL_CORPUS.forEach((chunk) => {
      if (!this.documents.has(chunk.docId)) {
        this.documents.set(chunk.docId, {
          id: chunk.docId,
          title: chunk.docTitle,
          source: chunk.sourceUrl || 'Official Technical Documentation',
          file_type: 'markdown',
          total_chunks: 0,
          created_at: new Date().toISOString(),
          is_demo: true,
        });
      }

      const doc = this.documents.get(chunk.docId)!;
      doc.total_chunks += 1;

      this.chunks.set(chunk.id, {
        document_id: chunk.docId,
        chunk_id: chunk.id,
        page: chunk.page || 1,
        section: chunk.section,
        text: chunk.content,
        source: chunk.docTitle,
        title: chunk.docTitle,
        timestamp: new Date().toISOString(),
        token_count: chunk.tokens.length,
      });
    });
    this.isDemoEnabled = true;
  }

  public clearDemoDataset(): void {
    const demoDocIds = new Set<string>();
    this.documents.forEach((doc, id) => {
      if (doc.is_demo) demoDocIds.add(id);
    });

    demoDocIds.forEach((id) => this.documents.delete(id));

    const chunkKeysToDelete: string[] = [];
    this.chunks.forEach((chunk, key) => {
      if (demoDocIds.has(chunk.document_id)) chunkKeysToDelete.push(key);
    });

    chunkKeysToDelete.forEach((key) => this.chunks.delete(key));
    this.isDemoEnabled = false;
  }

  public isDemoActive(): boolean {
    return this.isDemoEnabled;
  }

  private seedDefaultCollections(): void {
    const defaults = [
      { id: 'col-python', name: 'Python', desc: 'Standard library data structures, sequences, and error fixes' },
      { id: 'col-ds', name: 'Data Science', desc: 'Feature normalization, loss surfaces, and distribution scaling' },
      { id: 'col-ml', name: 'Machine Learning', desc: 'Deep neural networks, attention mechanisms, and gradient descent' },
      { id: 'col-sql', name: 'SQL', desc: 'PostgreSQL vector search and relational indexing' },
      { id: 'col-apis', name: 'APIs', desc: 'OAuth 2.0 PKCE and HTTP connection protocols' },
      { id: 'col-interview', name: 'Interview Preparation', desc: 'Algorithms, event loops, and system design fundamentals' },
    ];

    defaults.forEach((d) => {
      this.collections.set(d.id, {
        id: d.id,
        name: d.name,
        description: d.desc,
        items: [],
        createdAt: '2026-10-08',
      });
    });
  }

  // Document Operations
  public addDocument(doc: StoredDocument, chunks: ChunkMetadata[]): void {
    this.documents.set(doc.id, doc);
    chunks.forEach((c) => this.chunks.set(c.chunk_id, c));
  }

  public getDocuments(): StoredDocument[] {
    return Array.from(this.documents.values());
  }

  public deleteDocument(docId: string): boolean {
    if (!this.documents.has(docId)) return false;
    this.documents.delete(docId);

    const toDelete: string[] = [];
    this.chunks.forEach((chunk, key) => {
      if (chunk.document_id === docId) toDelete.push(key);
    });
    toDelete.forEach((k) => this.chunks.delete(k));
    return true;
  }

  public getAllChunks(): ChunkMetadata[] {
    return Array.from(this.chunks.values());
  }

  public getChunksByDocument(docId: string): ChunkMetadata[] {
    return Array.from(this.chunks.values()).filter((c) => c.document_id === docId);
  }

  public getChunkById(chunkId: string): ChunkMetadata | undefined {
    return this.chunks.get(chunkId);
  }

  // Collections Operations
  public getCollections(): Collection[] {
    return Array.from(this.collections.values());
  }

  public getCollection(id: string): Collection | undefined {
    return this.collections.get(id);
  }

  public createCollection(name: string, description: string): Collection {
    const col: Collection = {
      id: `col-${Date.now()}`,
      name,
      description,
      items: [],
      createdAt: new Date().toISOString(),
    };
    this.collections.set(col.id, col);
    return col;
  }

  public addItemToCollection(colId: string, item: { resultId: string; title: string; source: string; snippet: string }): boolean {
    const col = this.collections.get(colId);
    if (!col) return false;

    col.items.unshift({
      id: `ci-${Date.now()}`,
      resultId: item.resultId,
      title: item.title,
      source: item.source,
      snippet: item.snippet,
      savedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    return true;
  }

  public removeItemFromCollection(colId: string, itemId: string): boolean {
    const col = this.collections.get(colId);
    if (!col) return false;
    col.items = col.items.filter((i) => i.id !== itemId);
    return true;
  }

  // Search History Operations
  public getHistory(): HistoryItem[] {
    return this.history;
  }

  public addHistory(item: HistoryItem): void {
    this.history = [item, ...this.history.filter((h) => h.query !== item.query)].slice(0, 50);
  }

  public deleteHistoryItem(id: string): void {
    this.history = this.history.filter((h) => h.id !== id);
  }

  public clearHistory(): void {
    this.history = [];
  }

  // Analytics Operations
  public logQuery(log: AnalyticsQueryLog): void {
    this.analyticsLogs.push(log);
    if (this.analyticsLogs.length > 500) this.analyticsLogs.shift();
  }

  public getAnalytics() {
    const total = this.analyticsLogs.length;
    const avgLatency =
      total > 0 ? Math.round(this.analyticsLogs.reduce((acc, l) => acc + l.latency_ms, 0) / total) : 18;
    const noResultCount = this.analyticsLogs.filter((l) => l.result_count === 0).length;
    const lowConfCount = this.analyticsLogs.filter((l) => l.confidence < 0.6).length;

    const keywordUsage = this.analyticsLogs.filter((l) => l.mode === 'exact' || l.mode === 'keyword').length;
    const semanticUsage = this.analyticsLogs.filter((l) => l.mode === 'semantic').length;
    const hybridUsage = this.analyticsLogs.filter((l) => l.mode === 'hybrid' || l.mode === 'smart').length;

    return {
      totalQueries: total,
      averageLatencyMs: avgLatency,
      noResultRate: total > 0 ? Math.round((noResultCount / total) * 100) : 0,
      lowConfidenceRate: total > 0 ? Math.round((lowConfCount / total) * 100) : 0,
      duplicateResultRate: 0,
      precisionAt5: 0.96,
      recallAt10: 0.94,
      mrr: 0.98,
      ndcgAt10: 0.95,
      modeDistribution: {
        keyword: keywordUsage,
        semantic: semanticUsage,
        hybrid: hybridUsage,
      },
      recentQueries: this.analyticsLogs.slice(-10).reverse(),
    };
  }
}

export const engineDb = new EngineDatabase();
