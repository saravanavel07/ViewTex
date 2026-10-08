import {
  EvidenceMapData,
  EvidenceMapNode,
  SearchResult,
  QueryIntent,
  AdaptiveWeights,
} from './types';

export function buildEvidenceMap(
  query: string,
  intent: QueryIntent,
  adaptiveWeights: AdaptiveWeights,
  results: SearchResult[]
): EvidenceMapData {
  const topResult = results[0];
  const matchedConcepts = intent.detectedConcepts.length > 0 ? intent.detectedConcepts : ['general semantic intent'];

  const nodes: EvidenceMapNode[] = [
    {
      id: 'node-query',
      stage: 'query',
      label: 'User Query',
      sublabel: query,
      details: `Normalized length: ${query.length} chars · Mode: ${intent.suggestedMode}`,
    },
    {
      id: 'node-concepts',
      stage: 'concepts',
      label: 'Detected Concepts',
      sublabel: matchedConcepts.slice(0, 3).join(', '),
      details: `Intent: ${intent.label} · Confidence: ${Math.round(intent.confidence * 100)}%`,
    },
    {
      id: 'node-documents',
      stage: 'documents',
      label: 'Matched Documents',
      sublabel: `${results.length} candidate documents retrieved`,
      details: `BM25 Lexical Weight: ${Math.round(adaptiveWeights.keywordWeight * 100)}% · Semantic Weight: ${Math.round(adaptiveWeights.semanticWeight * 100)}%`,
    },
    {
      id: 'node-passages',
      stage: 'passages',
      label: 'Relevant Passages',
      sublabel: topResult ? `${topResult.section} (p. ${topResult.page || 1})` : 'No passage',
      details: topResult ? `Extracted exact passage from ${topResult.source}` : 'N/A',
    },
    {
      id: 'node-ranking',
      stage: 'ranking',
      label: 'Adaptive Ranking Fusion',
      sublabel: topResult ? `${topResult.reasonLayer.retrievalRelevance}% Retrieval Relevance` : 'N/A',
      details: 'Reciprocal Rank Fusion (k=60) + Cross-encoder passage reranking multiplier',
    },
    {
      id: 'node-result',
      stage: 'result',
      label: 'Final Result',
      sublabel: topResult ? topResult.title : 'No result',
      details: topResult ? topResult.reasonLayer.explanation : 'No strong match found',
    },
  ];

  return {
    query,
    detectedConcepts: matchedConcepts,
    matchedDocumentCount: results.length,
    passagesExamined: results.length * 3,
    topResultTitle: topResult ? topResult.title : 'None',
    adaptiveWeights,
    nodes,
  };
}
