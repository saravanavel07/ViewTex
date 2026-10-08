import React from 'react';

export type MascotState = 'idle' | 'curious' | 'searching' | 'laughing' | 'puzzled';

interface MascotAlienProps {
  state?: MascotState;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showRock?: boolean;
}

export const MascotAlien: React.FC<MascotAlienProps> = ({
  state = 'idle',
  size = 'md',
  className = '',
  onClick,
  showRock = true,
}) => {
  // Dimensions based on size
  const sizeMap = {
    sm: { width: 44, height: 48, viewBox: '0 0 100 110' },
    md: { width: 72, height: 80, viewBox: '0 0 100 110' },
    lg: { width: 110, height: 120, viewBox: '0 0 100 110' },
    xl: { width: 160, height: 175, viewBox: '0 0 100 110' },
  };

  const { width, height, viewBox } = sizeMap[size];

  // Subtle state-based animation classes
  const isLaughing = state === 'laughing';
  const isCurious = state === 'curious';
  const isSearching = state === 'searching';
  const isPuzzled = state === 'puzzled';

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label="VIEWTEX Mascot: Little laughing alien sitting on a rock"
      className={`inline-flex flex-col items-center justify-center select-none transition-transform duration-300 ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''
      } ${className}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          {/* Subtle gradient for the alien body: refined warm graphite/charcoal */}
          <linearGradient id="alienBodyGrad" x1="50" y1="20" x2="50" y2="78" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#3A4048" />
            <stop offset="100%" stopColor="#22252A" />
          </linearGradient>

          {/* Rock gradient: warm natural slate/river pebble */}
          <linearGradient id="rockGrad" x1="50" y1="72" x2="50" y2="105" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#7B838D" />
            <stop offset="50%" stopColor="#565D65" />
            <stop offset="100%" stopColor="#3F444B" />
          </linearGradient>

          {/* Rock top highlight */}
          <linearGradient id="rockRimGrad" x1="20" y1="74" x2="80" y2="74" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#9AA2AC" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#6C737C" stopOpacity="0.2" />
          </linearGradient>

          {/* Gentle shadow under rock */}
          <radialGradient id="groundShadow" cx="50" cy="104" r="42" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1E2022" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Ground contact shadow */}
        {showRock && (
          <ellipse cx="50" cy="103" rx="38" ry="5.5" fill="url(#groundShadow)" />
        )}

        {/* 2. The Minimal Natural Rock */}
        {showRock && (
          <g id="rock-group" className="transition-transform duration-300">
            {/* Main rock body - organic sitting pebble form */}
            <path
              d="M 18,87 C 16,81 22,75 32,74 C 42,73 58,73 68,74 C 78,75 84,81 82,88 C 80,95 72,101 50,101 C 28,101 20,93 18,87 Z"
              fill="url(#rockGrad)"
            />
            {/* Rock facets / minimal geological lines */}
            <path
              d="M 28,76 C 42,74 60,74 72,76"
              stroke="url(#rockRimGrad)"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
            <path
              d="M 24,85 C 36,88 56,87 76,84"
              stroke="#2E3339"
              strokeWidth="1"
              strokeOpacity="0.4"
              strokeLinecap="round"
            />
            <path
              d="M 40,89 C 48,93 54,92 62,90"
              stroke="#22252A"
              strokeWidth="0.8"
              strokeOpacity="0.3"
            />
          </g>
        )}

        {/* 3. The Alien Mascot Group with state-based posture transforms */}
        <g
          id="alien-group"
          className={`origin-[50px_72px] transition-all duration-300 ${
            isLaughing ? 'animate-alien-laugh' : ''
          } ${isCurious ? 'translate-x-1 -rotate-2' : ''} ${
            isPuzzled ? '-translate-y-0.5 rotate-4' : ''
          }`}
          style={{
            transform: isLaughing
              ? 'translate(0px, -1px) rotate(-2deg)'
              : isCurious
              ? 'translate(2px, -1px) rotate(3deg)'
              : isSearching
              ? 'translate(0px, -0.5px) rotate(-1deg)'
              : isPuzzled
              ? 'translate(-1px, -1px) rotate(-4deg)'
              : 'translate(0px, 0px)',
            transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
          }}
        >
          {/* Alien shadow sitting on rock */}
          <ellipse cx="50" cy="74" rx="14" ry="3" fill="#202328" fillOpacity="0.35" />

          {/* Tiny tail / lower back resting curve */}
          <path
            d="M 37,70 C 35,74 38,76 43,76"
            stroke="#22252A"
            strokeWidth="3.2"
            strokeLinecap="round"
          />

          {/* Legs dangling relaxed on rock */}
          {/* Left leg */}
          <path
            d="M 42,67 C 40,72 38,76 39,78 C 40,79 43,79 44,77"
            stroke="#2C3138"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Right leg slightly crossed / resting */}
          <path
            d="M 58,67 C 60,72 62,76 61,78 C 60,79 57,79 56,77"
            stroke="#2A2F36"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
          />
          {/* Tiny cute feet */}
          <ellipse cx="41.5" cy="78" rx="2.5" ry="1.6" fill="#3A4048" />
          <ellipse cx="58.5" cy="78" rx="2.5" ry="1.6" fill="#3A4048" />

          {/* Body: chubby, small, relaxed sitting shape, slightly leaning back */}
          <path
            d="M 39,46 C 35,54 36,68 45,71 C 50,72 55,72 60,69 C 66,66 65,53 61,46 C 58,42 42,42 39,46 Z"
            fill="url(#alienBodyGrad)"
          />

          {/* Soft belly tone */}
          <ellipse cx="50" cy="58" rx="7.5" ry="8" fill="#4B535D" fillOpacity="0.45" />

          {/* Arms */}
          {/* Left arm: resting relaxed or holding rock */}
          <path
            d={
              isLaughing
                ? 'M 38,52 C 34,56 36,62 42,61' // Tucked toward chest while laughing
                : 'M 38,52 C 33,57 32,66 35,71' // Resting down on rock
            }
            stroke="#2C3138"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-200"
          />
          {/* Right arm */}
          <path
            d={
              isLaughing
                ? 'M 62,52 C 66,56 64,62 58,61' // Tucked toward chest laughing
                : 'M 62,52 C 67,57 68,66 65,71' // Resting down
            }
            stroke="#2A2F36"
            strokeWidth="3.4"
            strokeLinecap="round"
            fill="none"
            className="transition-all duration-200"
          />

          {/* Head: Cute, slightly pear-shaped, intelligent-looking */}
          <g
            id="alien-head"
            style={{
              transform: isLaughing
                ? 'translate(0px, -1.5px) rotate(-3deg)'
                : isCurious
                ? 'translate(1px, -1px) rotate(4deg)'
                : isPuzzled
                ? 'translate(-1.5px, 0.5px) rotate(-6deg)'
                : 'translate(0px, 0px)',
              transformOrigin: '50px 42px',
              transition: 'transform 0.25s ease-out',
            }}
          >
            {/* Cute tiny intelligent antenna */}
            <path
              d="M 50,22 C 50,16 53,13 54,11"
              stroke="#3A4048"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            {/* Antenna light / observation node: soft warm golden/amber glow */}
            <circle cx="54.5" cy="10.5" r="3" fill="#E29452" />
            <circle cx="54" cy="9.8" r="1.2" fill="#FFF2E2" />

            {/* Tiny cute soft ear-nubs */}
            <ellipse cx="32" cy="30" rx="3" ry="2" fill="#3A4048" transform="rotate(-25 32 30)" />
            <ellipse cx="68" cy="30" rx="3" ry="2" fill="#3A4048" transform="rotate(25 68 30)" />

            {/* Head oval */}
            <path
              d="M 33,32 C 32,23 40,19 50,19 C 60,19 68,23 67,32 C 66,41 59,45 50,45 C 41,45 34,41 33,32 Z"
              fill="url(#alienBodyGrad)"
            />

            {/* Cheeks highlight */}
            <circle cx="39" cy="35" r="2.2" fill="#E29452" fillOpacity="0.35" />
            <circle cx="61" cy="35" r="2.2" fill="#E29452" fillOpacity="0.35" />

            {/* Eyes */}
            {isLaughing ? (
              // Laughing eyes: Happy curved arcs ^_^
              <g id="eyes-laughing">
                <path
                  d="M 40,29 C 41.5,26.5 45.5,26.5 47,29"
                  stroke="#FAF8F5"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
                <path
                  d="M 53,29 C 54.5,26.5 58.5,26.5 60,29"
                  stroke="#FAF8F5"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </g>
            ) : isPuzzled ? (
              // Puzzled eyes: one slightly higher/wider
              <g id="eyes-puzzled">
                <circle cx="43" cy="28.5" r="3.2" fill="#FAF8F5" />
                <circle cx="43.5" cy="28.5" r="1.6" fill="#1E2022" />
                <circle cx="44.2" cy="27.8" r="0.6" fill="#FFFFFF" />

                <circle cx="57" cy="27" r="3.8" fill="#FAF8F5" />
                <circle cx="56.5" cy="26.8" r="1.8" fill="#1E2022" />
                <circle cx="57.2" cy="26" r="0.8" fill="#FFFFFF" />
              </g>
            ) : (
              // Normal / curious / searching eyes: large, cute, friendly, intelligent
              <g id="eyes-normal">
                {/* Left eye */}
                <ellipse cx="43" cy="28.5" rx="3.4" ry="3.8" fill="#FAF8F5" />
                <circle
                  cx={isCurious ? '44.5' : isSearching ? '44' : '43.2'}
                  cy="28.5"
                  r="1.9"
                  fill="#1E2022"
                />
                <circle cx="44.2" cy="27.4" r="0.8" fill="#FFFFFF" />

                {/* Right eye */}
                <ellipse cx="57" cy="28.5" rx="3.4" ry="3.8" fill="#FAF8F5" />
                <circle
                  cx={isCurious ? '58.5' : isSearching ? '58' : '56.8'}
                  cy="28.5"
                  r="1.9"
                  fill="#1E2022"
                />
                <circle cx="57.8" cy="27.4" r="0.8" fill="#FFFFFF" />
              </g>
            )}

            {/* Mouth */}
            {isLaughing ? (
              // Laughing mouth: open curved joyful crescent with subtle tongue/smile :D
              <g id="mouth-laughing">
                <path
                  d="M 46,34 Q 50,39 54,34 Q 50,33 46,34 Z"
                  fill="#1C1E22"
                />
                <path
                  d="M 48,35.5 Q 50,38 52,35.5"
                  stroke="#E29452"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  fill="#E29452"
                />
              </g>
            ) : isPuzzled ? (
              // Puzzled mouth: tiny tilted 'o'
              <path
                d="M 48.5,35 Q 50,34 51.5,35.5"
                stroke="#FAF8F5"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            ) : isCurious ? (
              // Curious mouth: small soft smile
              <path
                d="M 47,34 Q 50,36.5 53,34"
                stroke="#FAF8F5"
                strokeWidth="1.4"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              // Relaxed friendly smile
              <path
                d="M 46.5,33.5 Q 50,36 53.5,33.5"
                stroke="#FAF8F5"
                strokeWidth="1.5"
                strokeLinecap="round"
                fill="none"
              />
            )}
          </g>
        </g>
      </svg>
    </div>
  );
};
