import React from 'react';
import { X, Settings, Sliders, Volume2, Moon, Eye, ShieldCheck, Zap } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  autoSubmitVoice: boolean;
  onToggleAutoSubmitVoice: () => void;
  reducedMotion: boolean;
  onToggleReducedMotion: () => void;
  developerMetrics: boolean;
  onToggleDeveloperMetrics: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  autoSubmitVoice,
  onToggleAutoSubmitVoice,
  reducedMotion,
  onToggleReducedMotion,
  developerMetrics,
  onToggleDeveloperMetrics,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#E6E1D7] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#2C3036]" />
            <div>
              <h2 className="text-base font-bold text-[#1E2022] font-sans">
                VIEWTEX Preferences
              </h2>
              <p className="text-xs text-[#666B70] font-mono">
                Engine & Accessibility Controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-1.5 text-[#848B94] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings List */}
        <div className="p-6 overflow-y-auto space-y-4">
          {/* 1. Voice Auto-Submit */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E1D7] rounded-xl">
            <div className="pr-4">
              <h4 className="text-sm font-semibold text-[#1E2022]">Auto-Submit Voice Inquiries</h4>
              <p className="text-xs text-[#575D65] mt-0.5">
                Automatically execute search once speech transcription settles instead of waiting for manual review.
              </p>
            </div>
            <button
              onClick={onToggleAutoSubmitVoice}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                autoSubmitVoice ? 'bg-[#2C3036]' : 'bg-[#D9D3C7]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  autoSubmitVoice ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 2. Reduced Motion (Section 5 Accessibility) */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E1D7] rounded-xl">
            <div className="pr-4">
              <h4 className="text-sm font-semibold text-[#1E2022]">Reduced Motion Mode</h4>
              <p className="text-xs text-[#575D65] mt-0.5">
                Minimizes mascot animations, disables background soaring bird motion, and skips launch transitions.
              </p>
            </div>
            <button
              onClick={onToggleReducedMotion}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                reducedMotion ? 'bg-[#2C3036]' : 'bg-[#D9D3C7]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  reducedMotion ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* 3. Developer IR Metrics Display */}
          <div className="flex items-center justify-between p-3.5 bg-white border border-[#E6E1D7] rounded-xl">
            <div className="pr-4">
              <h4 className="text-sm font-semibold text-[#1E2022]">Developer IR Metrics Overlay</h4>
              <p className="text-xs text-[#575D65] mt-0.5">
                Exposes sub-millisecond pipeline latency breakdowns and NDCG metrics alongside live search results.
              </p>
            </div>
            <button
              onClick={onToggleDeveloperMetrics}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${
                developerMetrics ? 'bg-[#2C3036]' : 'bg-[#D9D3C7]'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${
                  developerMetrics ? 'left-6' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Architectural Notes */}
          <div className="p-3 bg-[#FAF8F5] border border-[#ECE8E0] rounded-xl text-xs font-mono text-[#666B70]">
            <p><strong>Environment:</strong> In-memory hybrid vector & BM25 engine with zero tracking telemetry.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E6E1D7] bg-white flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2C3036] hover:bg-[#1E2022] text-white text-xs font-medium rounded-lg transition-colors"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
