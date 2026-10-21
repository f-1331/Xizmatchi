'use client';

import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/translations';
import {
  X,
  Globe,
  Check,
  ShieldCheck,
} from 'lucide-react';

interface LanguageDetail {
  code: Language;
  label: string;
  nativeName: string;
  region: string;
  flag: string;
  short: string;
}

const LANGUAGE_DETAILS: LanguageDetail[] = [
  {
    code: 'uz',
    label: "O'zbekcha",
    nativeName: "O'zbek tili (Lotin)",
    region: "O'zbekiston Respublikasi",
    flag: '🇺🇿',
    short: 'UZ',
  },
  {
    code: 'kaa',
    label: 'Qaraqalpaqsha',
    nativeName: 'Qaraqalpaq tili',
    region: "Qaraqalpaqstan Respublikası",
    flag: '🇺🇿',
    short: 'KAA',
  },
  {
    code: 'ru',
    label: 'Русский',
    nativeName: 'Русский язык',
    region: 'Россия и страны СНГ',
    flag: '🇷🇺',
    short: 'RU',
  },
  {
    code: 'en',
    label: 'English',
    nativeName: 'English (US / UK)',
    region: 'International / Global',
    flag: '🇬🇧',
    short: 'EN',
  },
  {
    code: 'tr',
    label: 'Türkçe',
    nativeName: 'Türkçe',
    region: 'Türkiye Cumhuriyeti',
    flag: '🇹🇷',
    short: 'TR',
  },
  {
    code: 'kk',
    label: 'Қазақша',
    nativeName: 'Қазақ тілі',
    region: 'Қазақстан Республикасы',
    flag: '🇰🇿',
    short: 'KK',
  },
  {
    code: 'tg',
    label: 'Тоҷикӣ',
    nativeName: 'Забони тоҷикӣ',
    region: 'Ҷумҳурии Тоҷикистон',
    flag: '🇹🇯',
    short: 'TG',
  },
  {
    code: 'ar',
    label: 'العربية',
    nativeName: 'اللغة العربية الفصحى',
    region: 'العالم العربي والشرق الأوسط (RTL)',
    flag: '🇸🇦',
    short: 'AR',
  },
];

export function LanguageModal() {
  const { lang, setLang, isLangModalOpen, setIsLangModalOpen, t } = useLanguage();

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isLangModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLangModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLangModalOpen, setIsLangModalOpen]);

  // Lock body scroll when language modal is open
  useEffect(() => {
    if (!isLangModalOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isLangModalOpen]);

  if (!isLangModalOpen) return null;

  const handleSelectLanguage = (code: Language) => {
    setLang(code);
    setTimeout(() => {
      setIsLangModalOpen(false);
    }, 180);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 md:p-6 animate-fade-in overscroll-none"
      onClick={() => setIsLangModalOpen(false)}
    >
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-slate-200/90 animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-xs border border-white/20 text-blue-300 shrink-0">
              <Globe className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-tight">
                  Tilni tanlang / Select Language
                </h3>
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                8 ta xalqaro va mintaqaviy tillar mavjud
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsLangModalOpen(false)}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Grid */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {LANGUAGE_DETAILS.map((item) => {
              const isSelected = lang === item.code;

              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectLanguage(item.code)}
                  className={`group relative p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-600/20 shadow-md shadow-blue-500/10'
                      : 'bg-slate-50/80 hover:bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-3xl shrink-0 drop-shadow-xs">{item.flag}</span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-slate-900 text-sm leading-tight truncate">
                          {item.nativeName}
                        </h4>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded-md bg-blue-600 text-white text-[10px] font-bold">
                            Faol
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        {item.region}
                      </p>
                    </div>
                  </div>

                  {/* Radio / Selection Indicator */}
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs scale-105'
                        : 'border-2 border-slate-300 text-transparent group-hover:border-slate-400'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-5 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Tanlangan til xotirada saqlanadi va butun saytga qo&apos;llaniladi</span>
          </div>

          <button
            onClick={() => setIsLangModalOpen(false)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-colors cursor-pointer text-center"
          >
            {t('theme.done_close', 'Tayyor (Yopish)')}
          </button>
        </div>
      </div>
    </div>
  );
}
