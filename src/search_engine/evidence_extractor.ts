import { DocumentChunk, EvidenceDetail } from './types';
import { RerankedCandidate } from '../ranking/reranker';

export function extractEvidence(
  candidate: RerankedCandidate,
  rawQuery: string
): EvidenceDetail {
  const chunk: DocumentChunk = candidate.chunk;
  const lowerQuery = rawQuery.toLowerCase();
  const queryWords = lowerQuery.split(/\s+/).filter((w) => w.length > 1);

  // Identify matching lexical terms
  const contentWords = chunk.content.toLowerCase().split(/\s+/);
  const matchedTokens: string[] = [];

  queryWords.forEach((qw) => {
    if (chunk.content.toLowerCase().includes(qw) || chunk.docTitle.toLowerCase().includes(qw)) {
      matchedTokens.push(qw);
    }
  });

  // Extract exact passage sentence that best corresponds to the query
  const sentences = chunk.content.split(/(?<=[.!?])\s+/);
  let bestSentence = sentences[0] || chunk.content;
  let maxScore = -1;

  sentences.forEach((sentence) => {
    let score = 0;
    const sentLower = sentence.toLowerCase();
    queryWords.forEach((qw) => {
      if (sentLower.includes(qw)) score += 1;
    });
    if (sentLower.includes(lowerQuery)) score += 5;
    if (score > maxScore) {
      maxScore = score;
      bestSentence = sentence;
    }
  });

  return {
    id: `ev-${chunk.id}`,
    sourceDocId: chunk.docId,
    sourceTitle: chunk.docTitle,
    sourceUrl: chunk.sourceUrl,
    pageNumber: chunk.page,
    sectionHeader: chunk.section,
    exactPassage: chunk.content,
    matchingTerms: Array.from(new Set(matchedTokens)),
    semanticConcepts: candidate.matchedConcepts,
    vectorDistance: Math.round((1 - (candidate.semanticSimilarity || 0.5)) * 1000) / 1000,
    confidenceScore: Math.round(candidate.finalScore * 100) / 100,
  };
}
