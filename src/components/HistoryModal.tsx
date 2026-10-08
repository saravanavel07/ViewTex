import React from 'react';
import { X, History, Trash2, Search, ArrowRight } from 'lucide-react';
import { HistoryItem } from '../search_engine/types';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSearchAgain: (query: string, mode: string) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSearchAgain,
  onDeleteItem,
  onClearAll,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search History"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                VIEWTEX Search History
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Chronological query log with mode metrics
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {history.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-rose-600 hover:text-rose-700 font-mono hover:underline px-2 py-1"
              >
                Clear all
              </button>
            )}
            <button
              onClick={onClose}
              aria-label="Close history"
              className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* History List */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {history.length > 0 ? (
            history.map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white border border-[#E6E1D7] rounded-xl flex items-center justify-between gap-3 hover:border-[#2C3036] transition-colors group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-sm text-[#1E2022] truncate block font-sans">
                      {item.query}
                    </span>
                    <span className="text-[10px] font-mono uppercase bg-[#F5F2EB] text-[#575D65] px-1.5 py-0.5 rounded shrink-0">
                      {item.mode}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#848B94] font-mono">
                    <span>{item.timestamp}</span>
                    <span>·</span>
                    <span>{item.resultCount} results</span>
                    {item.topResultTitle && (
                      <>
                        <span>·</span>
                        <span className="truncate max-w-[200px]">Top: {item.topResultTitle}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      onSearchAgain(item.query, item.mode);
                      onClose();
                    }}
                    className="p-2 text-[#575D65] hover:text-[#1E2022] hover:bg-[#F5F2EB] rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Search again"
                  >
                    <Search className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Search</span>
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-[#848B94] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-[#848B94]">
              <History className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm font-medium text-[#1E2022]">No search history yet</p>
              <p className="text-xs text-[#848B94] mt-1">
                Your past search queries will appear here chronologically.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
