'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Home,
  Wrench,
  Users,
  ClipboardList,
  Palette,
  SunMedium,
  Moon,
  Leaf,
  Feather,
} from 'lucide-react';

export function MobileBottomNav() {
  const {
    bookings,
    setIsMyBookingsOpen,
    setIsThemeModalOpen,
    theme,
  } = useApp();

  const pendingCount = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted').length;

  const scrollToSection = (id: string) => {
    if (id === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case 'eye-comfort':
        return <SunMedium className="w-5 h-5 text-amber-500" />;
      case 'dark-night':
        return <Moon className="w-5 h-5 text-blue-400" />;
      case 'nature-emerald':
        return <Leaf className="w-5 h-5 text-emerald-500" />;
      case 'minimal-slate':
        return <Feather className="w-5 h-5 text-slate-400" />;
      default:
        return <Palette className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl md:hidden pb-safe">
      <div className="grid grid-cols-5 h-16 items-center px-1">
        {/* Home */}
        <button
          type="button"
          onClick={() => scrollToSection('top')}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer py-1"
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Asosiy</span>
        </button>

        {/* Services Catalog */}
        <button
          type="button"
          onClick={() => scrollToSection('services-catalog')}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer py-1"
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-bold">Xizmatlar</span>
        </button>

        {/* Specialists */}
        <button
          type="button"
          onClick={() => scrollToSection('specialists-section')}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer py-1"
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px] font-bold">Ustalar</span>
        </button>

        {/* My Bookings */}
        <button
          type="button"
          onClick={() => setIsMyBookingsOpen(true)}
          className="relative flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer py-1"
        >
          <div className="relative">
            <ClipboardList className="w-5 h-5" />
            {pendingCount > 0 && (
              <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-blue-600 text-white text-[9px] font-bold flex items-center justify-center shadow-xs">
                {pendingCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Buyurtma</span>
        </button>

        {/* Theme Switcher */}
        <button
          type="button"
          onClick={() => setIsThemeModalOpen(true)}
          className="flex flex-col items-center justify-center gap-1 text-slate-600 hover:text-blue-600 active:scale-95 transition-all cursor-pointer py-1"
          title="Dizayn rejimini almashtirish"
        >
          {getThemeIcon()}
          <span className="text-[10px] font-bold">Dizayn</span>
        </button>
      </div>
    </nav>
  );
}
