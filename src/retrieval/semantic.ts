import { DocumentChunk } from '../search_engine/types';

export interface SemanticScoredResult {
  chunk: DocumentChunk;
  similarity: number; // 0.0 to 1.0
  vectorDistance: number;
  matchedConcepts: string[];
}

// Conceptual synonym and semantic association cluster map
const CONCEPT_CLUSTERS: Record<string, string[]> = {
  normalization: ['scaling', 'standardization', 'z-score', 'min-max', 'variance', 'gradient', 'internal covariate shift', 'loss surface'],
  standardization: ['normalization', 'mean', 'unit variance', 'feature scaling'],
  machine_learning: ['deep learning', 'neural network', 'gradient descent', 'loss function', 'backpropagation', 'model'],
  python: ['list', 'sequence', 'iterable', 'dictionary', 'tuple', 'index', 'traceback', 'slicing'],
  list: ['sequence', 'array', 'deduplication', 'dict fromkeys', 'indexerror', 'subscript'],
  duplicates: ['deduplication', 'unique', 'distinct', 'set', 'dict fromkeys', 'removal'],
  indexerror: ['bounds', 'boundary', 'subscript', 'off-by-one', 'length', 'traceback', 'exception'],
  err_connection_reset: ['tcp', 'rst packet', 'socket', 'handshake', 'teardown', 'firewall', 'network reset'],
  cors: ['cross-origin', 'access-control-allow-origin', 'preflight', 'options request', 'browser security'],
  bm25: ['information retrieval', 'ranking function', 'term frequency', 'inverse document frequency', 'tf-idf', 'lexical search'],
  reciprocal_rank_fusion: ['hybrid search', 'rrf', 'rank fusion', 'vector search', 'reranking', 'ensemble'],
  postgresql: ['database', 'pgvector', 'hnsw', 'ivfflat', 'b-tree', 'vector indexing', 'sql'],
  event_loop: ['concurrency', 'asynchronous', 'microtask', 'macrotask', 'promise', 'callstack', 'javascript engine'],
  oauth: ['pkce', 'authorization code', 'code verifier', 'token', 'single page application', 'openid'],
  aerodynamics: ['soaring', 'flight', 'induced drag', 'aspect ratio', 'thermal', 'eagle', 'vulture'],
  telescope: ['observation', 'infrared', 'jwst', 'spectroscopy', 'optics', 'deep-field', 'astronomy'],
};

export class SemanticEngine {
  private chunks: DocumentChunk[] = [];
  private chunkVectors: Map<string, number[]> = new Map();
  private readonly vectorDim = 64;

  constructor(corpus: DocumentChunk[]) {
    this.index(corpus);
  }

  public index(corpus: DocumentChunk[]): void {
    this.chunks = corpus;
    this.chunkVectors.clear();

    corpus.forEach((chunk) => {
      const vec = this.embedText(
        `${chunk.docTitle} ${chunk.section} ${chunk.content} ${chunk.tokens.join(' ')}`
      );
      this.chunkVectors.set(chunk.id, vec);
    });
  }

  // Generates a 64-dimensional dense semantic vector via semantic hashing & concept projection
  private embedText(text: string): number[] {
    const vector = new Array(this.vectorDim).fill(0);
    const lower = text.toLowerCase();
    const words = lower.replace(/[^\w\s_-]/g, ' ').split(/\s+/).filter(w => w.length > 1);

    // 1. Concept cluster projection weights
    Object.entries(CONCEPT_CLUSTERS).forEach(([clusterKey, synonyms], clusterIdx) => {
      const dimIndex = clusterIdx % this.vectorDim;
      const keyMatch = lower.includes(clusterKey.replace('_', ' '));
      if (keyMatch) {
        vector[dimIndex] += 2.4;
      }
      synonyms.forEach((syn) => {
        if (lower.includes(syn)) {
          vector[dimIndex] += 1.2;
          vector[(dimIndex + 13) % this.vectorDim] += 0.8;
        }
      });
    });

    // 2. High-entropy n-gram feature hashing for dense dispersion
    words.forEach((word) => {
      for (let i = 0; i < word.length - 2; i++) {
        const tri = word.slice(i, i + 3);
        let hash = 0;
        for (let j = 0; j < tri.length; j++) {
          hash = (hash * 31 + tri.charCodeAt(j)) | 0;
        }
        const bucket = Math.abs(hash) % this.vectorDim;
        vector[bucket] += 0.15;
      }
    });

    // 3. L2 Unit Normalization
    let norm = 0;
    for (let i = 0; i < this.vectorDim; i++) {
      norm += vector[i] * vector[i];
    }
    const mag = Math.sqrt(norm) || 1e-9;
    return vector.map((v) => v / mag);
  }

  // Cosine similarity between two unit vectors: u · v
  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0;
    for (let i = 0; i < this.vectorDim; i++) {
      dot += a[i] * b[i];
    }
    // Clamp to [0, 1] range
    return Math.max(0, Math.min(1, (dot + 1) / 2));
  }

  public search(query: string, activeContext?: string): SemanticScoredResult[] {
    if (this.chunks.length === 0 || !query.trim()) return [];

    // Context augmentation: if there is an active context (e.g. Python), incorporate into embedding
    const queryToEmbed = activeContext ? `${activeContext} ${query}` : query;
    const queryVec = this.embedText(queryToEmbed);
    const lowerQuery = queryToEmbed.toLowerCase();

    const results: SemanticScoredResult[] = [];

    this.chunks.forEach((chunk) => {
      const docVec = this.chunkVectors.get(chunk.id);
      if (!docVec) return;

      const sim = this.cosineSimilarity(queryVec, docVec);
      const vectorDist = 1 - sim;

      // Extract matched conceptual clusters
      const matchedConcepts: string[] = [];
      Object.entries(CONCEPT_CLUSTERS).forEach(([clusterKey, synonyms]) => {
        const readable = clusterKey.replace('_', ' ');
        if (lowerQuery.includes(readable) || synonyms.some(s => lowerQuery.includes(s))) {
          if (
            chunk.content.toLowerCase().includes(readable) ||
            synonyms.some(s => chunk.content.toLowerCase().includes(s))
          ) {
            matchedConcepts.push(readable);
          }
        }
      });

      if (sim > 0.42 || matchedConcepts.length > 0) {
        results.push({
          chunk,
          similarity: sim,
          vectorDistance: Math.round(vectorDist * 1000) / 1000,
          matchedConcepts: Array.from(new Set(matchedConcepts)),
        });
      }
    });

    return results.sort((a, b) => b.similarity - a.similarity);
  }
}
