'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, DISTRICTS } from '../data/mockData';
import { FilterState } from '../types';
import {
  Search,
  MapPin,
  Briefcase,
  Star,
  ArrowUpDown,
  RotateCcw,
  CheckCircle2,
  Clock,
  Filter,
  X,
  RefreshCw,
} from 'lucide-react';

export function FilterBar() {
  const { filters, setFilters, resetFilters, refreshData, filteredSpecialists } = useApp();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    refreshData(filters.district);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const isFiltered =
    filters.searchQuery !== '' ||
    filters.categoryId !== 'all' ||
    filters.district !== 'all' ||
    filters.minRating > 0 ||
    filters.sortBy !== 'recommended' ||
    filters.only24_7 ||
    filters.onlyVerified;

  return (
    <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 mb-8 space-y-4">
      {/* Top Row: Search and Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:flex xl:items-center gap-2.5 sm:gap-3">
        {/* Search */}
        <div className="relative sm:col-span-2 xl:flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Mutaxassis ismi, kasbi yoki xizmat nomi..."
            value={filters.searchQuery}
            onChange={(e) => setFilters((prev) => ({ ...prev, searchQuery: e.target.value }))}
            className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all font-medium"
          />
          {filters.searchQuery && (
            <button
              onClick={() => setFilters((prev) => ({ ...prev, searchQuery: '' }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Category Dropdown */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 w-full xl:w-52">
          <Briefcase className="w-4 h-4 text-blue-600 shrink-0" />
          <select
            aria-label="Kategoriyani tanlang"
            value={filters.categoryId}
            onChange={(e) => setFilters((prev) => ({ ...prev, categoryId: e.target.value }))}
            className="w-full bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="all">Barcha sohalar</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* District Dropdown with Refresh Button */}
        <div className="flex items-center gap-1.5 w-full xl:w-56">
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              aria-label="Tumanni tanlang"
              value={filters.district}
              onChange={(e) => setFilters((prev) => ({ ...prev, district: e.target.value }))}
              className="w-full bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
            >
              {DISTRICTS.map((d) => (
                <option key={d.id} value={d.id === 'all' ? 'all' : d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing}
            title="Tumandagi xizmatchilarni yangilash"
            className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 hover:border-emerald-300 transition-all cursor-pointer shrink-0"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Sort By Dropdown */}
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 sm:col-span-2 xl:col-span-1 w-full xl:w-52">
          <ArrowUpDown className="w-4 h-4 text-indigo-600 shrink-0" />
          <select
            aria-label="Saralash tartibini tanlang"
            value={filters.sortBy}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                sortBy: e.target.value as FilterState['sortBy'],
              }))
            }
            className="w-full bg-transparent font-medium text-slate-800 focus:outline-hidden cursor-pointer"
          >
            <option value="recommended">Tavsiya etilgan</option>
            <option value="price_asc">Narx: Arzondan qimmatga</option>
            <option value="price_desc">Narx: Qimmatdan arzonga</option>
            <option value="rating">Reyting bo&apos;yicha (eng yuqori)</option>
            <option value="experience">Tajriba bo&apos;yicha</option>
          </select>
        </div>
      </div>

      {/* Bottom Row: Quick Filters & Chips */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          {/* Rating filter chips */}
          <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Reyting:
          </span>
          {[
            { label: 'Barchasi', value: 0 },
            { label: '4.5+ ★', value: 4.5 },
            { label: '4.8+ ★', value: 4.8 },
          ].map((r) => (
            <button
              key={r.label}
              onClick={() => setFilters((prev) => ({ ...prev, minRating: r.value }))}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filters.minRating === r.value
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}

          <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* 24/7 Service Toggle */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, only24_7: !prev.only24_7 }))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filters.only24_7
                ? 'bg-rose-100 text-rose-800 border border-rose-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-rose-600" />
            <span>24/7 Shoshilinch</span>
          </button>

          {/* Verified Toggle */}
          <button
            onClick={() => setFilters((prev) => ({ ...prev, onlyVerified: !prev.onlyVerified }))}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
              filters.onlyVerified
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Tekshirilgan ustalar</span>
          </button>
        </div>

        {/* Counter & Reset */}
        <div className="flex items-center gap-3 ml-auto text-xs font-medium">
          <span className="text-slate-600">
            Topildi: <strong className="text-slate-900 text-sm">{filteredSpecialists.length}</strong> ta usta
          </span>

          {isFiltered && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Tozalash</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
