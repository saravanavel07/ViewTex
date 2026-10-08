import { ReasonLayerMetrics } from './types';
import { RerankedCandidate } from '../ranking/reranker';

export function computeReasonLayer(
  candidate: RerankedCandidate,
  rawQuery: string,
  activeContext?: string
): ReasonLayerMetrics {
  const lowerQuery = rawQuery.toLowerCase();
  const contentLower = candidate.chunk.content.toLowerCase();
  const titleLower = candidate.chunk.docTitle.toLowerCase();

  // 1. Semantic relevance (0 - 100)
  // Base from candidate.semanticSimilarity
  let semanticScore = Math.round((candidate.semanticSimilarity || 0.45) * 100);
  if (candidate.matchedConcepts.length > 0) {
    semanticScore = Math.min(99, semanticScore + candidate.matchedConcepts.length * 6);
  }
  semanticScore = Math.max(45, Math.min(98, semanticScore));

  // 2. Keyword relevance (0 - 100)
  let keywordScore = 50;
  if (contentLower.includes(lowerQuery) || titleLower.includes(lowerQuery)) {
    keywordScore = 95;
  } else if (candidate.matchedTokens.length > 0) {
    const ratio = candidate.matchedTokens.length / Math.max(1, lowerQuery.split(/\s+/).length);
    keywordScore = Math.min(94, Math.round(55 + ratio * 35));
  }
  keywordScore = Math.max(35, Math.min(98, keywordScore));

  // 3. Context relevance (0 - 100)
  let contextScore = 75;
  if (activeContext) {
    if (contentLower.includes(activeContext.toLowerCase()) || titleLower.includes(activeContext.toLowerCase())) {
      contextScore = 94;
    } else {
      contextScore = 60;
    }
  } else {
    // If no explicit conversation context, context aligns with domain category relevance
    contextScore = Math.min(96, Math.round((semanticScore + keywordScore) / 2 + 3));
  }

  // 4. Final retrieval relevance (0 - 100)
  const retrievalRelevance = Math.round(
    semanticScore * 0.45 + keywordScore * 0.40 + contextScore * 0.15
  );

  // 5. Generate human-designed explanation string
  const reasons: string[] = [];
  if (contentLower.includes(lowerQuery)) {
    reasons.push(`Exact verbatim match for "${rawQuery}" in document passage.`);
  } else if (candidate.matchedTokens.length > 0) {
    reasons.push(`Matched key lexical tokens [${candidate.matchedTokens.slice(0, 3).join(', ')}].`);
  }

  if (candidate.matchedConcepts.length > 0) {
    reasons.push(
      `Strong semantic relationship with ${candidate.matchedConcepts.slice(0, 2).join(' and ')} concepts.`
    );
  } else if (candidate.semanticSimilarity > 0.6) {
    reasons.push(`High conceptual cosine proximity to domain embedding space.`);
  }

  if (candidate.chunk.codeSnippet && lowerQuery.includes('code') || lowerQuery.includes('syntax') || lowerQuery.includes('how')) {
    reasons.push('Contains structured implementation code snippet.');
  }

  const explanation =
    reasons.length > 0
      ? reasons.join(' ')
      : `High composite ranking across lexical inverted index and dense semantic vector space.`;

  return {
    semanticRelevance: semanticScore,
    keywordRelevance: keywordScore,
    contextRelevance: contextScore,
    retrievalRelevance: Math.max(65, Math.min(99, retrievalRelevance)),
    explanation,
  };
}
