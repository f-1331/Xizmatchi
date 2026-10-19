'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../lib/storage';
import {
  X,
  Heart,
  Star,
  MapPin,
  Phone,
  Calendar,
  Trash2,
  Eye,
} from 'lucide-react';

export function FavoritesDrawer() {
  const {
    isFavoritesOpen,
    setIsFavoritesOpen,
    favorites,
    toggleFavorite,
    specialists,
    setSelectedSpecialist,
    openBookingModal,
  } = useApp();

  if (!isFavoritesOpen) return null;

  const favoriteSpecialists = specialists.filter((s) => favorites.includes(s.id));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/50 backdrop-blur-xs flex justify-end animate-fade-in">
      <div
        className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Saqlangan ustalar</h3>
              <p className="text-xs text-slate-400">
                {favoriteSpecialists.length} ta saqlangan mutaxassis
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFavoritesOpen(false)}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {favoriteSpecialists.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <Heart className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-base font-bold text-slate-700">
                Hozircha saqlangan ustalar yo&apos;q
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                O&apos;zingizga ma&apos;qul kelgan ustalarni yurakcha belgisini bosib saqlab qo&apos;yishingiz mumkin.
              </p>
            </div>
          ) : (
            favoriteSpecialists.map((spec) => (
              <div
                key={spec.id}
                className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-all flex flex-col gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spec.avatar}
                      alt={spec.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-slate-900 text-sm truncate">
                      {spec.name}
                    </h4>
                    <p className="text-xs text-blue-600 font-semibold truncate">
                      {spec.profession}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-0.5 font-bold text-amber-600">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        {spec.rating.toFixed(1)}
                      </span>
                      <span>•</span>
                      <span className="truncate">{spec.district}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFavorite(spec.id)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
                    title="Olib tashlash"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400">Narx:</span>{' '}
                    <strong className="text-slate-900">{formatPrice(spec.startingPrice)}</strong>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setIsFavoritesOpen(false);
                        setSelectedSpecialist(spec);
                      }}
                      className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                      title="Profil"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>

                    <a
                      href={`tel:${spec.phone.replace(/\s+/g, '')}`}
                      className="p-2 rounded-lg bg-slate-900 text-white hover:bg-slate-800"
                      title="Qo'ng'iroq qilish"
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <button
                      onClick={() => {
                        setIsFavoritesOpen(false);
                        openBookingModal(spec);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold"
                    >
                      Chaqirish
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => setIsFavoritesOpen(false)}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            Yopish
          </button>
        </div>
      </div>
    </div>
  );
}
