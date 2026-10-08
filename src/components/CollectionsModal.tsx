import React, { useState } from 'react';
import { X, Bookmark, Plus, Trash2, ExternalLink, Download, Folder } from 'lucide-react';
import { Collection, CollectionItem } from '../search_engine/types';

interface CollectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  collections: Collection[];
  onSelectCollection: (colId: string) => void;
  onCreateCollection: (name: string, description: string) => void;
  onRemoveItem: (colId: string, itemId: string) => void;
  onExportCollection: (colId: string) => void;
}

export const CollectionsModal: React.FC<CollectionsModalProps> = ({
  isOpen,
  onClose,
  collections,
  onSelectCollection,
  onCreateCollection,
  onRemoveItem,
  onExportCollection,
}) => {
  const [activeColId, setActiveColId] = useState<string>(collections[0]?.id || '');
  const [newColName, setNewColName] = useState('');
  const [newColDesc, setNewColDesc] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const currentCollection = collections.find((c) => c.id === activeColId) || collections[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColName.trim()) return;
    onCreateCollection(newColName.trim(), newColDesc.trim() || 'Custom collection');
    setNewColName('');
    setNewColDesc('');
    setIsCreating(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Collections"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                VIEWTEX Collections
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Curated research folders and saved evidence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close collections"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body: Sidebar + Items Area */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Sidebar: Collection Folders */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-[#ECE8E0] bg-[#FAF8F5] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-mono uppercase text-[#848B94]">
                Folders ({collections.length})
              </span>
              <button
                onClick={() => setIsCreating(!isCreating)}
                className="text-xs text-[#1E2022] hover:underline flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> New
              </button>
            </div>

            {isCreating && (
              <form onSubmit={handleCreateSubmit} className="mb-3 p-3 bg-white rounded-lg border border-[#E6E1D7] space-y-2">
                <input
                  type="text"
                  placeholder="Collection name..."
                  value={newColName}
                  onChange={(e) => setNewColName(e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#ECE8E0] rounded focus:outline-none"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Description (optional)..."
                  value={newColDesc}
                  onChange={(e) => setNewColDesc(e.target.value)}
                  className="w-full text-xs p-1.5 border border-[#ECE8E0] rounded focus:outline-none"
                />
                <div className="flex justify-end gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="text-[11px] px-2 py-0.5 text-[#848B94]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[11px] px-2 py-0.5 bg-[#2C3036] text-white rounded font-medium"
                  >
                    Save
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-1 overflow-y-auto flex-1">
              {collections.map((col) => (
                <button
                  key={col.id}
                  onClick={() => setActiveColId(col.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    activeColId === col.id
                      ? 'bg-white text-[#1E2022] shadow-2xs font-semibold'
                      : 'text-[#575D65] hover:bg-[#F3EFE6] hover:text-[#1E2022]'
                  }`}
                >
                  <span className="truncate">{col.name}</span>
                  <span className="text-[10px] font-mono text-[#848B94]">
                    {col.items.length}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Right Main Area: Items List */}
          <div className="flex-1 p-6 overflow-y-auto bg-white flex flex-col">
            {currentCollection ? (
              <>
                <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0] mb-4">
                  <div>
                    <h3 className="text-base font-bold text-[#1E2022]">
                      {currentCollection.name}
                    </h3>
                    <p className="text-xs text-[#848B94]">{currentCollection.description}</p>
                  </div>
                  {currentCollection.items.length > 0 && (
                    <button
                      onClick={() => onExportCollection(currentCollection.id)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs text-[#575D65] hover:text-[#1E2022] border border-[#E6E1D7] rounded-lg hover:bg-[#FAF8F5] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Export Markdown
                    </button>
                  )}
                </div>

                {currentCollection.items.length > 0 ? (
                  <div className="space-y-3">
                    {currentCollection.items.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 bg-[#FAF8F5] border border-[#ECE8E0] rounded-xl hover:border-[#2C3036] transition-colors"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h4 className="text-sm font-bold text-[#1E2022]">{item.title}</h4>
                            <span className="text-[11px] font-mono text-[#848B94]">
                              {item.source} · Saved {item.savedAt}
                            </span>
                            <p className="text-xs text-[#575D65] mt-1.5 line-clamp-2">
                              {item.snippet}
                            </p>
                          </div>
                          <button
                            onClick={() => onRemoveItem(currentCollection.id, item.id)}
                            className="p-1 text-[#848B94] hover:text-rose-600 rounded transition-colors"
                            title="Remove from collection"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-[#848B94]">
                    <Folder className="w-10 h-10 mb-2 stroke-[1.5]" />
                    <p className="text-sm font-medium text-[#1E2022]">This collection is empty</p>
                    <p className="text-xs text-[#848B94] mt-1 max-w-xs">
                      Click the "Save" bookmark button on any search result to curate evidence into this folder.
                    </p>
                  </div>
                )}
              </>
            ) : null}
          </div>
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
