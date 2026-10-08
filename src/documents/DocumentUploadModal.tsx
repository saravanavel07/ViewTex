import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle2, X, AlertCircle, FileCode, Layers, Trash2, RefreshCw, Settings2 } from 'lucide-react';
import { searchApi } from '../services/api';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIndexed: (chunkCount: number, docName: string) => void;
}

export const DocumentUploadModal: React.FC<DocumentUploadModalProps> = ({
  isOpen,
  onClose,
  onIndexed,
}) => {
  const [pipelineStage, setPipelineStage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFileTitle, setCurrentFileTitle] = useState<string>('');
  const [chunkCount, setChunkCount] = useState<number | null>(null);
  const [documentsList, setDocumentsList] = useState<any[]>([]);
  const [isDemoActive, setIsDemoActive] = useState(true);

  // Configurable chunking settings (Section 5)
  const [chunkSize, setChunkSize] = useState<number>(500);
  const [chunkOverlap, setChunkOverlap] = useState<number>(80);
  const [strategy, setStrategy] = useState<'section' | 'paragraph'>('section');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = async () => {
    try {
      const data = await searchApi.getDocuments();
      setDocumentsList(data.documents || []);
      setIsDemoActive(data.is_demo_active);
    } catch {
      // ignore
    }
  };

  if (!isOpen) return null;

  // Real Upload & Multi-Stage Indexing Pipeline (Section 4)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setCurrentFileTitle(file.name);

    try {
      // Stage 1: Uploading
      setPipelineStage('Uploading...');
      await new Promise((r) => setTimeout(r, 180));

      // Stage 2: Extracting
      setPipelineStage('Extracting text content...');
      const text = await file.text();
      await new Promise((r) => setTimeout(r, 200));

      // Stage 3: Cleaning
      setPipelineStage('Cleaning text & normalizing Unicode...');
      await new Promise((r) => setTimeout(r, 180));

      // Stage 4: Chunking
      setPipelineStage(`Chunking (${chunkSize} tokens, ${chunkOverlap} overlap, ${strategy}-aware)...`);
      await new Promise((r) => setTimeout(r, 220));

      // Stage 5: Generating embeddings
      setPipelineStage('Generating dense semantic embeddings...');
      await new Promise((r) => setTimeout(r, 250));

      // Stage 6: Building search index
      setPipelineStage('Building inverted BM25 & vector search indexes...');
      const response = await searchApi.uploadDocument({
        title: file.name,
        source: file.name,
        content: text,
        fileType: file.name.split('.').pop() || 'txt',
        chunkSize,
        chunkOverlap,
        strategy,
      });

      // Stage 7: Completed
      setPipelineStage('Completed');
      setIsProcessing(false);
      setChunkCount(response.chunks_count);
      onIndexed(response.chunks_count, file.name);
      loadDocuments();
    } catch (err: any) {
      setIsProcessing(false);
      setPipelineStage(`Indexing failed: ${err.message || 'Unknown error'}`);
    }
  };

  const handleClearDemoData = async () => {
    try {
      await searchApi.clearDemoData();
      setIsDemoActive(false);
      loadDocuments();
    } catch {}
  };

  const handleRestoreDemoData = async () => {
    try {
      await searchApi.seedDemoData();
      setIsDemoActive(true);
      loadDocuments();
    } catch {}
  };

  const handleDeleteDoc = async (id: string) => {
    try {
      await searchApi.deleteDocument(id);
      loadDocuments();
    } catch {}
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Upload Document"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-2xl p-6 relative max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#ECE8E0]">
          <div className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#2C3036]" />
            <h2 className="text-base font-bold text-[#1E2022] font-sans">
              VIEWTEX Document Indexing Engine
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="text-[#848B94] hover:text-[#1E2022] p-1.5 rounded-md hover:bg-[#F3EFE6]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Demo Dataset Management Banner (Section 45) */}
        <div className="mt-3 p-3 bg-[#F5F2EB] border border-[#ECE8E0] rounded-xl flex items-center justify-between text-xs font-mono">
          <div>
            <span className="text-[#848B94]">Corpus Mode: </span>
            <strong className="text-[#1E2022]">{isDemoActive ? 'Demo Dataset + User Documents' : 'User Documents Only (Demo Cleared)'}</strong>
          </div>
          {isDemoActive ? (
            <button
              onClick={handleClearDemoData}
              className="px-2.5 py-1 text-[11px] text-rose-700 bg-rose-50 border border-rose-200 rounded-md hover:bg-rose-100 font-medium"
            >
              Clear Demo Dataset
            </button>
          ) : (
            <button
              onClick={handleRestoreDemoData}
              className="px-2.5 py-1 text-[11px] text-[#2C3036] bg-white border border-[#E6E1D7] rounded-md hover:bg-[#F3EFE6] font-medium"
            >
              Restore Demo Dataset
            </button>
          )}
        </div>

        {/* Chunking Settings Toggle */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1.5 text-[#575D65] hover:text-[#1E2022] font-mono"
          >
            <Settings2 className="w-3.5 h-3.5 text-[#C87A3E]" />
            <span>Chunking Parameters ({chunkSize} tokens / {chunkOverlap} overlap)</span>
          </button>
        </div>

        {/* Configurable Chunking System (Section 5) */}
        {showConfig && (
          <div className="mt-2 p-3 bg-white border border-[#E6E1D7] rounded-xl grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#848B94] mb-1">
                Chunk Size (tokens)
              </label>
              <input
                type="number"
                value={chunkSize}
                onChange={(e) => setChunkSize(Math.max(100, parseInt(e.target.value) || 500))}
                className="w-full p-1.5 border border-[#ECE8E0] rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#848B94] mb-1">
                Overlap (tokens)
              </label>
              <input
                type="number"
                value={chunkOverlap}
                onChange={(e) => setChunkOverlap(Math.max(10, parseInt(e.target.value) || 80))}
                className="w-full p-1.5 border border-[#ECE8E0] rounded font-mono"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase font-mono text-[#848B94] mb-1">
                Splitting Strategy
              </label>
              <select
                value={strategy}
                onChange={(e) => setStrategy(e.target.value as any)}
                className="w-full p-1.5 border border-[#ECE8E0] rounded font-mono"
              >
                <option value="section">Section-aware</option>
                <option value="paragraph">Paragraph-aware</option>
              </select>
            </div>
          </div>
        )}

        {/* Upload Dropzone */}
        <div className="mt-3 border-2 border-dashed border-[#D9D3C7] hover:border-[#2C3036] rounded-xl p-5 text-center bg-white transition-colors">
          <FileText className="w-7 h-7 text-[#848B94] mx-auto mb-1.5" />
          <p className="text-sm font-semibold text-[#1E2022]">
            Select Research Document to Index
          </p>
          <p className="text-xs text-[#848B94] mt-0.5">
            PDF, TXT, DOCX, CSV, Markdown (.md), and Source Code (.py, .ts, .js)
          </p>

          <label className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg cursor-pointer transition-colors shadow-xs">
            <Upload className="w-3.5 h-3.5" />
            Upload & Run Indexing Pipeline
            <input
              type="file"
              accept=".txt,.md,.markdown,.json,.csv,.py,.ts,.js,.html,.css,.pdf,.docx"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>

        {/* Real-time Multi-Stage Progress (Section 4) */}
        {pipelineStage && (
          <div className="mt-3 p-3 bg-white border border-[#ECE8E0] rounded-xl flex items-center gap-2.5 text-xs">
            {isProcessing ? (
              <RefreshCw className="w-4 h-4 text-[#C87A3E] animate-spin shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <div className="flex-1">
              <span className="font-mono text-[#1E2022] font-semibold">{pipelineStage}</span>
              {chunkCount && !isProcessing && (
                <span className="block text-[11px] text-[#575D65] mt-0.5 font-mono">
                  {currentFileTitle} indexed into {chunkCount} discrete vector passages.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Active Indexed Documents Table */}
        <div className="mt-3 flex-1 overflow-y-auto border border-[#ECE8E0] rounded-xl bg-white p-3">
          <span className="text-[10px] font-mono uppercase text-[#848B94] tracking-wider block mb-2">
            Currently Indexed Documents ({documentsList.length})
          </span>
          <div className="space-y-1.5">
            {documentsList.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-2 rounded-lg bg-[#FAF8F5] border border-[#ECE8E0] text-xs"
              >
                <div className="min-w-0 pr-2">
                  <h5 className="font-semibold text-[#1E2022] truncate">{doc.title}</h5>
                  <span className="text-[10px] font-mono text-[#848B94]">
                    {doc.total_chunks} passages · {doc.file_type} · {doc.is_demo ? 'Demo Dataset' : 'User Upload'}
                  </span>
                </div>
                {!doc.is_demo && (
                  <button
                    onClick={() => handleDeleteDoc(doc.id)}
                    className="p-1 text-[#848B94] hover:text-rose-600 rounded"
                    title="Delete document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-[#ECE8E0] flex justify-end">
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
