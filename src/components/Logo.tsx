import React from 'react';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark';
}

export function Logo({
  className = '',
  variant = 'full',
  theme = 'light',
}: LogoProps) {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-3 group select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div className="relative w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 p-0.5 shadow-md shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30 group-hover:scale-105 transition-all duration-300 shrink-0">
        <div className="w-full h-full rounded-[10px] sm:rounded-[14px] bg-slate-950/20 backdrop-blur-xs flex items-center justify-center text-white">
          <svg
            className="w-5 h-5 sm:w-6 sm:h-6"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Modern stylized X + House/Roof + Checkmark emblem */}
            <path
              d="M16 3L4 12V27C4 28.1046 4.89543 29 6 29H26C27.1046 29 28 28.1046 28 27V12L16 3Z"
              fill="white"
              fillOpacity="0.15"
            />
            {/* Left Diagonal Wing of X */}
            <path
              d="M8.5 10L14 17L9 24"
              stroke="white"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Right Diagonal Wing with dynamic Checkmark */}
            <path
              d="M23.5 10L14 21.5L10 17.5"
              stroke="#34D399"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Sparkle badge */}
            <circle cx="23" cy="8" r="2.5" fill="#FBBF24" />
          </svg>
        </div>
      </div>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span
              className={`text-xl sm:text-2xl font-black tracking-tight transition-colors ${
                isDark
                  ? 'text-white group-hover:text-blue-400'
                  : 'text-slate-900 group-hover:text-blue-600'
              }`}
            >
              Xizmat<span className="text-blue-600">chi</span>
            </span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 uppercase tracking-widest">
              UZ
            </span>
          </div>

          {variant === 'full' && (
            <span
              className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-wide hidden lg:block ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}
            >
              Usta va maishiy xizmatlar
            </span>
          )}
        </div>
      )}
    </div>
  );
}
