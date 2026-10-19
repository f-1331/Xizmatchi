'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { Flame, PhoneCall, ArrowRight } from 'lucide-react';

export function EmergencyBanner() {
  const { setFilters } = useApp();
  const { t } = useLanguage();

  const handleShowEmergency = () => {
    setFilters((prev) => ({
      ...prev,
      only24_7: true,
      sortBy: 'recommended',
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-900 via-red-800 to-amber-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl my-8 border border-rose-700/50">
      {/* Decorative Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-md">
            <Flame className="w-8 h-8 text-amber-400 fill-amber-400 animate-bounce" />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/30 text-rose-200 border border-rose-400/30 text-xs font-bold uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping" />
              {t('emergency.title')}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Favqulodda holatmi? Suv toshishi, qisqa tutashuv yoki qulf buzildimi?
            </h3>
            <p className="text-xs sm:text-sm text-rose-100 max-w-2xl leading-relaxed">
              {t('emergency.desc')}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handleShowEmergency}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white text-rose-900 font-extrabold text-sm sm:text-base hover:bg-rose-50 transition-all shadow-lg shadow-black/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
          >
            <span>{t('emergency.call_now')}</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5]" />
          </button>

          <a
            href="tel:+998712000000"
            className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-rose-950/60 hover:bg-rose-950/80 border border-white/20 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-amber-300" />
            <span>(71) 200-00-00</span>
          </a>
        </div>
      </div>
    </div>
  );
}
