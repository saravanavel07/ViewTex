import React, { useState } from 'react';
import {
  ExternalLink,
  Copy,
  Quote,
  Eye,
  Bookmark,
  ChevronDown,
  ChevronUp,
  Check,
  FileCode,
  Link,
  Info,
} from 'lucide-react';
import { SearchResult } from '../search_engine/types';

interface SearchResultCardProps {
  result: SearchResult;
  onViewEvidence: (result: SearchResult) => void;
  onSaveToCollection: (result: SearchResult) => void;
  isSaved?: boolean;
}

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
  onViewEvidence,
  onSaveToCollection,
  isSaved = false,
}) => {
  const [showReasonLayer, setShowReasonLayer] = useState(false);
  const [copiedAction, setCopiedAction] = useState<string | null>(null);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAction(label);
    setTimeout(() => setCopiedAction(null), 2000);
  };

  const citationText = `[VIEWTEX Search] "${result.title}", Section: ${result.section || 'General'} (Source: ${result.source}). Retrieved 2026.`;

  return (
    <article className="p-5 sm:p-6 bg-white border border-[#E6E1D7] hover:border-[#D1C9BC] rounded-2xl transition-all shadow-xs group">
      {/* 1. Header: Source Breadcrumb + Unboxed Metadata (Zero-Pill discipline) */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#666B70] mb-2 font-mono">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#1E2022] font-semibold">{result.source}</span>
          {result.section && (
            <>
              <span aria-hidden="true" className="text-[#C4BDAF]">/</span>
              <span>{result.section}</span>
            </>
          )}
          {result.page && (
            <>
              <span aria-hidden="true" className="text-[#C4BDAF]">·</span>
              <span>p. {result.page}</span>
            </>
          )}
          {result.date && (
            <>
              <span aria-hidden="true" className="text-[#C4BDAF]">·</span>
              <span>{result.date}</span>
            </>
          )}
        </div>

        {/* Retrieval Relevance Metric & Search Type */}
        <div className="flex items-center gap-2">
          <span className="text-[#575D65]">
            Matched: <strong className="font-semibold capitalize text-[#1E2022]">{result.searchTypeMatched}</strong>
          </span>
          <span aria-hidden="true" className="text-[#C4BDAF]">·</span>
          <span className="text-[#2C3036] font-semibold bg-[#F5F2EB] px-2 py-0.5 rounded text-[11px]">
            {result.reasonLayer.retrievalRelevance}% Retrieval Relevance
          </span>
        </div>
      </div>

      {/* 2. Result Title */}
      <h3 className="text-lg sm:text-xl font-bold text-[#1E2022] tracking-tight hover:text-[#C87A3E] transition-colors mb-2 font-sans">
        {result.sourceUrl ? (
          <a
            href={result.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5"
          >
            {result.title}
            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity text-[#848B94]" />
          </a>
        ) : (
          result.title
        )}
      </h3>

      {/* 3. Description Snippet */}
      <p className="text-sm text-[#454B54] leading-relaxed mb-3">
        {result.snippet}
      </p>

      {/* 4. Code Snippet Block (If available) */}
      {result.codeSnippet && (
        <div className="my-3 p-3 bg-[#1E2022] rounded-xl text-xs font-mono text-[#FAF8F5] overflow-x-auto relative">
          <div className="flex items-center justify-between text-[10px] text-[#848B94] mb-1.5 border-b border-[#3A4048] pb-1">
            <span className="flex items-center gap-1">
              <FileCode className="w-3.5 h-3.5" />
              Code Implementation
            </span>
            <button
              onClick={() => handleCopy(result.codeSnippet!, 'code')}
              className="hover:text-white transition-colors"
            >
              {copiedAction === 'code' ? 'Copied!' : 'Copy Code'}
            </button>
          </div>
          <pre className="whitespace-pre">{result.codeSnippet}</pre>
        </div>
      )}

      {/* 5. VIEWTEX Reason Layer Dropdown (Section 17: Signature Feature) */}
      <div className="mt-3 pt-3 border-t border-[#ECE8E0]">
        <button
          onClick={() => setShowReasonLayer(!showReasonLayer)}
          className="w-full flex items-center justify-between text-xs font-medium text-[#575D65] hover:text-[#1E2022] py-1 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#C87A3E]" />
            <strong className="text-[#1E2022]">Why this result?</strong>
            <span className="text-[#848B94] font-normal hidden sm:inline">
              — VIEWTEX Reason Layer
            </span>
          </span>
          <span className="flex items-center gap-1 text-[11px] font-mono text-[#848B94]">
            {showReasonLayer ? 'Collapse' : 'Explain Match'}
            {showReasonLayer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </span>
        </button>

        {showReasonLayer && (
          <div className="mt-2.5 p-4 bg-[#F8F6F1] border border-[#E6E1D7] rounded-xl text-xs space-y-3">
            {/* Metric Bars */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-2 bg-white border border-[#EBE6DC] rounded-lg">
                <span className="text-[10px] uppercase font-mono text-[#848B94] block">
                  Semantic Relevance
                </span>
                <span className="text-base font-bold text-[#1E2022] font-mono">
                  {result.reasonLayer.semanticRelevance}%
                </span>
              </div>

              <div className="p-2 bg-white border border-[#EBE6DC] rounded-lg">
                <span className="text-[10px] uppercase font-mono text-[#848B94] block">
                  Keyword Relevance
                </span>
                <span className="text-base font-bold text-[#1E2022] font-mono">
                  {result.reasonLayer.keywordRelevance}%
                </span>
              </div>

              <div className="p-2 bg-white border border-[#EBE6DC] rounded-lg">
                <span className="text-[10px] uppercase font-mono text-[#848B94] block">
                  Context Relevance
                </span>
                <span className="text-base font-bold text-[#1E2022] font-mono">
                  {result.reasonLayer.contextRelevance}%
                </span>
              </div>

              <div className="p-2 bg-white border border-[#EBE6DC] rounded-lg">
                <span className="text-[10px] uppercase font-mono text-[#848B94] block">
                  Final Retrieval
                </span>
                <span className="text-base font-bold text-[#2C3036] font-mono">
                  {result.reasonLayer.retrievalRelevance}%
                </span>
              </div>
            </div>

            {/* Explanation Prose */}
            <p className="text-[#2C3036] leading-relaxed">
              <strong>Reason:</strong> "{result.reasonLayer.explanation}"
            </p>

            {/* Factual disclaimer required by Section 17 */}
            <p className="text-[10px] text-[#848B94] font-mono border-t border-[#EAE4D8] pt-2">
              Note: Metrics represent algorithm retrieval ranking confidence and vector proximity, not factual validity scores.
            </p>
          </div>
        )}
      </div>

      {/* 6. Action Controls Bar (Section 26: Copy/Paste & Citations) */}
      <div className="mt-4 pt-3 border-t border-[#ECE8E0] flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-xs">
          {/* View Evidence Button */}
          <button
            onClick={() => onViewEvidence(result)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E2022] bg-[#F5F2EB] hover:bg-[#EAE4D8] rounded-lg transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-[#2C3036]" />
            View Evidence
          </button>

          {/* Copy Result */}
          <button
            onClick={() => handleCopy(`${result.title}\n\n${result.snippet}`, 'result')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#575D65] hover:text-[#1E2022] hover:bg-[#F5F2EB] rounded-lg transition-colors"
            title="Copy full result text"
          >
            {copiedAction === 'result' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'result' ? 'Copied' : 'Copy'}</span>
          </button>

          {/* Copy Citation */}
          <button
            onClick={() => handleCopy(citationText, 'citation')}
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#575D65] hover:text-[#1E2022] hover:bg-[#F5F2EB] rounded-lg transition-colors"
            title="Copy formatted academic citation"
          >
            {copiedAction === 'citation' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Quote className="w-3.5 h-3.5" />}
            <span>{copiedAction === 'citation' ? 'Cited' : 'Citation'}</span>
          </button>

          {/* Copy Link */}
          {result.sourceUrl && (
            <button
              onClick={() => handleCopy(result.sourceUrl!, 'link')}
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs text-[#575D65] hover:text-[#1E2022] hover:bg-[#F5F2EB] rounded-lg transition-colors"
              title="Copy source web link"
            >
              {copiedAction === 'link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Link className="w-3.5 h-3.5" />}
              <span>{copiedAction === 'link' ? 'Copied' : 'Link'}</span>
            </button>
          )}
        </div>

        {/* Save to Collection */}
        <button
          onClick={() => onSaveToCollection(result)}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
            isSaved
              ? 'bg-[#EAE4D8] text-[#1E2022]'
              : 'text-[#575D65] hover:text-[#1E2022] hover:bg-[#F5F2EB]'
          }`}
        >
          <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-current text-[#C87A3E]' : ''}`} />
          <span>{isSaved ? 'Saved in Collection' : 'Save'}</span>
        </button>
      </div>
    </article>
  );
};
