import { DocumentChunk, AdaptiveWeights } from '../search_engine/types';
import { BM25ScoredResult } from '../retrieval/bm25';
import { SemanticScoredResult } from '../retrieval/semantic';

export interface FusedCandidate {
  chunk: DocumentChunk;
  bm25Rank: number; // 1-indexed, or 999 if not in top
  semanticRank: number;
  bm25Score: number;
  semanticSimilarity: number;
  rrfScore: number;
  matchedTokens: string[];
  matchedConcepts: string[];
}

export class HybridFusionEngine {
  private readonly k = 60; // Standard RRF smoothing constant

  public fuse(
    bm25Results: BM25ScoredResult[],
    semanticResults: SemanticScoredResult[],
    weights: AdaptiveWeights
  ): FusedCandidate[] {
    const candidateMap = new Map<string, FusedCandidate>();

    // Index BM25 ranks
    bm25Results.forEach((bRes, idx) => {
      const rank = idx + 1;
      const id = bRes.chunk.id;
      candidateMap.set(id, {
        chunk: bRes.chunk,
        bm25Rank: rank,
        semanticRank: 999,
        bm25Score: bRes.score,
        semanticSimilarity: 0,
        rrfScore: 0,
        matchedTokens: bRes.matchedTokens,
        matchedConcepts: [],
      });
    });

    // Merge Semantic ranks
    semanticResults.forEach((sRes, idx) => {
      const rank = idx + 1;
      const id = sRes.chunk.id;
      const existing = candidateMap.get(id);

      if (existing) {
        existing.semanticRank = rank;
        existing.semanticSimilarity = sRes.similarity;
        existing.matchedConcepts = sRes.matchedConcepts;
      } else {
        candidateMap.set(id, {
          chunk: sRes.chunk,
          bm25Rank: 999,
          semanticRank: rank,
          bm25Score: 0,
          semanticSimilarity: sRes.similarity,
          rrfScore: 0,
          matchedTokens: [],
          matchedConcepts: sRes.matchedConcepts,
        });
      }
    });

    // Calculate Adaptive Reciprocal Rank Fusion score
    const candidates = Array.from(candidateMap.values());
    candidates.forEach((cand) => {
      const bm25Component =
        cand.bm25Rank <= 100 ? weights.keywordWeight / (this.k + cand.bm25Rank) : 0;
      const semanticComponent =
        cand.semanticRank <= 100 ? weights.semanticWeight / (this.k + cand.semanticRank) : 0;

      cand.rrfScore = bm25Component + semanticComponent;
    });

    // Sort descending by RRF score
    return candidates.sort((a, b) => b.rrfScore - a.rrfScore);
  }
}
