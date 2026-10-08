import React, { useState } from 'react';
import { X, Split, Zap, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { ComparisonResult } from '../search_engine/types';
import { viewtexEngine } from '../search_engine/engine';

interface CompareSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultQuery?: string;
}

export const CompareSearchModal: React.FC<CompareSearchModalProps> = ({
  isOpen,
  onClose,
  defaultQuery = 'What is normalization in machine learning?',
}) => {
  const [query, setQuery] = useState(defaultQuery);
  const [comparison, setComparison] = useState<ComparisonResult | null>(() =>
    viewtexEngine.compareSearch(defaultQuery)
  );

  if (!isOpen) return null;

  const handleRunCompare = () => {
    if (!query.trim()) return;
    const res = viewtexEngine.compareSearch(query.trim());
    setComparison(res);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Compare Search Modes"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Split className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                VIEWTEX Retrieval Comparison
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Keyword (BM25) vs Semantic (Vector) vs Hybrid (RRF)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close comparison"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#F5F2EB] border-b border-[#E6E1D7] flex items-center gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRunCompare()}
            placeholder="Enter query to benchmark pipelines..."
            className="flex-1 px-3 py-2 text-sm bg-white border border-[#E6E1D7] rounded-lg text-[#1E2022] focus:outline-none focus:ring-1 focus:ring-[#2C3036]"
          />
          <button
            onClick={handleRunCompare}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5"
          >
            Run Compare
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Overlap & Benchmark Bar */}
        {comparison && (
          <div className="px-6 py-2 bg-white border-b border-[#ECE8E0] flex flex-wrap items-center justify-between text-xs font-mono text-[#575D65]">
            <div className="flex items-center gap-4">
              <span>
                Jaccard Overlap (Keyword ∩ Semantic):{' '}
                <strong className="text-[#1E2022]">{Math.round(comparison.jaccardOverlap * 100)}%</strong>
              </span>
              <span>·</span>
              <span>
                Engine Advantage:{' '}
                <strong className="text-[#C87A3E]">
                  Hybrid captures both exact identifiers and conceptual paraphrases
                </strong>
              </span>
            </div>
          </div>
        )}

        {/* 3-Column Comparison View */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Column 1: Keyword (BM25) */}
          <div className="bg-white border border-[#E6E1D7] rounded-xl p-4 flex flex-col">
            <div className="pb-3 border-b border-[#ECE8E0] mb-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase font-mono text-[#1E2022]">
                  Exact Keyword (BM25)
                </span>
                <span className="text-[10px] font-mono text-[#848B94]">
                  {comparison?.keywordLatencyMs}ms
                </span>
              </div>
              <p className="text-[11px] text-[#666B70] mt-1">
                Robertson-Spärck Jones Okapi formula with k1=1.5, b=0.75
              </p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[480px]">
              {comparison?.keywordResults.slice(0, 5).map((res, i) => (
                <div key={res.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#ECE8E0] text-xs">
                  <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-[#848B94]">
                    <span>Rank #{i + 1}</span>
                    <span>{res.reasonLayer.keywordRelevance}% Lexical</span>
                  </div>
                  <h4 className="font-semibold text-[#1E2022] line-clamp-1">{res.title}</h4>
                  <p className="text-[#575D65] text-[11px] line-clamp-2 mt-0.5">{res.snippet}</p>
                </div>
              ))}
              {comparison?.keywordResults.length === 0 && (
                <p className="text-xs text-[#848B94] italic text-center py-6">No exact keyword matches found.</p>
              )}
            </div>
          </div>

          {/* Column 2: Semantic (Vector) */}
          <div className="bg-white border border-[#E6E1D7] rounded-xl p-4 flex flex-col">
            <div className="pb-3 border-b border-[#ECE8E0] mb-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase font-mono text-[#1E2022]">
                  Semantic Search (Vector)
                </span>
                <span className="text-[10px] font-mono text-[#848B94]">
                  {comparison?.semanticLatencyMs}ms
                </span>
              </div>
              <p className="text-[11px] text-[#666B70] mt-1">
                Dense embedding projection with cosine similarity metrics
              </p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[480px]">
              {comparison?.semanticResults.slice(0, 5).map((res, i) => (
                <div key={res.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#ECE8E0] text-xs">
                  <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-[#848B94]">
                    <span>Rank #{i + 1}</span>
                    <span>{res.reasonLayer.semanticRelevance}% Semantic</span>
                  </div>
                  <h4 className="font-semibold text-[#1E2022] line-clamp-1">{res.title}</h4>
                  <p className="text-[#575D65] text-[11px] line-clamp-2 mt-0.5">{res.snippet}</p>
                </div>
              ))}
              {comparison?.semanticResults.length === 0 && (
                <p className="text-xs text-[#848B94] italic text-center py-6">No semantic matches found.</p>
              )}
            </div>
          </div>

          {/* Column 3: Hybrid Search (VIEWTEX Core) */}
          <div className="bg-white border-2 border-[#2C3036] rounded-xl p-4 flex flex-col relative">
            <div className="absolute -top-3 right-4 px-2 py-0.5 bg-[#2C3036] text-white text-[10px] font-mono uppercase rounded">
              VIEWTEX Fusion
            </div>

            <div className="pb-3 border-b border-[#ECE8E0] mb-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs uppercase font-mono text-[#1E2022]">
                  Adaptive Hybrid (RRF + Rerank)
                </span>
                <span className="text-[10px] font-mono text-[#848B94]">
                  {comparison?.hybridLatencyMs}ms
                </span>
              </div>
              <p className="text-[11px] text-[#666B70] mt-1">
                Reciprocal Rank Fusion (k=60) with cross-encoder passage boost
              </p>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto max-h-[480px]">
              {comparison?.hybridResults.slice(0, 5).map((res, i) => (
                <div key={res.id} className="p-2.5 bg-[#FAF8F5] rounded-lg border border-[#E6E1D7] text-xs">
                  <div className="flex items-center justify-between mb-1 font-mono text-[10px] text-[#2C3036] font-semibold">
                    <span>Rank #{i + 1} (Optimal)</span>
                    <span>{res.reasonLayer.retrievalRelevance}% Overall</span>
                  </div>
                  <h4 className="font-semibold text-[#1E2022] line-clamp-1">{res.title}</h4>
                  <p className="text-[#575D65] text-[11px] line-clamp-2 mt-0.5">{res.snippet}</p>
                </div>
              ))}
              {comparison?.hybridResults.length === 0 && (
                <p className="text-xs text-[#848B94] italic text-center py-6">No hybrid results found.</p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
