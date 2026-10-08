import React from 'react';
import { X, Sparkles, Compass, ShieldCheck, Cpu, Layers } from 'lucide-react';
import { MascotAlien } from '../mascot/MascotAlien';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="About VIEWTEX"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <MascotAlien state="laughing" size="sm" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                About VIEWTEX
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Search Beyond Keywords · Human-Centered IR
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close about modal"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Philosophy Banner */}
          <div className="p-4 bg-white border border-[#E6E1D7] rounded-xl">
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#C87A3E] block mb-1">
              Core Philosophy
            </span>
            <h3 className="text-base font-bold text-[#1E2022] font-mono tracking-wide">
              SEARCH → UNDERSTAND → RETRIEVE → RANK → EXPLAIN
            </h3>
            <p className="text-xs text-[#575D65] mt-2 leading-relaxed">
              VIEWTEX is designed from first principles as an intelligent search engine engineered by humans. It is not a chatbot pretending to be a search engine. The interface prioritizes transparent, explainable results over fabricated conversational hallucinations.
            </p>
          </div>

          {/* Brand Mascot */}
          <div className="p-4 bg-white border border-[#E6E1D7] rounded-xl flex items-center gap-4">
            <MascotAlien state="idle" size="md" />
            <div>
              <h4 className="text-sm font-bold text-[#1E2022]">The VIEWTEX Mascot</h4>
              <p className="text-xs text-[#575D65] mt-1 leading-relaxed">
                A small, curious, intelligent alien sitting naturally on a rock and laughing. The character embodies discovery, relaxed confidence, and precision—a small companion reminding researchers that technical exploration can be joyful and unpretentious.
              </p>
            </div>
          </div>

          {/* Signature Innovation: The VIEWTEX Reason Layer */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#666B70]">
              Signature Innovation: The VIEWTEX Reason Layer
            </h4>
            <p className="text-xs text-[#454B54] leading-relaxed">
              Every retrieved result provides full attribution transparency through the Reason Layer. Instead of opaque neural scores, users inspect calibrated retrieval relevance metrics: semantic relevance, lexical keyword match, and active conversational context.
            </p>
          </div>

          {/* Human-First Principle */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono uppercase tracking-wider text-[#666B70]">
              The Human-First Principle
            </h4>
            <p className="text-xs text-[#454B54] leading-relaxed">
              Search results are never displaced by unsolicited chatbot text. Optional AI summaries are generated only upon explicit user request, strictly grounded in retrieved evidence with citations, and subject to hard anti-hallucination guardrails.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
