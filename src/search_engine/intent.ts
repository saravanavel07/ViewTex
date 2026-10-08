import { QueryIntent, SearchMode } from './types';

// Regex patterns for technical identifiers, error codes, and exact syntax
const ERROR_CODE_REGEX = /\b(ERR_[A-Z0-9_]+|HTTP_[0-9]{3}|E[A-Z0-9_]+|NullPointer|IndexError|TypeError|SyntaxError|404|500|502)\b/i;
const CODE_SYNTAX_REGEX = /([a-zA-Z_]\w*\s*\(|->|=>|::|\bdef\b|\bclass\b|\bconst\b|\bimport\b|\bSELECT\b|\bFROM\b)/i;
const QUESTION_REGEX = /^(what|how|why|when|where|explain|tell me about|difference between|compare)\b/i;
const PRONOUN_REFERENTS = /\b(its|it|their|they|these|those|this)\b/i;

export function detectQueryIntent(query: string, activeContext?: string): QueryIntent {
  const trimmed = query.trim();
  const lower = trimmed.toLowerCase();

  const isErrorCode = ERROR_CODE_REGEX.test(trimmed);
  const hasCodeSyntax = CODE_SYNTAX_REGEX.test(trimmed);
  const isQuestion = QUESTION_REGEX.test(trimmed);
  const hasPronoun = PRONOUN_REFERENTS.test(lower);

  // Concept extraction from query tokens
  const detectedConcepts: string[] = [];
  const conceptKeywords = [
    'normalization', 'standardization', 'machine learning', 'deep learning',
    'python', 'list', 'duplicates', 'indexerror', 'traceback',
    'connection reset', 'tcp', 'socket', 'cors', 'cross-origin',
    'bm25', 'reciprocal rank fusion', 'hybrid search', 'vector search',
    'postgres', 'pgvector', 'hnsw', 'ivfflat', 'event loop', 'microtask',
    'oauth', 'pkce', 'aerodynamics', 'soaring', 'telescope', 'jwst'
  ];

  for (const concept of conceptKeywords) {
    if (lower.includes(concept)) {
      detectedConcepts.push(concept);
    }
  }

  // Fallback concepts if none matched directly
  if (detectedConcepts.length === 0) {
    const rawWords = lower.replace(/[^a-z0-9_-]/g, ' ').split(/\s+/).filter(w => w.length > 2);
    if (rawWords.length > 0) {
      detectedConcepts.push(...rawWords.slice(0, 3));
    }
  }

  // Context referent resolution: e.g. "What are its advantages?" with context "Python"
  let contextReferent: string | undefined;
  if (hasPronoun && activeContext) {
    contextReferent = activeContext;
  }

  // Determine intent type and suggested search mode
  if (isErrorCode) {
    return {
      type: 'debugging_error',
      label: 'Error Code & Diagnostic Lookup',
      confidence: 0.96,
      detectedConcepts,
      suggestedMode: 'exact',
      isTechnicalOrCode: true,
      isExactIdentifier: true,
      contextReferent,
    };
  }

  if (hasCodeSyntax || lower.includes('api') || lower.includes('code') || lower.includes('syntax')) {
    return {
      type: 'technical_api',
      label: 'Technical Implementation & Code',
      confidence: 0.91,
      detectedConcepts,
      suggestedMode: 'technical',
      isTechnicalOrCode: true,
      isExactIdentifier: false,
      contextReferent,
    };
  }

  if (isQuestion && (lower.includes('fix') || lower.includes('error') || lower.includes('solve'))) {
    return {
      type: 'debugging_error',
      label: 'Diagnostic Troubleshooting',
      confidence: 0.93,
      detectedConcepts,
      suggestedMode: 'hybrid',
      isTechnicalOrCode: true,
      isExactIdentifier: false,
      contextReferent,
    };
  }

  if (isQuestion || lower.includes('what is') || lower.includes('why') || lower.includes('meaning')) {
    return {
      type: 'conceptual',
      label: 'Conceptual Understanding',
      confidence: 0.94,
      detectedConcepts,
      suggestedMode: 'semantic',
      isTechnicalOrCode: false,
      isExactIdentifier: false,
      contextReferent,
    };
  }

  if (trimmed.length > 0 && trimmed.length < 15 && !trimmed.includes(' ')) {
    return {
      type: 'exact_lookup',
      label: 'Exact Keyword & Identifier',
      confidence: 0.88,
      detectedConcepts,
      suggestedMode: 'exact',
      isTechnicalOrCode: false,
      isExactIdentifier: true,
      contextReferent,
    };
  }

  return {
    type: 'informational',
    label: 'Hybrid Informational Retrieval',
    confidence: 0.89,
    detectedConcepts,
    suggestedMode: 'smart',
    isTechnicalOrCode: false,
    isExactIdentifier: false,
    contextReferent,
  };
}
