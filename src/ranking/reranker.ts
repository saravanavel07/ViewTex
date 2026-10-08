import { FusedCandidate } from './hybrid_fusion';

export interface RerankedCandidate extends FusedCandidate {
  finalScore: number;
  rerankMultiplier: number;
  rerankRationale: string;
}

export class Reranker {
  public rerank(
    candidates: FusedCandidate[],
    rawQuery: string,
    activeContext?: string
  ): RerankedCandidate[] {
    const lowerQuery = rawQuery.toLowerCase().trim();
    const queryTokens = lowerQuery.split(/\s+/).filter((t) => t.length > 1);

    return candidates
      .map((cand) => {
        let multiplier = 1.0;
        const reasons: string[] = [];
        const contentLower = cand.chunk.content.toLowerCase();
        const titleLower = cand.chunk.docTitle.toLowerCase();
        const sectionLower = cand.chunk.section.toLowerCase();

        // 1. Exact verbatim query in title or section
        if (titleLower.includes(lowerQuery) || sectionLower.includes(lowerQuery)) {
          multiplier += 0.45;
          reasons.push('exact query match in title/section');
        }

        // 2. Exact verbatim query in body passage
        if (contentLower.includes(lowerQuery)) {
          multiplier += 0.35;
          reasons.push('exact verbatim phrase matched in passage');
        }

        // 3. Multi-token co-occurrence proximity
        const matchedTokenCount = queryTokens.filter(
          (t) => contentLower.includes(t) || titleLower.includes(t)
        ).length;
        if (queryTokens.length > 0 && matchedTokenCount === queryTokens.length) {
          multiplier += 0.25;
          reasons.push('100% query token co-occurrence');
        }

        // 4. Code snippet presence for code/technical queries
        if (cand.chunk.codeSnippet && (lowerQuery.includes('code') || lowerQuery.includes('syntax') || lowerQuery.includes('fix') || lowerQuery.includes('error'))) {
          multiplier += 0.20;
          reasons.push('executable code snippet available');
        }

        // 5. Active context match (e.g. user previously searched "Python", and this chunk is Python)
        if (activeContext && (contentLower.includes(activeContext.toLowerCase()) || titleLower.includes(activeContext.toLowerCase()))) {
          multiplier += 0.30;
          reasons.push(`aligned with active context (${activeContext})`);
        }

        const finalScore = cand.rrfScore * multiplier;

        return {
          ...cand,
          finalScore,
          rerankMultiplier: Math.round(multiplier * 100) / 100,
          rerankRationale: reasons.length > 0 ? reasons.join(' · ') : 'balanced relevance',
        };
      })
      .sort((a, b) => b.finalScore - a.finalScore);
  }
}
