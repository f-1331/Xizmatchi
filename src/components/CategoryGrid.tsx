'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES } from '../data/mockData';
import { CategoryIcon } from './CategoryIcon';
import { ChevronRight, Layers } from 'lucide-react';

export function CategoryGrid() {
  const { filters, setFilters, specialists } = useApp();
  const { t, getCategoryName, getCategoryDesc } = useLanguage();

  const handleCategorySelect = (categoryId: string) => {
    setFilters((prev) => ({
      ...prev,
      categoryId: prev.categoryId === categoryId ? 'all' : categoryId,
    }));
    const el = document.getElementById('specialists-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Calculate live count from specialists array for accuracy
  const getCategoryCount = (categoryId: string) => {
    return specialists.filter((s) => s.categoryId === categoryId).length;
  };

  return (
    <section id="categories-section" className="py-12 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Layers className="w-3.5 h-3.5" /> {t('categories.section_badge')}
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('categories.section_title')}
            </h2>
            <p className="text-sm sm:text-base text-slate-500 mt-1">
              {t('categories.section_subtitle')}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setFilters((prev) => ({ ...prev, categoryId: 'all' }));
                const el = document.getElementById('specialists-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                filters.categoryId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t('categories.all_button')} ({specialists.length} {t('categories.specialists_count')})
            </button>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat) => {
            const isSelected = filters.categoryId === cat.id;
            const liveCount = getCategoryCount(cat.id);
            const localizedName = getCategoryName(cat.id, cat.name);
            const localizedDesc = getCategoryDesc(cat.id, cat.description);

            return (
              <div
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`group relative p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer text-left flex flex-col justify-between ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-600/20 shadow-md shadow-blue-500/10'
                    : 'bg-slate-50/60 hover:bg-white border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${cat.bgColor} ${cat.color}`}
                    >
                      <CategoryIcon name={cat.iconName} className="w-6 h-6 stroke-[2]" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-200/70 text-slate-600 group-hover:bg-slate-200'
                      }`}
                    >
                      {liveCount} {t('categories.specialists_count')}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base sm:text-lg group-hover:text-blue-600 transition-colors">
                    {localizedName}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                    {localizedDesc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-semibold text-blue-600 group-hover:translate-x-0.5 transition-transform">
                  <span>{isSelected ? 'Tanlangan ✓' : localizedName}</span>
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
