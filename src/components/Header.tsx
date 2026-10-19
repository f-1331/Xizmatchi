'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DISTRICTS } from '../data/mockData';
import { Logo } from './Logo';
import {
  Wrench,
  Sparkles,
  MapPin,
  Heart,
  ClipboardList,
  PlusCircle,
  Menu,
  X,
  PhoneCall,
  Search,
  Flame,
  RefreshCw,
  Palette,
  User,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export function Header() {
  const {
    favorites,
    bookings,
    setIsFavoritesOpen,
    setIsMyBookingsOpen,
    setIsAddSpecialistModalOpen,
    setIsThemeModalOpen,
    currentUser,
    setIsAuthModalOpen,
    logout,
    filters,
    setFilters,
    refreshData,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending' || b.status === 'accepted').length;

  const handleDistrictChange = (districtName: string) => {
    setFilters((prev) => ({
      ...prev,
      district: districtName,
    }));
  };

  const handleHeaderRefresh = () => {
    setIsRefreshing(true);
    refreshData(filters.district);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleEmergencyClick = () => {
    setFilters((prev) => ({
      ...prev,
      only24_7: true,
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2 sm:gap-4">
          {/* Logo & District Selector */}
          <div className="flex items-center gap-3 lg:gap-5 shrink-0 min-w-0">
            <a href="#" className="shrink-0">
              <Logo />
            </a>

            {/* Quick District Selector + Refresh (Visible on large desktop) */}
            <div className="hidden 2xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs text-slate-700 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                aria-label="Hududni tanlang"
                value={filters.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="bg-transparent font-medium focus:outline-hidden cursor-pointer text-slate-800"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                    {d.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleHeaderRefresh}
                disabled={isRefreshing}
                title="Saytni yangilash: ushbu tuman bo'yicha xizmatchilarni yangilash"
                className="p-1 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-200/80 transition-colors ml-1 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`} />
              </button>
            </div>
          </div>

          {/* Desktop Navigation (Visible on xl screens: 1280px+) */}
          <nav className="hidden xl:flex items-center gap-5 2xl:gap-6 text-sm font-medium text-slate-600 shrink-0">
            <a
              href="#categories-section"
              className="hover:text-blue-600 transition-colors py-1"
            >
              Kategoriyalar
            </a>
            <a
              href="#services-catalog"
              className="hover:text-blue-600 transition-colors py-1"
            >
              Xizmatlar (38)
            </a>
            <a
              href="#specialists-section"
              className="hover:text-blue-600 transition-colors py-1"
            >
              Barcha ustalar
            </a>
            <button
              onClick={handleEmergencyClick}
              className="flex items-center gap-1.5 text-rose-600 hover:text-rose-700 font-semibold transition-colors py-1 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              24/7 Shoshilinch
            </button>
            <a
              href="#how-it-works"
              className="hover:text-blue-600 transition-colors py-1"
            >
              Qanday ishlaydi?
            </a>
          </nav>

          {/* Header Action Buttons (Never cut off or overflow on any screen) */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Theme Switcher Button */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-amber-600 hover:bg-amber-50 transition-colors border border-transparent hover:border-amber-100 cursor-pointer shrink-0"
              title="Dizayn rejimini almashtirish (Ko'z himoyasi, Tungi rejim, va h.k.)"
              aria-label="Dizayn rejimini tanlash"
            >
              <Palette className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Favorites Button */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-100 shrink-0 cursor-pointer"
              title="Saqlangan ustalar"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-rose-600 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* My Bookings Button */}
            <button
              onClick={() => setIsMyBookingsOpen(true)}
              className="relative flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50 transition-colors border border-slate-200/80 text-xs sm:text-sm font-medium shrink-0 cursor-pointer"
              title="Mening buyurtmalarim"
            >
              <ClipboardList className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden 2xl:inline">Buyurtmalarim</span>
              {pendingBookingsCount > 0 && (
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-600 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800 transition-colors shrink-0 cursor-pointer"
                  title="Mening hisobim"
                >
                  <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-scale-up space-y-2">
                    <div className="pb-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-500">{currentUser.phone}</p>
                      <div className="mt-1 flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-semibold w-fit">
                        <ShieldCheck className="w-3 h-3" /> SMS Tasdiqlangan
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setIsMyBookingsOpen(true);
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <ClipboardList className="w-3.5 h-3.5 text-blue-600" />
                      <span>Buyurtmalarim</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl border border-blue-600/30 text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 transition-colors text-xs sm:text-sm font-semibold shrink-0 cursor-pointer"
                title="Tizimga kirish"
              >
                <User className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="hidden sm:inline">Kirish</span>
              </button>
            )}

            {/* Add Specialist CTA */}
            <button
              onClick={() => setIsAddSpecialistModalOpen(true)}
              className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs sm:text-sm font-semibold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all duration-200 active:scale-95 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4 stroke-[2.2] shrink-0" />
              <span className="hidden lg:inline">Usta bo&apos;lish</span>
              <span className="hidden sm:inline lg:hidden">Usta</span>
            </button>

            {/* Hamburger Button (Visible on all laptops and screens < 1280px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 xl:hidden shrink-0 cursor-pointer"
              aria-label="Menyu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Responsive Drawer Menu for Small Laptops, Tablets, and Phones (< 1280px) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-fade-in shadow-xl">
          {/* User profile section in mobile drawer */}
          {currentUser ? (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-xs text-slate-900">{currentUser.name}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  </div>
                  <span className="text-[11px] text-slate-500">{currentUser.phone}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-white transition-colors"
                title="Chiqish"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <User className="w-4 h-4" />
              <span>Tizimga kirish (SMS orqali)</span>
            </button>
          )}
          <div className="flex items-center gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-500">Hudud:</span>
            <select
              aria-label="Hududni tanlang"
              value={filters.district}
              onChange={(e) => {
                handleDistrictChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent font-semibold text-slate-800 flex-1 focus:outline-hidden"
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                  {d.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                handleHeaderRefresh();
                setMobileMenuOpen(false);
              }}
              className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-1 shrink-0 cursor-pointer"
              title="Yangilash"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="text-[11px]">Yangilash</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <a
              href="#categories-section"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Kategoriyalar
            </a>
            <a
              href="#specialists-section"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Barcha ustalar
            </a>
            <button
              onClick={() => {
                handleEmergencyClick();
                setMobileMenuOpen(false);
              }}
              className="p-3 flex items-center justify-center gap-2 rounded-xl bg-rose-50 text-rose-700 font-semibold text-sm"
            >
              <Flame className="w-4 h-4 text-rose-600 fill-rose-600" />
              24/7 Shoshilinch
            </button>
            <a
              href="#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="p-3 text-center rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-medium text-sm transition-colors"
            >
              Qanday ishlaydi?
            </a>

            {/* Theme switcher button in mobile drawer */}
            <button
              onClick={() => {
                setIsThemeModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="col-span-2 p-3 flex items-center justify-center gap-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-sm transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-amber-600" />
              <span>Dizayn & Ranglarni almashtirish (Ko&apos;z himoyasi, Tungi rejim)</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Yordam telefoni:</span>
            <a
              href="tel:+998712000000"
              className="font-bold text-slate-800 flex items-center gap-1 hover:text-blue-600"
            >
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              +998 (71) 200-00-00
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
