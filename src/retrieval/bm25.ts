import { DocumentChunk } from '../search_engine/types';
import { removeStopwords } from '../search_engine/normalizer';

export interface BM25ScoredResult {
  chunk: DocumentChunk;
  score: number;
  matchedTokens: string[];
}

export class BM25Engine {
  private chunks: DocumentChunk[] = [];
  private docLengths: number[] = [];
  private avgDocLength = 0;
  private df: Map<string, number> = new Map(); // document frequency
  private totalDocs = 0;

  // BM25 standard parameters
  private readonly k1 = 1.5;
  private readonly b = 0.75;

  constructor(corpus: DocumentChunk[]) {
    this.index(corpus);
  }

  public index(corpus: DocumentChunk[]): void {
    this.chunks = corpus;
    this.totalDocs = corpus.length;
    this.df.clear();
    this.docLengths = [];

    let totalLength = 0;

    corpus.forEach((chunk) => {
      const docTokens = this.tokenizeDoc(chunk);
      this.docLengths.push(docTokens.length);
      totalLength += docTokens.length;

      const uniqueTokens = new Set(docTokens);
      uniqueTokens.forEach((token) => {
        this.df.set(token, (this.df.get(token) || 0) + 1);
      });
    });

    this.avgDocLength = this.totalDocs > 0 ? totalLength / this.totalDocs : 1;
  }

  private tokenizeDoc(chunk: DocumentChunk): string[] {
    const fullText = `${chunk.docTitle} ${chunk.section} ${chunk.content} ${chunk.codeSnippet || ''} ${chunk.tokens.join(' ')}`;
    return fullText
      .toLowerCase()
      .replace(/[^\w\s_-]/g, ' ')
      .split(/\s+/)
      .filter((t) => t.length > 0);
  }

  private calculateIDF(token: string): number {
    const docFreq = this.df.get(token) || 0;
    // Robertson-Spärck Jones IDF formula with add-1 smoothing
    return Math.log(1 + (this.totalDocs - docFreq + 0.5) / (docFreq + 0.5));
  }

  public search(queryTokens: string[]): BM25ScoredResult[] {
    if (this.chunks.length === 0 || queryTokens.length === 0) return [];

    const effectiveTokens = removeStopwords(queryTokens);
    const results: BM25ScoredResult[] = [];

    this.chunks.forEach((chunk, docIndex) => {
      const docTokens = this.tokenizeDoc(chunk);
      const docLength = this.docLengths[docIndex];
      const matchedTokens: string[] = [];

      // Calculate term frequencies for this doc
      const tfMap = new Map<string, number>();
      docTokens.forEach((token) => {
        tfMap.set(token, (tfMap.get(token) || 0) + 1);
      });

      let score = 0;

      effectiveTokens.forEach((qToken) => {
        // Direct match or prefix match for technical identifiers
        let tf = tfMap.get(qToken) || 0;

        // Give a boost if exact identifier appears
        if (chunk.content.toLowerCase().includes(qToken) || chunk.docTitle.toLowerCase().includes(qToken)) {
          tf += 1;
        }

        if (tf > 0) {
          matchedTokens.push(qToken);
          const idf = this.calculateIDF(qToken);
          const numerator = tf * (this.k1 + 1);
          const denominator =
            tf + this.k1 * (1 - this.b + this.b * (docLength / (this.avgDocLength || 1)));
          score += idf * (numerator / denominator);
        }
      });

      // Additional boost for exact full-phrase substring match
      const queryPhrase = queryTokens.join(' ').toLowerCase();
      if (chunk.content.toLowerCase().includes(queryPhrase) || chunk.docTitle.toLowerCase().includes(queryPhrase)) {
        score += 3.5;
      }

      if (score > 0) {
        results.push({
          chunk,
          score,
          matchedTokens: Array.from(new Set(matchedTokens)),
        });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }
}
