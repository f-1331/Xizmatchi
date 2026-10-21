'use client';

import React, { useState } from 'react';
import { Specialist } from '../types';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../lib/storage';
import {
  Star,
  MapPin,
  ShieldCheck,
  Phone,
  Send,
  Heart,
  Clock,
  Briefcase,
  CheckCircle2,
  Calendar,
  Eye,
  Image as ImageIcon,
} from 'lucide-react';

interface SpecialistCardProps {
  specialist: Specialist;
}

export function SpecialistCard({ specialist }: SpecialistCardProps) {
  const {
    openSpecialistDetail,
    openBookingModal,
    toggleFavorite,
    isFavorite,
  } = useApp();

  const { t } = useLanguage();

  const [imgError, setImgError] = useState(false);
  const favorited = isFavorite(specialist.id);

  // Fallback avatar if unsplash is blocked or fails
  const avatarSrc = imgError
    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(specialist.name)}`
    : specialist.avatar;

  return (
    <div className="group bg-white rounded-3xl border border-slate-200/90 hover:border-blue-400 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Top badges & Favorite heart */}
      <div className="p-5 pb-3">
        <div className="flex items-start gap-4">
          {/* Avatar with status indicators */}
          <div className="relative shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-slate-100 border-2 border-slate-100 group-hover:border-blue-500 transition-colors shadow-xs">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={avatarSrc}
                alt={specialist.name}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Verification check */}
            {specialist.isVerified && (
              <div
                title={t('card.verified_tooltip')}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-white shadow-xs"
              >
                <ShieldCheck className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3
                  onClick={() => openSpecialistDetail(specialist, 'services')}
                  className="font-bold text-slate-900 text-lg leading-snug hover:text-blue-600 transition-colors cursor-pointer truncate"
                  title={specialist.name}
                >
                  {specialist.name}
                </h3>
                <p className="text-xs font-semibold text-blue-600 leading-tight">
                  {specialist.profession}
                </p>
              </div>

              {/* Favorite Button */}
              <button
                onClick={() => toggleFavorite(specialist.id)}
                className={`p-2 rounded-xl transition-all shrink-0 cursor-pointer ${
                  favorited
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50'
                }`}
                title={favorited ? "Saqlanganlardan o'chirish" : "Saqlanganlarga qo'shish"}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Ratings & District */}
            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <div className="flex items-center gap-1 font-bold text-slate-900 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{specialist.rating.toFixed(1)}</span>
                <span className="font-normal text-slate-400">({specialist.reviewsCount})</span>
              </div>

              <div className="flex items-center gap-1 truncate text-slate-600">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{specialist.district}</span>
              </div>
            </div>

            {/* Experience & 24/7 Service */}
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                {specialist.experienceYears} {t('card.experience')}
              </span>

              {specialist.isAvailable24_7 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px] border border-rose-200/80 flex items-center gap-1 animate-pulse">
                  <Clock className="w-2.5 h-2.5" />
                  {t('card.urgent_badge')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Bio summary */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {specialist.bio}
        </p>

        {/* Badges / Highlights */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {specialist.badges.slice(0, 3).map((badge, idx) => (
            <span
              key={idx}
              className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium"
            >
              {badge}
            </span>
          ))}
          {specialist.completedOrdersCount > 0 && (
            <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-medium border border-emerald-100 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> {specialist.completedOrdersCount}+ ish
            </span>
          )}
        </div>

        {/* Portfolio Visual Preview Strip */}
        {specialist.portfolio && specialist.portfolio.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                {t('card.results_title')} ({specialist.portfolio.length})
              </span>
              <button
                type="button"
                onClick={() => openSpecialistDetail(specialist, 'portfolio')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                {t('card.view_all_portfolio')}
              </button>
            </div>
            <div className="grid grid-cols-3 gap-1.5">
              {specialist.portfolio.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  onClick={() => openSpecialistDetail(specialist, 'portfolio')}
                  className="relative rounded-xl overflow-hidden aspect-video bg-slate-100 cursor-pointer group/thumb shadow-2xs border border-slate-200/80 hover:border-blue-400 transition-all"
                  title={item.title}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover/thumb:scale-108 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover/thumb:bg-transparent transition-colors" />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pricing and Action Footer */}
      <div className="p-5 pt-3 bg-slate-50/70 border-t border-slate-100 flex flex-col gap-3">
        {/* Price display */}
        <div className="flex items-baseline justify-between">
          <span className="text-xs text-slate-500">{t('card.from_price')}</span>
          <div className="text-right">
            <span className="text-base font-extrabold text-slate-900">
              {formatPrice(specialist.startingPrice)}
            </span>
            <span className="text-xs text-slate-500 ml-1">/{specialist.priceUnit}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-2 gap-2">
          {/* Quick Contact (Direct Call) */}
          <a
            href={`tel:${specialist.phone.replace(/\s+/g, '')}`}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>{t('card.call_btn')}</span>
          </a>

          {/* Quick Telegram */}
          {specialist.telegram ? (
            <a
              href={`https://t.me/${specialist.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{t('card.telegram_btn')}</span>
            </a>
          ) : (
            <button
              onClick={() => openSpecialistDetail(specialist, 'services')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>{t('card.profile_btn')}</span>
            </button>
          )}
        </div>

        {/* Secondary Buttons Row */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => openSpecialistDetail(specialist, 'portfolio')}
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-slate-400" />
            <span>{t('card.portfolio_reviews_btn')}</span>
          </button>

          <button
            onClick={() => openBookingModal(specialist)}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{t('card.book_btn')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
