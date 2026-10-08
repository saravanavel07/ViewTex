import React from 'react';
import { X, ArrowDown, GitBranch, Search, Sparkles, Layers, FileText, BarChart2, CheckCircle2 } from 'lucide-react';
import { EvidenceMapData } from '../search_engine/types';

interface EvidenceMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  evidenceMap: EvidenceMapData | null;
}

export const EvidenceMapModal: React.FC<EvidenceMapModalProps> = ({
  isOpen,
  onClose,
  evidenceMap,
}) => {
  if (!isOpen || !evidenceMap) return null;

  const stageIcons = {
    query: Search,
    concepts: Sparkles,
    documents: Layers,
    passages: FileText,
    ranking: BarChart2,
    result: CheckCircle2,
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VIEWTEX Evidence Map"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                VIEWTEX Evidence Map
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Deterministic Search Pipeline & Attribution Trace
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Vertical Pipeline Visualization */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="text-xs text-[#666B70] font-mono mb-2">
            Pipeline: SEARCH → UNDERSTAND → RETRIEVE → RANK → EXPLAIN
          </div>

          <div className="flex flex-col items-center space-y-2">
            {evidenceMap.nodes.map((node, index) => {
              const Icon = stageIcons[node.stage];
              const isLast = index === evidenceMap.nodes.length - 1;

              return (
                <React.Fragment key={node.id}>
                  {/* Step Card */}
                  <div className="w-full bg-white border border-[#E6E1D7] rounded-xl p-4 shadow-2xs hover:border-[#2C3036] transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-lg bg-[#F5F2EB] text-[#2C3036] shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono uppercase tracking-wider text-[#848B94] block">
                            Stage 0{index + 1} · {node.label}
                          </span>
                          <h4 className="text-sm font-semibold text-[#1E2022]">
                            {node.sublabel}
                          </h4>
                        </div>
                      </div>

                      {node.score !== undefined && (
                        <span className="text-xs font-mono font-semibold text-[#2C3036] bg-[#F5F2EB] px-2 py-0.5 rounded">
                          {node.score}%
                        </span>
                      )}
                    </div>

                    {node.details && (
                      <p className="mt-2 text-xs text-[#575D65] font-mono bg-[#FAF8F5] p-2 rounded border border-[#ECE8E0]">
                        {node.details}
                      </p>
                    )}
                  </div>

                  {/* Connecting Arrow */}
                  {!isLast && (
                    <div className="flex items-center justify-center text-[#848B94] py-0.5">
                      <ArrowDown className="w-4 h-4 text-[#848B94]" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex items-center justify-between text-xs">
          <span className="text-[11px] font-mono text-[#848B94]">
            Adaptive: {Math.round(evidenceMap.adaptiveWeights.keywordWeight * 100)}% Keyword · {Math.round(evidenceMap.adaptiveWeights.semanticWeight * 100)}% Semantic
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white rounded-lg transition-colors font-medium text-xs"
          >
            Close Map
          </button>
        </div>
      </div>
    </div>
  );
};
