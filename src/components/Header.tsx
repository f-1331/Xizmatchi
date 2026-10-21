'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage, LANGUAGES } from '../context/LanguageContext';
import { DISTRICTS } from '../data/mockData';
import { Logo } from './Logo';
import {
  Wrench,
  MapPin,
  Heart,
  ClipboardList,
  PlusCircle,
  Menu,
  X,
  PhoneCall,
  Flame,
  RefreshCw,
  Palette,
  User,
  LogOut,
  ShieldCheck,
  Layers,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  Globe,
  Check,
  QrCode,
} from 'lucide-react';

export function Header() {
  const {
    favorites,
    bookings,
    setIsFavoritesOpen,
    setIsMyBookingsOpen,
    setIsAddSpecialistModalOpen,
    setIsThemeModalOpen,
    setIsQrModalOpen,
    currentUser,
    setIsAuthModalOpen,
    logout,
    filters,
    setFilters,
    refreshData,
  } = useApp();

  const { lang, setLang, t } = useLanguage();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const currentLangObj = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  const pendingBookingsCount = bookings.filter(
    (b) => b.status === 'pending' || b.status === 'accepted'
  ).length;

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

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
      {/* TIER 1: Main Logo & Action Bar */}
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8 w-full">
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-2 w-full">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 min-w-0">
            <a href="#" className="shrink-0 flex items-center">
              <Logo />
            </a>

            {/* Quick District Selector (Visible on desktops: 1280px+) */}
            <div className="hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/90 border border-slate-200 text-xs text-slate-700 shrink-0 max-w-[210px]">
              <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <select
                aria-label="Hududni tanlang"
                value={filters.district}
                onChange={(e) => handleDistrictChange(e.target.value)}
                className="bg-transparent font-medium focus:outline-hidden cursor-pointer text-slate-800 truncate"
              >
                {DISTRICTS.map((d) => (
                  <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                    {d.id === 'all' ? t('nav.all_districts') : d.name}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleHeaderRefresh}
                disabled={isRefreshing}
                title={t('nav.refresh')}
                className="p-1 rounded-full text-slate-500 hover:text-blue-600 hover:bg-slate-200/80 transition-colors ml-0.5 cursor-pointer shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Links (Visible on 1280px+ large screens) */}
          <nav className="hidden xl:flex items-center gap-4 2xl:gap-6 text-xs xl:text-sm font-semibold text-slate-600 shrink-0">
            <a
              href="#categories-section"
              className="hover:text-blue-600 transition-colors py-1"
            >
              {t('nav.categories')}
            </a>
            <a
              href="#services-catalog"
              className="hover:text-blue-600 transition-colors py-1"
            >
              {t('nav.services')}
            </a>
            <a
              href="#specialists-section"
              className="hover:text-blue-600 transition-colors py-1"
            >
              {t('nav.specialists')}
            </a>
            <button
              onClick={handleEmergencyClick}
              className="flex items-center gap-1 text-rose-600 hover:text-rose-700 font-bold transition-colors py-1 cursor-pointer"
            >
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <span>{t('nav.emergency_24_7')}</span>
            </button>
            <a
              href="#how-it-works"
              className="hover:text-blue-600 transition-colors py-1"
            >
              {t('nav.how_it_works')}
            </a>
          </nav>

          {/* Action Buttons: Responsive & Always Visible */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-auto">
            {/* Language Switcher (Desktop & Tablet) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 hover:border-blue-400 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors cursor-pointer shrink-0 shadow-2xs"
                title="Tilni almashtirish / Сменить язык / Change language"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span className="text-xs sm:text-sm">{currentLangObj.flag}</span>
                <span className="uppercase text-xs font-black">{currentLangObj.short}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0 hidden sm:inline" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1.5 w-44 max-h-80 overflow-y-auto overscroll-contain rounded-2xl bg-white border border-slate-200 shadow-2xl p-1.5 z-50 animate-scale-up space-y-1">
                  {LANGUAGES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLang(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        lang === l.code
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span>{l.flag}</span>
                        <span>{l.label}</span>
                      </span>
                      {lang === l.code && <Check className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* QR Code button (Visible on Desktop & Tablet, compact icon on mobile) */}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="flex items-center gap-1 sm:gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200/90 hover:border-blue-400 bg-white hover:bg-blue-50/80 text-slate-700 hover:text-blue-700 transition-colors text-xs font-bold shrink-0 shadow-2xs cursor-pointer"
              title="QR Kod orqali saytga o'tish"
            >
              <QrCode className="w-4 h-4 text-blue-600 shrink-0" />
              <span className="hidden sm:inline">{t('nav.qrcode', 'QR Kod')}</span>
            </button>

            {/* Theme / Dizayn button (Tablet & Desktop, mobile has it in Tier 2 & Bottom Nav) */}
            <button
              onClick={() => setIsThemeModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:text-amber-600 hover:bg-amber-50/80 transition-colors border border-slate-200/80 cursor-pointer shrink-0"
              title="Dizayn rejimini almashtirish"
            >
              <Palette className="w-4 h-4 text-amber-500" />
              <span className="hidden xl:inline text-xs font-semibold">{t('nav.theme')}</span>
            </button>

            {/* Favorites button (Tablet & Desktop, mobile has it in Tier 2) */}
            <button
              onClick={() => setIsFavoritesOpen(true)}
              className="hidden sm:flex relative p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:text-rose-600 hover:bg-rose-50/80 transition-colors border border-slate-200/80 shrink-0 cursor-pointer"
              title={t('nav.favorites')}
            >
              <Heart className="w-4 h-4 text-rose-500" />
              {favorites.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-600 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {favorites.length}
                </span>
              )}
            </button>

            {/* Bookings button (Tablet & Desktop) */}
            <button
              onClick={() => setIsMyBookingsOpen(true)}
              className="hidden sm:flex relative items-center gap-1.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-slate-700 hover:text-blue-600 hover:bg-blue-50/80 transition-colors border border-slate-200/80 text-xs font-medium shrink-0 cursor-pointer"
              title={t('nav.my_bookings')}
            >
              <ClipboardList className="w-4 h-4 text-blue-600" />
              <span className="hidden 2xl:inline">{t('nav.my_bookings')}</span>
              {pendingBookingsCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {pendingBookingsCount}
                </span>
              )}
            </button>

            {/* User Profile / Auth Button (Visible on ALL devices) */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100/80 border border-blue-200 text-xs font-semibold text-blue-900 transition-colors shrink-0 cursor-pointer"
                  title={t('nav.my_account')}
                >
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] sm:text-xs font-bold">
                    {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                  </div>
                  <span className="hidden md:inline max-w-[80px] truncate">
                    {currentUser.name.split(' ')[0]}
                  </span>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-2xl p-3 z-50 animate-scale-up space-y-2">
                    <div className="pb-2 border-b border-slate-100">
                      <p className="font-bold text-xs text-slate-900 truncate">
                        {currentUser.name}
                      </p>
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
                      <span>{t('nav.my_bookings')}</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="flex items-center gap-1 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-blue-600/30 text-blue-700 bg-blue-50/80 hover:bg-blue-100/80 transition-colors text-xs font-semibold shrink-0 cursor-pointer"
                title={t('nav.login')}
              >
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600 shrink-0" />
                <span className="text-xs">{t('nav.login')}</span>
              </button>
            )}

            {/* Usta bo'lish CTA (Visible on ALL devices) */}
            <button
              onClick={() => setIsAddSpecialistModalOpen(true)}
              className="flex items-center gap-1 px-2 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-semibold shadow-xs hover:shadow-md transition-all active:scale-95 shrink-0 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5 stroke-[2.2] shrink-0" />
              <span className="hidden sm:inline">{t('nav.become_specialist')}</span>
              <span className="sm:hidden font-bold">{t('nav.become_specialist_short')}</span>
            </button>

            {/* Hamburger Button (Screen width < 1280px) */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="flex items-center gap-1 p-2 rounded-xl text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 xl:hidden shrink-0 cursor-pointer transition-colors"
              aria-label={t('nav.menu')}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-800" />
              ) : (
                <>
                  <Menu className="w-5 h-5 text-slate-800" />
                  <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
                    {t('nav.menu')}
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* TIER 2: Mobile & Tablet Quick Navigation (Visible on screens < 1280px) */}
      <div className="xl:hidden border-t border-slate-200/80 bg-slate-50/95 backdrop-blur-md px-2.5 py-2 space-y-2 shadow-xs">
        {/* Row 1: Dedicated, Spacious District Selector (Full width, zero collision) */}
        <div className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-2xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 hidden sm:inline">
              {t('nav.region', 'Hudud')}:
            </span>
            <select
              aria-label="Hududni tanlang"
              value={filters.district}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="bg-transparent font-bold text-slate-800 text-xs sm:text-sm focus:outline-hidden cursor-pointer flex-1 w-full min-w-0 truncate"
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                  {d.id === 'all' ? t('nav.all_districts') : d.name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleHeaderRefresh}
            disabled={isRefreshing}
            title={t('nav.refresh')}
            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
          >
            <RefreshCw
              className={`w-4 h-4 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>

        {/* Row 2: Smooth Horizontal Scrollable Chips for Fast Section Navigation */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth py-0.5 -mx-2.5 px-2.5">
          <a
            href="#services-catalog"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-600 font-bold text-xs shadow-2xs transition-colors shrink-0 whitespace-nowrap"
          >
            <Wrench className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span>{t('nav.services')}</span>
          </a>

          <a
            href="#categories-section"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-600 font-bold text-xs shadow-2xs transition-colors shrink-0 whitespace-nowrap"
          >
            <Layers className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            <span>{t('nav.categories')}</span>
          </a>

          <a
            href="#specialists-section"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 text-slate-800 hover:text-blue-600 font-bold text-xs shadow-2xs transition-colors shrink-0 whitespace-nowrap"
          >
            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>{t('nav.specialists')}</span>
          </a>

          <button
            onClick={handleEmergencyClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 whitespace-nowrap cursor-pointer"
          >
            <Flame className="w-3.5 h-3.5 fill-white text-white animate-pulse shrink-0" />
            <span>{t('nav.emergency_24_7')}</span>
          </button>

          <a
            href="#how-it-works"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold text-xs shadow-2xs transition-colors shrink-0 whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{t('nav.how_it_works')}</span>
          </a>
        </div>
      </div>

      {/* FULL RESPONSIVE DRAWER MENU (When Hamburger is clicked on screens < 1280px) */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3.5 animate-fade-in shadow-2xl max-h-[85vh] overflow-y-auto">
          {/* User profile card in drawer */}
          {currentUser ? (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shadow-xs">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-sm text-slate-900">{currentUser.name}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-xs text-slate-500">{currentUser.phone}</span>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="px-2.5 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
                title={t('nav.logout')}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t('nav.logout')}</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => {
                setIsAuthModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="w-full py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-md transition-colors cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>{t('nav.login')} / Ro&apos;yxatdan o&apos;tish</span>
            </button>
          )}

          {/* Language Selector in Drawer */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <Globe className="w-4 h-4 text-blue-600" />
              <span>Tilni tanlang / Выберите язык / Select language:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                  }}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    lang === l.code
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* District selector in drawer */}
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <MapPin className="w-4 h-4 text-blue-600 shrink-0" />
            <span className="text-slate-500 font-medium">{t('nav.region')}:</span>
            <select
              aria-label="Hududni tanlang"
              value={filters.district}
              onChange={(e) => {
                handleDistrictChange(e.target.value);
                setMobileMenuOpen(false);
              }}
              className="bg-transparent font-bold text-slate-800 flex-1 focus:outline-hidden"
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                  {d.id === 'all' ? t('nav.all_districts') : d.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => {
                handleHeaderRefresh();
                setMobileMenuOpen(false);
              }}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold flex items-center gap-1 shrink-0 shadow-xs cursor-pointer"
              title={t('nav.refresh')}
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`}
              />
              <span className="text-xs">{t('nav.refresh')}</span>
            </button>
          </div>

          {/* All Main Sections in Grid */}
          <div className="grid grid-cols-2 gap-2.5 pt-1">
            <button
              onClick={() => scrollToSection('services-catalog')}
              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-slate-800 hover:text-blue-600 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-blue-600" />
                {t('nav.services')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => scrollToSection('categories-section')}
              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-slate-800 hover:text-blue-600 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-600" />
                {t('nav.categories')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => scrollToSection('specialists-section')}
              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-slate-800 hover:text-blue-600 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-emerald-600" />
                {t('nav.specialists')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                handleEmergencyClick();
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-between cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
                {t('nav.emergency_24_7')}
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-rose-400" />
            </button>

            <button
              onClick={() => {
                setIsFavoritesOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 text-slate-800 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                {t('nav.favorites')} ({favorites.length})
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={() => {
                setIsMyBookingsOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-3 text-left rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 text-slate-800 font-semibold text-xs flex items-center justify-between transition-colors cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-blue-600" />
                {t('nav.my_bookings')} ({pendingBookingsCount})
              </span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Usta bo'lish banner in drawer */}
            <button
              onClick={() => {
                setIsAddSpecialistModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="col-span-2 p-3.5 flex items-center justify-between rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <PlusCircle className="w-4 h-4" />
                {t('nav.become_specialist')} (SMS)
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* QR Code in drawer */}
            <button
              onClick={() => {
                setIsQrModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="col-span-2 p-3 flex items-center justify-center gap-2 rounded-2xl bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-indigo-600" />
              <span>{t('nav.qrcode', 'QR Kod')} • Sayt havolasi</span>
            </button>

            {/* Theme selector in drawer */}
            <button
              onClick={() => {
                setIsThemeModalOpen(true);
                setMobileMenuOpen(false);
              }}
              className="col-span-2 p-3 flex items-center justify-center gap-2 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs transition-colors cursor-pointer"
            >
              <Palette className="w-4 h-4 text-amber-600" />
              <span>{t('nav.theme')}</span>
            </button>

            <button
              onClick={() => scrollToSection('how-it-works')}
              className="col-span-2 p-2.5 text-center rounded-xl text-slate-600 hover:text-slate-900 text-xs font-medium cursor-pointer"
            >
              {t('nav.how_it_works')} • {t('brand.name')}
            </button>
          </div>

          {/* Support Contacts */}
          <div className="pt-2 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
              Yordam: <a href="tel:+998712000000" className="font-bold text-slate-800 hover:underline">+998 (71) 200-00-00</a>
            </span>
            <a
              href="https://t.me/xizmatchiuz_Uzbekistan_bot"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 font-bold hover:underline"
            >
              @xizmatchiuz_Uzbekistan_bot
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
