export type SearchMode =
  | 'smart'
  | 'exact'
  | 'semantic'
  | 'hybrid'
  | 'technical';

export type QueryIntentType =
  | 'informational'
  | 'exact_lookup'
  | 'debugging_error'
  | 'conceptual'
  | 'technical_api'
  | 'document_retrieval';

export interface QueryIntent {
  type: QueryIntentType;
  label: string;
  confidence: number;
  detectedConcepts: string[];
  suggestedMode: SearchMode;
  isTechnicalOrCode: boolean;
  isExactIdentifier: boolean;
  contextReferent?: string;
}

export interface AdaptiveWeights {
  keywordWeight: number; // 0.0 to 1.0
  semanticWeight: number; // 0.0 to 1.0
  rationale: string;
}

export interface ReasonLayerMetrics {
  semanticRelevance: number; // 0-100
  keywordRelevance: number; // 0-100
  contextRelevance: number; // 0-100
  retrievalRelevance: number; // 0-100 (Final weighted metric)
  explanation: string;
}

export interface EvidenceDetail {
  id: string;
  sourceDocId: string;
  sourceTitle: string;
  sourceUrl?: string;
  pageNumber?: number;
  sectionHeader: string;
  exactPassage: string;
  matchingTerms: string[];
  semanticConcepts: string[];
  vectorDistance: number;
  confidenceScore: number;
}

export interface SearchResult {
  id: string;
  title: string;
  snippet: string;
  source: string;
  sourceUrl?: string;
  category: string;
  page?: number;
  section?: string;
  date?: string;
  searchTypeMatched: SearchMode;
  reasonLayer: ReasonLayerMetrics;
  evidence: EvidenceDetail;
  codeSnippet?: string;
  rawText?: string;
  tags: string[];
}

export interface EvidenceMapNode {
  id: string;
  stage: 'query' | 'concepts' | 'documents' | 'passages' | 'ranking' | 'result';
  label: string;
  sublabel?: string;
  score?: number;
  details?: string;
}

export interface EvidenceMapData {
  query: string;
  detectedConcepts: string[];
  matchedDocumentCount: number;
  passagesExamined: number;
  topResultTitle: string;
  adaptiveWeights: AdaptiveWeights;
  nodes: EvidenceMapNode[];
}

export interface SearchExecutionMetrics {
  totalLatencyMs: number;
  queryUnderstandingMs: number;
  retrievalMs: number;
  rerankMs: number;
  reasonLayerMs: number;
  documentsScanned: number;
  matchesEvaluated: number;
  precisionAt5: number;
  precisionAt10: number;
  mrr: number;
  ndcgAt10: number;
  searchModeUsed: SearchMode;
  adaptiveWeights: AdaptiveWeights;
}

export interface ComparisonResult {
  query: string;
  keywordResults: SearchResult[];
  semanticResults: SearchResult[];
  hybridResults: SearchResult[];
  keywordLatencyMs: number;
  semanticLatencyMs: number;
  hybridLatencyMs: number;
  jaccardOverlap: number; // overlap between keyword & semantic top-5
}

export interface SearchHealthStatus {
  totalDocuments: number;
  totalChunks: number;
  totalTokensIndexed: number;
  vectorIndexSize: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  queriesToday: number;
  noResultRate: number; // %
  lowConfidenceRate: number; // %
  deduplicationRate: number; // %
  lastIndexRefresh: string;
}

export interface CollectionItem {
  id: string;
  resultId: string;
  title: string;
  source: string;
  snippet: string;
  savedAt: string;
  notes?: string;
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  color?: string;
  items: CollectionItem[];
  createdAt: string;
}

export interface HistoryItem {
  id: string;
  query: string;
  timestamp: string;
  mode: SearchMode;
  resultCount: number;
  topResultTitle?: string;
}

export interface DocumentChunk {
  id: string;
  docId: string;
  docTitle: string;
  category: string;
  section: string;
  page?: number;
  content: string;
  tokens: string[];
  embeddingVector?: number[];
  sourceUrl?: string;
  date?: string;
  codeSnippet?: string;
}
