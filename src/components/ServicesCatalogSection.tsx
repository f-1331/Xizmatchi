'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { POPULAR_SERVICES_CATALOG } from '../data/mockData';
import {
  Wrench,
  Clock,
  Sparkles,
  ArrowRight,
  Search,
  CheckCircle2,
  Calendar,
  Layers,
  ChevronRight,
  MapPin,
} from 'lucide-react';

export function ServicesCatalogSection() {
  const { openBookingModal, setFilters, filters } = useApp();
  const { t, getCategoryName } = useLanguage();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredJobs = POPULAR_SERVICES_CATALOG.filter((job) => {
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!job.name.toLowerCase().includes(q) && !job.description.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedCategory !== 'all' && job.categoryId !== selectedCategory) {
      return false;
    }
    return true;
  });

  const handleQuickBook = (jobName: string, categoryId: string) => {
    openBookingModal(null, categoryId);
  };

  const handleViewSpecialists = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId,
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    { id: 'all', name: 'Barcha ishlar (38)' },
    { id: 'santexnika', name: 'Santexnika' },
    { id: 'elektr', name: 'Elektr' },
    { id: 'maishiy-texnika', name: 'Maishiy texnika' },
    { id: 'konditsioner', name: 'Konditsioner' },
    { id: 'tamirlash', name: "Uy ta'miri" },
    { id: 'tozalash', name: 'Klining' },
    { id: 'mebel', name: 'Mebel' },
    { id: 'qulflar', name: 'Qulflar' },
    { id: 'xavfsizlik', name: 'Kameralar' },
    { id: 'romlar', name: 'Akfa romlar' },
  ];

  return (
    <section id="services-catalog" className="py-14 bg-slate-100/70 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> {t('catalog.badge')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('catalog.title')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {t('catalog.subtitle')}
            </p>
            {filters.district && filters.district !== 'all' && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanlangan tuman: <strong>{filters.district}</strong></span>
              </div>
            )}
          </div>

          {/* Search bar inside catalog */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Ish yoki xizmat nomi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 shadow-2xs font-medium"
            />
          </div>
        </div>

        {/* Quick category filter pills */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCategory(c.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === c.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-200/80 text-slate-700 border border-slate-200'
              }`}
            >
              {c.id === 'all' ? t('categories.all_button') : getCategoryName(c.id, c.name)}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="group bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-bold">
                    {getCategoryName(job.categoryId, job.categoryName)}
                  </span>

                  {job.popular && (
                    <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold">
                      🔥 Top
                    </span>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors leading-snug">
                  {job.name}
                </h3>

                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  {job.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between mb-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Taxminiy narx:</span>
                    <strong className="text-slate-900 text-sm font-black">
                      {job.averagePrice}
                    </strong>
                  </div>

                  <div className="text-right">
                    <span className="text-slate-400 block text-[11px]">Bajarilish vaqti:</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" /> {job.duration}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleViewSpecialists(job.categoryId)}
                    className="py-2 px-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>{t('card.profile_btn')}</span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  <button
                    onClick={() => handleQuickBook(job.name, job.categoryId)}
                    className="py-2 px-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{t('card.book_btn')}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredJobs.length === 0 && (
          <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
            <p className="text-sm text-slate-500">
              Qidiruvingiz bo&apos;yicha xizmat turi topilmadi. Boshqa so&apos;z bilan qidirib ko&apos;ring.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
