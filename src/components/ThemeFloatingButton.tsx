'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  SunMedium,
  Moon,
  Leaf,
  Feather,
  Palette,
  Eye,
} from 'lucide-react';

export function ThemeFloatingButton() {
  const { theme, setIsThemeModalOpen } = useApp();

  const getThemeDetails = () => {
    switch (theme) {
      case 'eye-comfort':
        return {
          icon: <SunMedium className="w-4 h-4 text-amber-500" />,
          label: "Ko'z himoyasi",
          badgeColor: 'border-amber-300 bg-amber-50 text-amber-900',
        };
      case 'dark-night':
        return {
          icon: <Moon className="w-4 h-4 text-blue-400" />,
          label: "Tungi rejim",
          badgeColor: 'border-slate-700 bg-slate-900 text-slate-100',
        };
      case 'nature-emerald':
        return {
          icon: <Leaf className="w-4 h-4 text-emerald-500" />,
          label: "Shinam Zumrad",
          badgeColor: 'border-emerald-300 bg-emerald-50 text-emerald-900',
        };
      case 'minimal-slate':
        return {
          icon: <Feather className="w-4 h-4 text-slate-400" />,
          label: "Minimal Kulrang",
          badgeColor: 'border-slate-300 bg-slate-100 text-slate-800',
        };
      default:
        return {
          icon: <Palette className="w-4 h-4 text-blue-600" />,
          label: "Klassik Moviy",
          badgeColor: 'border-blue-200 bg-blue-50 text-blue-900',
        };
    }
  };

  const details = getThemeDetails();

  return (
    <div className="hidden md:flex fixed bottom-6 right-6 z-40 animate-fade-in">
      <button
        type="button"
        onClick={() => setIsThemeModalOpen(true)}
        className={`group flex items-center gap-2.5 px-3.5 py-2.5 rounded-full shadow-lg border hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer backdrop-blur-md ${details.badgeColor}`}
        title="Dizayn rejimini almashtirish (Ko'z himoyasi, Tungi rejim, va h.k.)"
      >
        <div className="w-6 h-6 rounded-full bg-white/80 flex items-center justify-center shadow-2xs shrink-0 group-hover:rotate-45 transition-transform">
          {details.icon}
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[10px] text-slate-400 font-bold uppercase leading-none">Dizayn</span>
          <span className="text-xs font-bold leading-tight">{details.label}</span>
        </div>
      </button>
    </div>
  );
}
