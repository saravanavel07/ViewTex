import React from 'react';
import { MascotAlien, MascotState } from './MascotAlien';

interface ViewtexLogoProps {
  layout?: 'stacked' | 'horizontal' | 'compact';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  mascotState?: MascotState;
  showSubtitle?: boolean;
  onMascotClick?: () => void;
  className?: string;
}

export const ViewtexLogo: React.FC<ViewtexLogoProps> = ({
  layout = 'stacked',
  size = 'md',
  mascotState = 'idle',
  showSubtitle = false,
  onMascotClick,
  className = '',
}) => {
  if (layout === 'horizontal') {
    return (
      <div className={`inline-flex items-center gap-3 select-none ${className}`}>
        <MascotAlien
          state={mascotState}
          size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'}
          onClick={onMascotClick}
        />
        <div className="flex flex-col">
          <span className="font-bold tracking-tight text-[#1E2022] font-sans text-xl leading-none">
            VIEWTEX
          </span>
          {showSubtitle && (
            <span className="text-[10px] tracking-wider text-[#666B70] uppercase mt-1 font-mono">
              Intelligent Search
            </span>
          )}
        </div>
      </div>
    );
  }

  if (layout === 'compact') {
    return (
      <div className={`inline-flex items-center gap-2 select-none ${className}`}>
        <MascotAlien state={mascotState} size="sm" onClick={onMascotClick} />
        <span className="font-bold tracking-tight text-[#1E2022] font-sans text-lg">
          VIEWTEX
        </span>
      </div>
    );
  }

  // Preferred Stacked Composition (Section 4):
  //       VIEWTEX
  //  [small alien] sitting on rock
  return (
    <div className={`inline-flex flex-col items-center select-none text-center ${className}`}>
      {/* Brand Wordmark */}
      <h1 className="font-bold tracking-tight text-[#1E2022] font-sans leading-none text-3xl sm:text-4xl md:text-5xl">
        VIEWTEX
      </h1>

      {/* Mascot: Small cute alien sitting naturally on rock */}
      <div className="mt-3 relative">
        <MascotAlien
          state={mascotState}
          size={size === 'hero' ? 'lg' : size === 'lg' ? 'md' : 'md'}
          onClick={onMascotClick}
        />
      </div>

      {showSubtitle && (
        <p className="mt-3 text-xs tracking-wider uppercase text-[#666B70] font-mono">
          Intelligent Hybrid Search
        </p>
      )}
    </div>
  );
};
