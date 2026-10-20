'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { ThemeId } from '../types';

interface LogoProps {
  className?: string;
  variant?: 'full' | 'compact' | 'icon-only';
  theme?: 'light' | 'dark' | ThemeId;
}

const THEME_STYLES: Record<
  ThemeId,
  {
    emblemBg: string;
    emblemBorder: string;
    emblemShadow: string;
    emblemInnerGlow: string;
    textBase: string;
    textAccent: string;
    badgeBg: string;
    subText: string;
  }
> = {
  'eye-comfort': {
    emblemBg: 'bg-gradient-to-tr from-[#2d1b0e] via-[#1c120a] to-[#3d2714]',
    emblemBorder: 'border-amber-500/40',
    emblemShadow: 'shadow-md shadow-amber-900/30 group-hover:shadow-amber-500/30',
    emblemInnerGlow: 'bg-amber-500/10',
    textBase: 'text-[#2b180a] dark:text-[#fff6ea] group-hover:text-amber-800',
    textAccent: 'bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent',
    badgeBg: 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30',
    subText: 'text-amber-900/60 dark:text-amber-200/60',
  },
  'dark-night': {
    emblemBg: 'bg-gradient-to-tr from-[#050811] via-[#09132b] to-[#140b2d]',
    emblemBorder: 'border-blue-500/50',
    emblemShadow: 'shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/40',
    emblemInnerGlow: 'bg-blue-500/10',
    textBase: 'text-white group-hover:text-blue-400',
    textAccent: 'bg-gradient-to-r from-blue-400 via-indigo-300 to-fuchsia-400 bg-clip-text text-transparent',
    badgeBg: 'bg-blue-500/20 text-cyan-300 border-cyan-500/30',
    subText: 'text-slate-400',
  },
  'nature-emerald': {
    emblemBg: 'bg-gradient-to-tr from-[#041d13] via-[#062b1d] to-[#0d3b28]',
    emblemBorder: 'border-emerald-500/40',
    emblemShadow: 'shadow-md shadow-emerald-900/30 group-hover:shadow-emerald-500/30',
    emblemInnerGlow: 'bg-emerald-500/10',
    textBase: 'text-slate-900 dark:text-emerald-50 group-hover:text-emerald-700',
    textAccent: 'bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent',
    badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/20',
    subText: 'text-emerald-900/60 dark:text-emerald-200/60',
  },
  'minimal-slate': {
    emblemBg: 'bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#334155]',
    emblemBorder: 'border-slate-500/40',
    emblemShadow: 'shadow-md shadow-slate-900/30 group-hover:shadow-slate-400/30',
    emblemInnerGlow: 'bg-slate-400/10',
    textBase: 'text-slate-900 dark:text-slate-100 group-hover:text-slate-700',
    textAccent: 'bg-gradient-to-r from-slate-700 to-slate-900 dark:from-slate-300 dark:to-white bg-clip-text text-transparent',
    badgeBg: 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/20',
    subText: 'text-slate-500 dark:text-slate-400',
  },
  'modern-blue': {
    emblemBg: 'bg-gradient-to-tr from-[#0a1835] via-[#0f285e] to-[#1e1b4b]',
    emblemBorder: 'border-blue-500/40',
    emblemShadow: 'shadow-md shadow-blue-500/30 group-hover:shadow-blue-500/40',
    emblemInnerGlow: 'bg-blue-500/10',
    textBase: 'text-slate-900 dark:text-white group-hover:text-blue-600',
    textAccent: 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 bg-clip-text text-transparent',
    badgeBg: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/20',
    subText: 'text-slate-500 dark:text-slate-400',
  },
};

export function Logo({
  className = '',
  variant = 'full',
  theme: themeProp,
}: LogoProps) {
  // Resolve active theme dynamically from AppContext
  let activeTheme: ThemeId = 'eye-comfort';
  try {
    const app = useApp();
    if (app && app.theme) {
      activeTheme = app.theme;
    }
  } catch {
    // If rendered outside AppProvider
  }

  // Handle explicit theme override if provided (e.g., in dark footer)
  if (themeProp === 'dark') {
    activeTheme = 'dark-night';
  } else if (themeProp && themeProp in THEME_STYLES) {
    activeTheme = themeProp as ThemeId;
  }

  const style = THEME_STYLES[activeTheme] || THEME_STYLES['eye-comfort'];

  return (
    <div className={`flex items-center gap-1.5 sm:gap-3 group select-none shrink-0 ${className}`}>
      {/* Brand Icon Emblem — Dynamic Themed Background */}
      <div
        className={`relative w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl p-0.5 border ${style.emblemBorder} ${style.emblemBg} ${style.emblemShadow} transition-all duration-300 group-hover:scale-105 shrink-0 overflow-hidden`}
      >
        {/* Subtle Ambient Theme Glow */}
        <div className={`absolute inset-0 ${style.emblemInnerGlow} backdrop-blur-[1px]`} />

        {/* 3D Glowing "X" Logo Icon */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/xizmatchi-icon.png"
          alt="Xizmatchi"
          className="relative w-full h-full object-contain p-0.5 sm:p-1 drop-shadow-md select-none transition-transform duration-300 group-hover:scale-110"
          loading="eager"
        />
      </div>

      {/* Typography */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
            <span
              className={`text-lg sm:text-2xl font-black tracking-tight transition-colors ${style.textBase}`}
            >
              Xizmat<span className={style.textAccent}>chi</span>
            </span>
            <span
              className={`hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-widest border transition-colors ${style.badgeBg}`}
            >
              UZ
            </span>
          </div>

          {variant === 'full' && (
            <span
              className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 tracking-wide hidden lg:block transition-colors ${style.subText}`}
            >
              Usta va maishiy xizmatlar
            </span>
          )}
        </div>
      )}
    </div>
  );
}
