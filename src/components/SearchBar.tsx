import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import {
  Search as SearchIcon,
  Mic,
  X,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Sparkles,
  Layers,
  Code2,
  FileSearch,
  Check,
} from 'lucide-react';
import { SearchMode, AdaptiveWeights } from '../search_engine/types';

export interface SearchBarHandle {
  focus: () => void;
  setQuery: (q: string) => void;
}

interface SearchBarProps {
  query: string;
  onQueryChange: (q: string) => void;
  onSearch: (q: string) => void;
  searchMode: SearchMode;
  onSelectMode: (mode: SearchMode) => void;
  adaptiveWeights?: AdaptiveWeights;
  activeContext?: string;
  onClearContext?: () => void;
  typoCorrection?: string | null;
  onSearchCorrected?: (corrected: string) => void;
  onOpenVoice: () => void;
  isSearching?: boolean;
  recentQueries?: string[];
}

export const SearchBar = forwardRef<SearchBarHandle, SearchBarProps>(({
  query,
  onQueryChange,
  onSearch,
  searchMode,
  onSelectMode,
  adaptiveWeights,
  activeContext,
  onClearContext,
  typoCorrection,
  onSearchCorrected,
  onOpenVoice,
  isSearching = false,
  recentQueries = [],
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
    setQuery: (q: string) => onQueryChange(q),
  }));

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setShowSuggestions(false);
      onSearch(query);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectRecent = (q: string) => {
    onQueryChange(q);
    setShowSuggestions(false);
    onSearch(q);
  };

  const sampleSuggestions = [
    'What is normalization in machine learning?',
    'How do I fix Python IndexError?',
    'ERR_CONNECTION_RESET',
    'PostgreSQL HNSW vs IVFFlat vector index',
    'Reciprocal Rank Fusion hybrid search',
    'CORS header Access-Control-Allow-Origin missing',
    'Avian soaring aerodynamics eagles vultures',
  ];

  const filteredSuggestions = sampleSuggestions.filter(
    (s) => s.toLowerCase().includes(query.toLowerCase()) && s.toLowerCase() !== query.toLowerCase()
  );

  return (
    <div ref={containerRef} className="w-full max-w-3xl mx-auto flex flex-col items-center">
      {/* Active Conversation Context Bar (Section 21) */}
      {activeContext && (
        <div className="w-full mb-3 flex items-center justify-between px-3 py-1.5 bg-[#F5F2EB] border border-[#E6E1D7] rounded-lg text-xs">
          <div className="flex items-center gap-2">
            <span className="font-mono uppercase text-[#666B70] tracking-wider text-[10px]">
              Active Context
            </span>
            <span className="font-semibold text-[#1E2022] font-mono">{activeContext}</span>
          </div>
          {onClearContext && (
            <button
              onClick={onClearContext}
              className="text-[#666B70] hover:text-[#1E2022] text-xs font-medium hover:underline"
            >
              Clear context
            </button>
          )}
        </div>
      )}

      {/* Main Search Input Container */}
      <div
        className={`w-full relative flex items-center bg-white rounded-2xl border transition-all duration-200 ${
          isFocused
            ? 'border-[#2C3036] shadow-md ring-1 ring-[#2C3036]/20'
            : 'border-[#E6E1D7] hover:border-[#C4BDAF] shadow-xs'
        }`}
      >
        {/* Left Search Icon */}
        <div className="pl-4 pr-2 text-[#666B70] flex items-center pointer-events-none">
          <SearchIcon className={`w-5 h-5 ${isSearching ? 'animate-pulse text-[#C87A3E]' : ''}`} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            onQueryChange(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Search by meaning, words, or questions..."
          className="w-full py-4 text-base sm:text-lg text-[#1E2022] placeholder-[#848B94] bg-transparent focus:outline-none"
        />

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 pr-3">
          {/* Clear Button */}
          {query && (
            <button
              onClick={() => {
                onQueryChange('');
                inputRef.current?.focus();
              }}
              aria-label="Clear search input"
              className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          {/* Voice Search Button */}
          <button
            onClick={onOpenVoice}
            aria-label="Voice search input"
            title="Search with Voice (Speech-to-text)"
            className="p-2 text-[#575D65] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-lg transition-colors"
          >
            <Mic className="w-5 h-5" />
          </button>

          {/* Keyboard shortcut hint (Ctrl + K) */}
          <div className="hidden sm:flex items-center px-2 py-1 bg-[#F5F2EB] border border-[#E6E1D7] rounded text-[11px] font-mono text-[#666B70]">
            Ctrl+K
          </div>

          {/* Search Action Button */}
          <button
            onClick={() => onSearch(query)}
            disabled={!query.trim()}
            aria-label="Execute Search"
            className="ml-1 p-2 sm:px-4 sm:py-2 bg-[#2C3036] hover:bg-[#1E2022] disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-medium rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Query Suggestions & Recent Searches Dropdown */}
      {showSuggestions && (recentQueries.length > 0 || filteredSuggestions.length > 0) && (
        <div className="w-full mt-1.5 bg-white border border-[#E6E1D7] rounded-xl shadow-lg overflow-hidden z-20 text-xs text-[#1E2022]">
          {recentQueries.length > 0 && (
            <div className="p-2 border-b border-[#ECE8E0]">
              <span className="text-[10px] font-mono uppercase text-[#848B94] tracking-wider px-2 py-1 block">
                Recent Queries
              </span>
              {recentQueries.slice(0, 3).map((rq, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSelectRecent(rq)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#FAF8F5] flex items-center gap-2 text-[#575D65] hover:text-[#1E2022]"
                >
                  <Clock className="w-3.5 h-3.5 text-[#848B94]" />
                  <span>{rq}</span>
                </button>
              ))}
            </div>
          )}

          {filteredSuggestions.length > 0 && (
            <div className="p-2">
              <span className="text-[10px] font-mono uppercase text-[#848B94] tracking-wider px-2 py-1 block">
                Suggested Inquiries
              </span>
              {filteredSuggestions.slice(0, 4).map((sugg, idx) => (
                <button
                  key={idx}
                  onMouseDown={() => handleSelectRecent(sugg)}
                  className="w-full text-left px-2.5 py-1.5 rounded-md hover:bg-[#FAF8F5] flex items-center gap-2 text-[#1E2022]"
                >
                  <SearchIcon className="w-3.5 h-3.5 text-[#848B94]" />
                  <span>{sugg}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Query Correction Banner (Did You Mean, Section 22) */}
      {typoCorrection && onSearchCorrected && (
        <div className="w-full mt-3 p-3 bg-[#FAF4ED] border border-[#ECD9C5] rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#875026] font-medium">Did you mean:</span>
            <button
              onClick={() => onSearchCorrected(typoCorrection)}
              className="font-bold text-[#1E2022] hover:underline italic font-sans"
            >
              {typoCorrection}
            </button>
            <span className="text-[#848B94]">?</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onSearchCorrected(typoCorrection)}
              className="px-2.5 py-1 bg-[#2C3036] hover:bg-[#1E2022] text-white rounded font-medium text-[11px] transition-colors"
            >
              Search corrected
            </button>
            <button
              onClick={() => onSearch(query)}
              className="px-2.5 py-1 text-[#666B70] hover:text-[#1E2022] rounded hover:bg-[#F3EFE6] text-[11px]"
            >
              Search original
            </button>
          </div>
        </div>
      )}

      {/* Search Mode Segmented Controls (Section 12) */}
      <div className="w-full mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1 p-1 bg-[#F5F2EB] border border-[#E6E1D7] rounded-xl">
          {(
            [
              { id: 'smart', label: 'Smart Search', icon: Sparkles },
              { id: 'exact', label: 'Exact Search', icon: FileSearch },
              { id: 'semantic', label: 'Semantic Search', icon: Layers },
              { id: 'hybrid', label: 'Hybrid Search', icon: SlidersHorizontal },
              { id: 'technical', label: 'Technical Search', icon: Code2 },
            ] as const
          ).map((mode) => {
            const Icon = mode.icon;
            const isSelected = searchMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => onSelectMode(mode.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isSelected
                    ? 'bg-white text-[#1E2022] shadow-xs font-semibold'
                    : 'text-[#666B70] hover:text-[#1E2022]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-[#C87A3E]' : 'text-[#848B94]'}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>

        {/* Adaptive Weights Indicator (Section 14) */}
        {adaptiveWeights && (
          <div className="text-[11px] font-mono text-[#666B70] flex items-center gap-1.5 px-2 py-1 bg-[#FAF8F5] border border-[#E6E1D7] rounded-lg">
            <span className="text-[#848B94]">Adaptive Weights:</span>
            <span className="text-[#1E2022] font-semibold">
              {Math.round(adaptiveWeights.keywordWeight * 100)}% Exact
            </span>
            <span className="text-[#D9D3C7]">/</span>
            <span className="text-[#1E2022] font-semibold">
              {Math.round(adaptiveWeights.semanticWeight * 100)}% Semantic
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

SearchBar.displayName = 'SearchBar';
