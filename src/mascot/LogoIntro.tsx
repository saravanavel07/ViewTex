import React, { useState, useEffect } from 'react';
import { MascotAlien, MascotState } from './MascotAlien';

interface LogoIntroProps {
  onComplete: () => void;
  reducedMotion?: boolean;
}

export const LogoIntro: React.FC<LogoIntroProps> = ({ onComplete, reducedMotion = false }) => {
  // Animation stages:
  // 0: warm background appears
  // 1: small rock gently appears
  // 2: tiny alien drops / sits naturally onto rock
  // 3: alien looks around (curious)
  // 4: alien gives small laugh
  // 5: VIEWTEX wordmark appears
  // 6: subtle search-line passes through logo
  // 7: completed -> transition
  const [stage, setStage] = useState<number>(reducedMotion ? 6 : 0);
  const [mascotState, setMascotState] = useState<MascotState>('idle');

  useEffect(() => {
    if (reducedMotion) {
      const timer = setTimeout(() => onComplete(), 400);
      return () => clearTimeout(timer);
    }

    // Sequence timing (total ~2.4 seconds, swift & premium)
    const t1 = setTimeout(() => setStage(1), 150); // rock appears
    const t2 = setTimeout(() => {
      setStage(2);
      setMascotState('idle');
    }, 450); // alien sits onto rock
    const t3 = setTimeout(() => {
      setStage(3);
      setMascotState('curious');
    }, 900); // alien looks around
    const t4 = setTimeout(() => {
      setStage(4);
      setMascotState('laughing');
    }, 1350); // alien gives small laugh
    const t5 = setTimeout(() => setStage(5), 1750); // wordmark appears
    const t6 = setTimeout(() => {
      setStage(6);
      setMascotState('idle');
    }, 2100); // search line passes through
    const t7 = setTimeout(() => {
      setStage(7);
      onComplete();
    }, 2550); // finish & transition

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
      clearTimeout(t5);
      clearTimeout(t6);
      clearTimeout(t7);
    };
  }, [reducedMotion, onComplete]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="VIEWTEX initialization"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#FAF8F5] transition-opacity duration-500 select-none"
    >
      {/* Skip button for accessibility */}
      <button
        onClick={onComplete}
        className="absolute top-6 right-6 text-xs text-[#848B94] hover:text-[#1E2022] font-mono tracking-wider transition-colors px-3 py-1.5 rounded border border-[#E6E1D7] bg-[#FAF8F5]/80 hover:bg-white"
      >
        Skip [Esc]
      </button>

      <div className="relative flex flex-col items-center justify-center text-center px-4">
        {/* Wordmark (Appears after rock/alien sequence) */}
        <div
          className={`transition-all duration-700 ease-out ${
            stage >= 5
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 -translate-y-4 scale-95'
          }`}
        >
          <div className="relative inline-block overflow-hidden pb-1">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#1E2022] font-sans">
              VIEWTEX
            </h1>

            {/* Stage 6: Search line sweep animation */}
            {stage >= 6 && (
              <div
                className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-[#C87A3E] to-transparent animate-search-sweep"
                aria-hidden="true"
              />
            )}
          </div>
          <p className="text-xs font-mono tracking-widest text-[#666B70] uppercase mt-2">
            Intelligent Hybrid Search
          </p>
        </div>

        {/* Mascot & Rock */}
        <div className="mt-6 relative">
          {/* Rock and Alien animation container */}
          <div
            className={`transition-all duration-500 ease-out ${
              stage >= 1
                ? 'opacity-100 scale-100'
                : 'opacity-0 scale-90 translate-y-3'
            }`}
          >
            <MascotAlien
              state={mascotState}
              size="lg"
              showRock={stage >= 1}
              className={`transition-transform duration-500 ${
                stage === 2
                  ? 'translate-y-0'
                  : stage < 2
                  ? '-translate-y-4 opacity-0'
                  : ''
              }`}
            />
          </div>
        </div>

        {/* Ambient indicator */}
        <div className="mt-8 h-4 flex items-center justify-center">
          <span className="text-[11px] font-mono text-[#848B94] tracking-wide">
            {stage < 3
              ? 'Initializing index...'
              : stage < 5
              ? 'Calibrating reason layer...'
              : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  );
};
