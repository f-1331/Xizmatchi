'use client';

import React from 'react';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { Globe } from 'lucide-react';

export function LanguageFloatingButton() {
  const { lang, setIsLangModalOpen } = useLanguage();
  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-30 animate-fade-in">
      <button
        type="button"
        onClick={() => setIsLangModalOpen(true)}
        className="group flex items-center gap-2 px-3 py-2 sm:px-3.5 sm:py-2.5 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-slate-200/90 hover:border-blue-500 hover:bg-blue-50/50 hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer text-slate-800"
        title="Tilni o'zgartirish / Сменить язык / Change Language"
      >
        <div className="w-6 h-6 rounded-full bg-blue-100/80 text-blue-600 flex items-center justify-center shrink-0 group-hover:rotate-45 transition-transform">
          <Globe className="w-3.5 h-3.5" />
        </div>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className="text-sm sm:text-base leading-none">{currentLangObj.flag}</span>
          <span className="font-extrabold uppercase text-[11px] sm:text-xs text-blue-700">{currentLangObj.short}</span>
          <span className="hidden sm:inline text-[11px] text-slate-600 font-semibold">• Til</span>
        </div>
      </button>
    </div>
  );
}
