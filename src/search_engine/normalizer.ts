export interface NormalizationResult {
  raw: string;
  normalized: string;
  tokens: string[];
  suggestedCorrection: string | null;
  hasTypo: boolean;
}

// Common technical and conceptual typo dictionaries with human search corrections
const TYPO_MAP: Record<string, string> = {
  'machien lerning': 'machine learning',
  'machien': 'machine',
  'lerning': 'learning',
  'normlization': 'normalization',
  'normaliztion': 'normalization',
  'pythno': 'python',
  'pyton': 'python',
  'dictinary': 'dictionary',
  'indxerror': 'IndexError',
  'index eror': 'IndexError',
  'err connection rest': 'ERR_CONNECTION_RESET',
  'err_conection_reset': 'ERR_CONNECTION_RESET',
  'conection reset': 'connection reset',
  'cors acess control': 'CORS Access-Control-Allow-Origin',
  'postgre': 'PostgreSQL',
  'posgres': 'PostgreSQL',
  'rediss': 'Redis',
  'reciporcal': 'reciprocal',
  'reciprocal rank': 'reciprocal rank fusion',
  'jwst telescop': 'JWST telescope',
  'aerodynamcs': 'aerodynamics',
  'microtaks': 'microtasks',
  'evnt loop': 'event loop',
};

// Common stopwords that shouldn't distort exact lexical weight when not essential
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
  'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
  'to', 'was', 'were', 'will', 'with'
]);

export function normalizeQuery(query: string): NormalizationResult {
  const raw = query.trim();
  if (!raw) {
    return {
      raw: '',
      normalized: '',
      tokens: [],
      suggestedCorrection: null,
      hasTypo: false,
    };
  }

  // Check phrase level typos first
  const lowerRaw = raw.toLowerCase();
  let suggestedCorrection: string | null = null;

  if (TYPO_MAP[lowerRaw]) {
    suggestedCorrection = TYPO_MAP[lowerRaw];
  } else {
    // Check word-by-word typos
    const words = lowerRaw.split(/\s+/);
    let correctedAny = false;
    const correctedWords = words.map((w) => {
      const cleanW = w.replace(/[^a-z0-9_-]/g, '');
      if (TYPO_MAP[cleanW]) {
        correctedAny = true;
        return TYPO_MAP[cleanW];
      }
      return w;
    });

    if (correctedAny) {
      suggestedCorrection = correctedWords.join(' ');
    }
  }

  // Token extraction (preserving underscores and hyphens for technical terms like ERR_CONNECTION_RESET)
  const tokens = raw
    .toLowerCase()
    .replace(/[^\w\s_-]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 0);

  return {
    raw,
    normalized: tokens.join(' '),
    tokens,
    suggestedCorrection:
      suggestedCorrection && suggestedCorrection.toLowerCase() !== lowerRaw
        ? suggestedCorrection
        : null,
    hasTypo: Boolean(suggestedCorrection && suggestedCorrection.toLowerCase() !== lowerRaw),
  };
}

export function removeStopwords(tokens: string[]): string[] {
  const filtered = tokens.filter((t) => !STOPWORDS.has(t));
  return filtered.length > 0 ? filtered : tokens;
}
