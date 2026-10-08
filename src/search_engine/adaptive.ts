import { AdaptiveWeights, QueryIntent, SearchMode } from './types';

export function computeAdaptiveWeights(
  query: string,
  intent: QueryIntent,
  selectedMode: SearchMode
): AdaptiveWeights {
  // If user explicitly picked an exact, semantic, or hybrid mode, respect their explicit choice with strong priors
  if (selectedMode === 'exact') {
    return {
      keywordWeight: 0.95,
      semanticWeight: 0.05,
      rationale: 'User selected Exact Search: Prioritizing verbatim token and identifier matching (95% Lexical / 5% Semantic).',
    };
  }

  if (selectedMode === 'semantic') {
    return {
      keywordWeight: 0.10,
      semanticWeight: 0.90,
      rationale: 'User selected Semantic Search: Prioritizing conceptual embedding similarity (10% Lexical / 90% Semantic).',
    };
  }

  if (selectedMode === 'technical') {
    return {
      keywordWeight: 0.65,
      semanticWeight: 0.35,
      rationale: 'Technical Search Mode: Emphasizing symbol exactness with code semantic grounding (65% Lexical / 35% Semantic).',
    };
  }

  if (selectedMode === 'hybrid') {
    return {
      keywordWeight: 0.50,
      semanticWeight: 0.50,
      rationale: 'Hybrid Search Mode: Equal Reciprocal Rank Fusion of keyword and conceptual representations (50% Lexical / 50% Semantic).',
    };
  }

  // Smart Search (Default Mode) -> Adaptive Retrieval dynamic calibration:
  // 1. Error codes / exact tokens (e.g. ERR_CONNECTION_RESET, 404, hex)
  if (intent.isExactIdentifier || intent.type === 'debugging_error' && intent.isTechnicalOrCode) {
    if (query.includes('ERR_') || query.includes('404') || query.includes('500') || !query.includes(' ')) {
      return {
        keywordWeight: 0.90,
        semanticWeight: 0.10,
        rationale: 'Adaptive Retrieval: Detected precise system/error identifier. Calibrated to 90% exact lexical / 10% semantic.',
      };
    }
  }

  // 2. High-level conceptual questions (e.g. What is normalization in machine learning?)
  if (intent.type === 'conceptual' || query.toLowerCase().startsWith('what is') || query.toLowerCase().startsWith('why ')) {
    return {
      keywordWeight: 0.15,
      semanticWeight: 0.85,
      rationale: 'Adaptive Retrieval: Detected high-level conceptual inquiry. Calibrated to 85% semantic vector / 15% lexical.',
    };
  }

  // 3. Problem solving / how-to / troubleshooting (e.g. How do I fix Python IndexError?)
  if (query.toLowerCase().includes('how do i fix') || query.toLowerCase().includes('how to solve')) {
    return {
      keywordWeight: 0.50,
      semanticWeight: 0.50,
      rationale: 'Adaptive Retrieval: Detected troubleshooting problem statement. Calibrated to balanced 50% hybrid fusion.',
    };
  }

  // 4. Programming and syntax queries
  if (intent.isTechnicalOrCode) {
    return {
      keywordWeight: 0.60,
      semanticWeight: 0.40,
      rationale: 'Adaptive Retrieval: Detected technical terminology and code patterns. Calibrated to 60% lexical / 40% semantic.',
    };
  }

  // General default balance
  return {
    keywordWeight: 0.45,
    semanticWeight: 0.55,
    rationale: 'Adaptive Retrieval: Balanced informational inquiry. Calibrated to 55% semantic / 45% lexical retrieval.',
  };
}
