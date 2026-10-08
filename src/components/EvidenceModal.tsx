import React, { useState } from 'react';
import { X, Copy, Check, FileText, Layers, ExternalLink, Quote } from 'lucide-react';
import { SearchResult } from '../search_engine/types';

interface EvidenceModalProps {
  result: SearchResult | null;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ result, onClose }) => {
  const [copied, setCopied] = useState<string | null>(null);

  if (!result) return null;

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const { evidence } = result;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Evidence Inspector"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                Evidence-First Verification
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                {result.source} · Section: {result.section || 'Passage'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close evidence modal"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Exact Relevant Passage */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs uppercase font-mono tracking-wider text-[#666B70]">
                Exact Source Passage (Ground Truth)
              </span>
              <button
                onClick={() => handleCopy(evidence.exactPassage, 'passage')}
                className="flex items-center gap-1 text-xs text-[#575D65] hover:text-[#1E2022]"
              >
                {copied === 'passage' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'passage' ? 'Copied Passage' : 'Copy Passage'}</span>
              </button>
            </div>
            <div className="p-4 bg-white border border-[#E6E1D7] rounded-xl text-[#1E2022] leading-relaxed font-serif text-base border-l-4 border-l-[#C87A3E]">
              "{evidence.exactPassage}"
            </div>
          </div>

          {/* Verification Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="p-3 bg-white border border-[#E6E1D7] rounded-xl">
              <span className="text-[#848B94] block text-[10px] uppercase">Page Number</span>
              <span className="text-[#1E2022] font-semibold text-sm">
                p. {result.page || 'Direct Index'}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E1D7] rounded-xl">
              <span className="text-[#848B94] block text-[10px] uppercase">Vector Distance</span>
              <span className="text-[#1E2022] font-semibold text-sm">
                {evidence.vectorDistance}
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E1D7] rounded-xl">
              <span className="text-[#848B94] block text-[10px] uppercase">Retrieval Score</span>
              <span className="text-[#1E2022] font-semibold text-sm">
                {result.reasonLayer.retrievalRelevance}%
              </span>
            </div>

            <div className="p-3 bg-white border border-[#E6E1D7] rounded-xl">
              <span className="text-[#848B94] block text-[10px] uppercase">Doc Chunk ID</span>
              <span className="text-[#1E2022] font-semibold text-sm truncate block" title={evidence.id}>
                {evidence.id}
              </span>
            </div>
          </div>

          {/* Matching Terms & Semantic Relationship */}
          <div className="space-y-3">
            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#666B70] block mb-1.5">
                Exact Lexical Matching Terms:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {evidence.matchingTerms.length > 0 ? (
                  evidence.matchingTerms.map((term, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#F5F2EB] border border-[#ECE8E0] rounded text-xs font-mono text-[#1E2022]"
                    >
                      {term}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#848B94] italic font-mono">No direct token overlap</span>
                )}
              </div>
            </div>

            <div>
              <span className="text-xs uppercase font-mono tracking-wider text-[#666B70] block mb-1.5">
                Semantic Concept Projections:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {evidence.semanticConcepts.length > 0 ? (
                  evidence.semanticConcepts.map((concept, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-[#FAF4ED] border border-[#ECD9C5] rounded text-xs font-mono text-[#875026]"
                    >
                      {concept}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#848B94] italic font-mono">Inherent embedding neighborhood</span>
                )}
              </div>
            </div>
          </div>

          {/* Reason Layer Explanation */}
          <div className="p-3 bg-[#F5F2EB] border border-[#ECE8E0] rounded-xl">
            <span className="text-xs uppercase font-mono tracking-wider text-[#666B70] block mb-1">
              VIEWTEX Reason Layer Rationale:
            </span>
            <p className="text-xs text-[#2C3036] leading-relaxed">
              {result.reasonLayer.explanation}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex items-center justify-between text-xs">
          {result.sourceUrl ? (
            <a
              href={result.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-[#575D65] hover:text-[#1E2022]"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Open Original Source Document
            </a>
          ) : (
            <span className="text-[#848B94] font-mono">Internal Index</span>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handleCopy(
                  `[VIEWTEX Evidence] "${result.title}" (Passage: "${evidence.exactPassage}")`,
                  'citation'
                )
              }
              className="px-3 py-1.5 border border-[#E6E1D7] hover:bg-[#FAF8F5] text-[#1E2022] rounded-lg transition-colors flex items-center gap-1"
            >
              <Quote className="w-3.5 h-3.5 text-[#848B94]" />
              {copied === 'citation' ? 'Citation Copied' : 'Copy Evidence Citation'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#2C3036] hover:bg-[#1E2022] text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
