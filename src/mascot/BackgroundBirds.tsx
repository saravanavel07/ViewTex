import React from 'react';

interface BackgroundBirdsProps {
  reducedMotion?: boolean;
}

export const BackgroundBirds: React.FC<BackgroundBirdsProps> = ({ reducedMotion = false }) => {
  if (reducedMotion) return null;

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-40"
      aria-hidden="true"
    >
      {/* Distant soaring eagle silhouette 1 (gliding upper right to upper left along the edge) */}
      <div className="absolute top-[8%] -right-[50px] animate-bird-left">
        <svg
          width="32"
          height="14"
          viewBox="0 0 64 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#3A4048] opacity-35"
        >
          {/* Subtle aerodynamic soaring eagle silhouette */}
          <path
            d="M 2,12 C 14,8 24,14 32,17 C 40,14 50,8 62,12 C 48,15 38,22 32,26 C 26,22 16,15 2,12 Z"
            fill="currentColor"
          />
          {/* Feather tip notches */}
          <path
            d="M 4,11 L 1,12 L 5,14"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
          <path
            d="M 60,11 L 63,12 L 59,14"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeLinecap="round"
          />
        </svg>
      </div>

      {/* Distant soaring vulture silhouette 2 (gliding lower left to mid right along the bottom edge) */}
      <div className="absolute bottom-[16%] -left-[50px] animate-bird-right">
        <svg
          width="26"
          height="12"
          viewBox="0 0 52 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#4F555E] opacity-25"
        >
          {/* Broad thermal glider silhouette */}
          <path
            d="M 1,10 C 12,6 20,12 26,14 C 32,12 40,6 51,10 C 39,13 31,19 26,22 C 21,19 13,13 1,10 Z"
            fill="currentColor"
          />
        </svg>
      </div>

      {/* Tiny distant soaring silhouette 3 near top left corner */}
      <div
        className="absolute top-[18%] left-[6%] opacity-20"
        style={{
          animation: 'birdGlideLeft 110s linear infinite reverse',
          transform: 'scale(0.5)',
        }}
      >
        <svg
          width="20"
          height="9"
          viewBox="0 0 40 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-[#454B54]"
        >
          <path
            d="M 1,8 C 9,5 15,9 20,11 C 25,9 31,5 39,8 C 30,10 24,14 20,16 C 16,14 10,10 1,8 Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  );
};
