'use client';

import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../data/themes';
import { ThemeId } from '../types';
import {
  X,
  Check,
  SunMedium,
  Moon,
  Leaf,
  Feather,
  Palette,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export function ThemeModal() {
  const { theme, setTheme, isThemeModalOpen, setIsThemeModalOpen } = useApp();

  // Lock body scroll when theme modal is open
  useEffect(() => {
    if (!isThemeModalOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isThemeModalOpen]);

  if (!isThemeModalOpen) return null;

  const getThemeIcon = (iconName: string) => {
    switch (iconName) {
      case 'SunMedium':
        return <SunMedium className="w-5 h-5" />;
      case 'Moon':
        return <Moon className="w-5 h-5" />;
      case 'Leaf':
        return <Leaf className="w-5 h-5" />;
      case 'Feather':
        return <Feather className="w-5 h-5" />;
      default:
        return <Palette className="w-5 h-5" />;
    }
  };

  const handleSelectTheme = (newTheme: ThemeId) => {
    setTheme(newTheme);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in overscroll-none"
      onClick={() => setIsThemeModalOpen(false)}
    >
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/90 animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - permanently docked at the top */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/10 text-amber-300 shrink-0">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Dizayn & Ranglar rejimini tanlang
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Ko&apos;zingizga qulay va charchatmaydigan 5 ta zamonaviy ko&apos;rinish
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content list - scrollable with flex-1 min-h-0 */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-3.5 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {THEMES.map((item) => {
            const isSelected = theme === item.id;

            return (
              <div
                key={item.id}
                onClick={() => handleSelectTheme(item.id)}
                className={`group relative p-3.5 sm:p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/50 shadow-md ring-2 ring-blue-500/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                {/* Left: Icon & Title */}
                <div className="flex items-start gap-3.5 flex-1">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs transition-transform group-hover:scale-105 ${
                      isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {getThemeIcon(item.iconName)}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm sm:text-base">
                        {item.name}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                          item.id === 'eye-comfort'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : item.id === 'dark-night'
                            ? 'bg-slate-800 text-slate-200 border border-slate-700'
                            : item.id === 'nature-emerald'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium leading-relaxed">
                      {item.tagline}
                    </p>

                    <p className="text-[11px] text-slate-400 leading-normal">
                      {item.description}
                    </p>
                  </div>
                </div>

                {/* Right: Visual Color Swatch & Selection Indicator */}
                <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {/* Miniature swatch preview */}
                  <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 shrink-0">
                    <span
                      className={`w-5 h-5 rounded-lg shadow-2xs border border-black/10 ${item.previewBg}`}
                      title="Asosiy fon"
                    />
                    <span
                      className={`w-5 h-5 rounded-lg shadow-2xs border border-black/10 ${item.previewCard}`}
                      title="Karta foni"
                    />
                    <span
                      className={`w-5 h-5 rounded-lg shadow-2xs ${item.previewAccent}`}
                      title="Aksent rang"
                    />
                  </div>

                  {/* Radio / Check button */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : 'border-2 border-slate-300 text-transparent group-hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Info - shrink-0 */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tanlangan rejim xotirada saqlanadi va doimiy amal qiladi</span>
          </div>

          <button
            onClick={() => setIsThemeModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
          >
            Tayyor (Yopish)
          </button>
        </div>
      </div>
    </div>
  );
}
