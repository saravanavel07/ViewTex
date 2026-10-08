import React, { useEffect } from 'react';
import { Mic, MicOff, RotateCcw, X, Check, Volume2, AlertCircle } from 'lucide-react';
import { useVoiceSearch } from './useVoiceSearch';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (spokenText: string) => void;
  autoSubmitEnabled?: boolean;
}

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  autoSubmitEnabled = false,
}) => {
  const {
    voiceState,
    transcript,
    setTranscript,
    errorMessage,
    isSupported,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceSearch();

  useEffect(() => {
    if (isOpen) {
      startListening();
    } else {
      stopListening();
    }
  }, [isOpen, startListening, stopListening]);

  // Handle auto-submit if enabled and transcript is ready
  useEffect(() => {
    if (autoSubmitEnabled && voiceState === 'ready' && transcript.trim()) {
      const timer = setTimeout(() => {
        onSubmit(transcript.trim());
        onClose();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [autoSubmitEnabled, voiceState, transcript, onSubmit, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Voice Search"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1E2022]/40 backdrop-blur-xs"
    >
      <div className="bg-[#FAF8F5] border border-[#E6E1D7] rounded-xl shadow-xl w-full max-w-lg p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close voice search"
          className="absolute top-4 right-4 text-[#848B94] hover:text-[#1E2022] p-1.5 rounded-md hover:bg-[#F3EFE6] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title & Status */}
        <div className="flex items-center gap-2 mb-4">
          <Volume2 className="w-5 h-5 text-[#2C3036]" />
          <h2 className="text-lg font-semibold text-[#1E2022] font-sans">
            VIEWTEX Voice Search
          </h2>
        </div>

        {/* Status Banner */}
        <div className="py-3 px-4 rounded-lg bg-[#F5F2EB] border border-[#ECE8E0] mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                voiceState === 'listening'
                  ? 'bg-amber-600 animate-pulse'
                  : voiceState === 'processing'
                  ? 'bg-blue-600 animate-pulse'
                  : voiceState === 'ready'
                  ? 'bg-emerald-600'
                  : 'bg-rose-500'
              }`}
            />
            <span className="text-sm font-medium text-[#1E2022]">
              {voiceState === 'listening' && 'Listening...'}
              {voiceState === 'processing' && 'Processing...'}
              {voiceState === 'ready' && 'Voice input ready'}
              {voiceState === 'error' && 'Input note'}
              {voiceState === 'idle' && 'Microphone standby'}
            </span>
          </div>

          {!isSupported && (
            <span className="text-xs text-[#848B94] font-mono">
              Using simulated fallback engine
            </span>
          )}
        </div>

        {/* Audio Wave Visualizer Animation */}
        <div className="h-14 flex items-center justify-center gap-1.5 my-3">
          {[20, 45, 75, 95, 60, 80, 40, 25, 70, 85, 30].map((height, idx) => (
            <div
              key={idx}
              className={`w-1 rounded-full bg-[#2C3036] transition-all duration-150 ${
                voiceState === 'listening' ? 'opacity-85' : 'opacity-20'
              }`}
              style={{
                height:
                  voiceState === 'listening'
                    ? `${Math.max(8, (height * Math.sin((idx + 1) * 0.8) + height) / 2)}%`
                    : '6px',
              }}
            />
          ))}
        </div>

        {/* Editable Transcript Area */}
        <div className="mt-4">
          <label className="block text-xs font-medium text-[#666B70] uppercase tracking-wider mb-1.5">
            Recognized Transcript (Editable)
          </label>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Speak now, or type here to refine..."
            rows={3}
            className="w-full p-3 text-sm bg-white border border-[#E6E1D7] rounded-lg text-[#1E2022] focus:outline-none focus:ring-1 focus:ring-[#2C3036] focus:border-[#2C3036] resize-none"
          />
        </div>

        {errorMessage && (
          <div className="mt-2 text-xs text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-md flex items-start gap-1.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Controls Bar */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#ECE8E0]">
          <div className="flex items-center gap-2">
            {voiceState === 'listening' ? (
              <button
                onClick={stopListening}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#1E2022] bg-[#ECE8E0] hover:bg-[#E2DDD3] rounded-md transition-colors"
              >
                <MicOff className="w-3.5 h-3.5" />
                Stop
              </button>
            ) : (
              <button
                onClick={startListening}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#2C3036] hover:bg-[#1E2022] rounded-md transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                Listen Again
              </button>
            )}

            <button
              onClick={clearTranscript}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[#666B70] hover:text-[#1E2022] hover:bg-[#F3EFE6] rounded-md transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-medium text-[#666B70] hover:text-[#1E2022]"
            >
              Cancel
            </button>
            <button
              disabled={!transcript.trim()}
              onClick={() => {
                if (transcript.trim()) {
                  onSubmit(transcript.trim());
                  onClose();
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-[#2C3036] hover:bg-[#1E2022] disabled:opacity-40 disabled:cursor-not-allowed rounded-md transition-colors shadow-xs"
            >
              <Check className="w-3.5 h-3.5" />
              Search With Transcript
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
