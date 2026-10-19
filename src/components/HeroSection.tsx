'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, DISTRICTS } from '../data/mockData';
import {
  Search,
  MapPin,
  Briefcase,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Sparkles,
  ArrowRight,
  Flame,
  Star,
  RefreshCw,
} from 'lucide-react';

export function HeroSection() {
  const { filters, setFilters, openBookingModal, refreshData } = useApp();
  const { t, getCategoryName } = useLanguage();
  const [localSearch, setLocalSearch] = useState(filters.searchQuery);
  const [selectedCat, setSelectedCat] = useState(filters.categoryId);
  const [selectedDist, setSelectedDist] = useState(filters.district);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDistrictRefresh = () => {
    setIsRefreshing(true);
    refreshData(selectedDist);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((prev) => ({
      ...prev,
      searchQuery: localSearch,
      categoryId: selectedCat,
      district: selectedDist,
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickTagClick = (tag: string, catId?: string) => {
    setLocalSearch(tag);
    setFilters((prev) => ({
      ...prev,
      searchQuery: tag,
      categoryId: catId || prev.categoryId,
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-12 pb-20 md:pt-16 md:pb-28">
      {/* Background Decorative Blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-blue-200 text-xs sm:text-sm font-medium shadow-inner animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>{t('brand.badge')}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
            {t('hero.title_part1')}{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-indigo-200 to-emerald-300">
              {t('hero.title_part2')}
            </span>{' '}
            {t('hero.title_part3')}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            {t('hero.description')}
          </p>

          {/* Search Box Card */}
          <div className="mt-8 p-3 sm:p-4 rounded-3xl bg-white/95 backdrop-blur-xl shadow-2xl border border-white/20 text-slate-800">
            <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-2.5 sm:gap-3">
              {/* Keyword Search */}
              <div className="sm:col-span-2 lg:flex-1 flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-100/90 border border-slate-200/80 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all">
                <Search className="w-5 h-5 text-slate-400 shrink-0" />
                <input
                  type="text"
                  placeholder={t('hero.search_placeholder')}
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  className="w-full bg-transparent text-sm sm:text-base font-medium placeholder:text-slate-400 focus:outline-hidden text-slate-900"
                />
              </div>

              {/* Category Select */}
              <div className="flex items-center gap-2 px-3 py-3 rounded-2xl bg-slate-100/90 border border-slate-200/80 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all w-full lg:w-48 xl:w-52">
                <Briefcase className="w-4 h-4 text-slate-400 shrink-0" />
                <select
                  aria-label="Kategoriyani tanlang"
                  value={selectedCat}
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-slate-800 focus:outline-hidden cursor-pointer"
                >
                  <option value="all">{t('categories.all_button')}</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {getCategoryName(cat.id, cat.name)}
                    </option>
                  ))}
                </select>
              </div>

              {/* District Select with Refresh Button */}
              <div className="flex items-center gap-1.5 w-full lg:w-auto xl:w-52">
                <div className="flex-1 flex items-center gap-2 px-3 py-3 rounded-2xl bg-slate-100/90 border border-slate-200/80 focus-within:ring-2 focus-within:ring-blue-600 focus-within:bg-white transition-all">
                  <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                  <select
                    aria-label="Tumanni tanlang"
                    value={selectedDist}
                    onChange={(e) => setSelectedDist(e.target.value)}
                    className="w-full bg-transparent text-sm font-semibold text-slate-800 focus:outline-hidden cursor-pointer"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                        {d.id === 'all' ? t('nav.all_districts') : d.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Refresh Button */}
                <button
                  type="button"
                  onClick={handleDistrictRefresh}
                  disabled={isRefreshing}
                  title={t('nav.refresh')}
                  className="px-3.5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/25 transition-all shrink-0 cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 stroke-[2.2] ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">{t('nav.refresh')}</span>
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="sm:col-span-2 lg:col-span-1 px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 transition-all flex items-center justify-center gap-2 active:scale-95 shrink-0 cursor-pointer"
              >
                <Search className="w-4 h-4 stroke-[2.5]" />
                <span>{t('hero.find_button')}</span>
              </button>
            </form>

            {/* Quick search pills */}
            <div className="mt-3 pt-3 border-t border-slate-200/80 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500 font-semibold flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-500" /> {t('hero.quick_tags_label')}
              </span>
              {[
                { label: 'Santexnik', cat: 'santexnika' },
                { label: 'Elektrik', cat: 'elektr' },
                { label: 'Konditsioner', cat: 'konditsioner' },
                { label: 'Dezinfeksiya', cat: 'dezinfeksiya' },
                { label: 'Mebel ustasi', cat: 'mebel' },
                { label: 'Klining', cat: 'klining' },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleQuickTagClick(item.label, item.cat)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 font-medium transition-colors cursor-pointer"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Call-to-action button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => openBookingModal()}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-500/25 hover:shadow-xl transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>{t('hero.quick_order')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <span className="text-xs text-slate-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-400" /> {t('hero.stat_service_24_7')}
            </span>
          </div>

          {/* Trust Metrics Bar */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left border-t border-white/10 mt-6">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">32+</div>
                <div className="text-xs text-slate-400">{t('hero.stat_specialists')}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                <Star className="w-5 h-5 fill-amber-400" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">4.9 / 5.0</div>
                <div className="text-xs text-slate-400">{t('hero.stat_reviews')}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">100%</div>
                <div className="text-xs text-slate-400">{t('hero.stat_guarantee')}</div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-white/5 backdrop-blur-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-lg font-bold text-white leading-tight">24/7</div>
                <div className="text-xs text-slate-400">{t('hero.stat_service_24_7')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
