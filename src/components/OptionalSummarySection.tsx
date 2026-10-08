import React, { useState } from 'react';
import { Sparkles, AlertTriangle, BookOpen, ChevronUp, ChevronDown, CheckCircle2, RotateCw } from 'lucide-react';
import { SearchResult } from '../search_engine/types';

interface OptionalSummarySectionProps {
  query: string;
  results: SearchResult[];
}

export const OptionalSummarySection: React.FC<OptionalSummarySectionProps> = ({
  query,
  results,
}) => {
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [summaryText, setSummaryText] = useState<string>('');
  const [isInsufficientEvidence, setIsInsufficientEvidence] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleGenerateSummary = async () => {
    setIsLoading(true);
    setIsInsufficientEvidence(false);

    // Anti-Hallucination check (Section 28)
    if (results.length === 0 || results[0].reasonLayer.retrievalRelevance < 55) {
      setTimeout(() => {
        setIsInsufficientEvidence(true);
        setSummaryText('VIEWTEX could not find enough evidence to provide a reliable answer.');
        setIsGenerated(true);
        setIsLoading(false);
      }, 500);
      return;
    }

    try {
      // Try server endpoint /api/summary with retrieved evidence
      const topEvidence = results.slice(0, 3).map((r, i) => ({
        index: i + 1,
        source: r.source,
        section: r.section,
        passage: r.evidence.exactPassage,
      }));

      const res = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, evidence: topEvidence }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryText(data.summary);
      } else {
        // Deterministic evidence synthesizer fallback
        const synthesized = buildGroundedSummary(query, results.slice(0, 3));
        setSummaryText(synthesized);
      }
    } catch {
      // Fallback synthesizer
      const synthesized = buildGroundedSummary(query, results.slice(0, 3));
      setSummaryText(synthesized);
    } finally {
      setIsGenerated(true);
      setIsLoading(false);
    }
  };

  const buildGroundedSummary = (q: string, top: SearchResult[]): string => {
    const parts = top.map((r, idx) => {
      const cite = `[${idx + 1}]`;
      const cleanPassage = r.evidence.exactPassage.replace(/`([^`]+)`/g, '$1');
      const firstSentence = cleanPassage.split(/(?<=[.!?])\s+/)[0] || cleanPassage;
      return `${firstSentence} ${cite}`;
    });
    return `Based on verified retrieved documents for "${q}": ${parts.join(' Furthermore, ')}`;
  };

  if (!results.length) return null;

  return (
    <div className="w-full mb-6">
      {!isGenerated ? (
        /* Optional action button - Human-first: never auto-generates or forces AI */
        <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E1D7] rounded-xl hover:border-[#2C3036] transition-colors shadow-2xs">
          <div className="flex items-center gap-2 text-xs text-[#575D65]">
            <Sparkles className="w-4 h-4 text-[#C87A3E]" />
            <span>
              Synthesize a concise, citation-grounded summary across top {Math.min(3, results.length)} sources?
            </span>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E2022] bg-[#F5F2EB] hover:bg-[#EAE4D8] rounded-lg transition-colors cursor-pointer"
          >
            {isLoading ? (
              <>
                <RotateCw className="w-3.5 h-3.5 animate-spin" />
                <span>Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-[#C87A3E]" />
                <span>Generate Summary</span>
              </>
            )}
          </button>
        </div>
      ) : (
        /* Clearly Separated "Generated Summary" and "Retrieved Evidence" (Section 27) */
        <div className="bg-white border border-[#E6E1D7] rounded-2xl p-5 shadow-xs transition-all">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#C87A3E]" />
              <span className="text-xs font-mono uppercase font-semibold text-[#1E2022] tracking-wider">
                Generated Summary (Optional AI Layer)
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-[#848B94] font-mono">
                Grounded in {Math.min(3, results.length)} retrieved passages
              </span>
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-1 text-[#848B94] hover:text-[#1E2022] rounded"
              >
                {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {!isCollapsed && (
            <>
              {/* Anti-Hallucination Warning or Generated Summary */}
              {isInsufficientEvidence ? (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-xs text-amber-900">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700" />
                  <span>{summaryText}</span>
                </div>
              ) : (
                <div className="mt-3 text-sm text-[#1E2022] leading-relaxed font-serif">
                  {summaryText}
                </div>
              )}

              {/* Retrieved Evidence Sources Section (Strict separation) */}
              <div className="mt-4 pt-3 border-t border-[#ECE8E0]">
                <div className="flex items-center gap-1.5 text-xs text-[#666B70] font-mono mb-2 uppercase tracking-wider">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Retrieved Evidence (Source Citations)</span>
                </div>
                <div className="space-y-1.5">
                  {results.slice(0, 3).map((r, i) => (
                    <div
                      key={r.id}
                      className="text-xs text-[#575D65] flex items-start gap-2 bg-[#FAF8F5] p-2 rounded-lg border border-[#ECE8E0]"
                    >
                      <span className="font-mono font-bold text-[#1E2022] shrink-0">
                        [{i + 1}]
                      </span>
                      <div>
                        <strong className="text-[#1E2022]">{r.source}</strong> — {r.section} (p. {r.page || 1})
                        <p className="text-[11px] text-[#848B94] line-clamp-1 italic mt-0.5">
                          "{r.evidence.exactPassage}"
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
