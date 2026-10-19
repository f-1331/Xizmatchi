'use client';

import React, { useState } from 'react';
import { Specialist } from '../types';
import { useApp } from '../context/AppContext';
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
  Award,
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
                title="Tasdiqlangan mutaxassis"
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
                  onClick={() => setSelectedSpecialist(specialist)}
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
                className={`p-2 rounded-xl transition-all shrink-0 ${
                  favorited
                    ? 'text-rose-600 bg-rose-50'
                    : 'text-slate-400 hover:text-rose-600 hover:bg-slate-50'
                }`}
                title={favorited ? "Saqlanganlardan o'chirish" : "Saqlanganlarga qo'shish"}
              >
                <Heart className={`w-5 h-5 ${favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            </div>

            {/* Rating and Reviews */}
            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-900 border border-amber-200/80 text-xs font-bold">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>{specialist.rating.toFixed(1)}</span>
              </div>
              <span className="text-xs text-slate-500">
                ({specialist.reviewsCount} ta sharh)
              </span>

              {/* 24/7 pill */}
              {specialist.isAvailable24_7 && (
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                  <Clock className="w-3 h-3 text-rose-600" /> 24/7
                </span>
              )}
            </div>

            {/* Location & Experience */}
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{specialist.district}</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                <span>{specialist.experienceYears} yil tajriba</span>
              </span>
            </div>
          </div>
        </div>

        {/* Short Bio */}
        <p className="mt-3 text-xs text-slate-600 line-clamp-2 leading-relaxed">
          {specialist.bio}
        </p>

        {/* Badges strip */}
        <div className="mt-3 flex flex-wrap gap-1.5">
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
                Ish natijalari ({specialist.portfolio.length})
              </span>
              <button
                type="button"
                onClick={() => openSpecialistDetail(specialist, 'portfolio')}
                className="text-[11px] font-bold text-blue-600 hover:text-blue-700 hover:underline cursor-pointer"
              >
                Barchasini ko&apos;rish →
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
          <span className="text-xs text-slate-500">Boshlang&apos;ich narx:</span>
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
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Qo&apos;ng&apos;iroq</span>
          </a>

          {/* Quick Telegram */}
          {specialist.telegram ? (
            <a
              href={`https://t.me/${specialist.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </a>
          ) : (
            <button
              onClick={() => openSpecialistDetail(specialist, 'services')}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Profil</span>
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
            <span>Portfolio & Sharhlar</span>
          </button>

          <button
            onClick={() => openBookingModal(specialist)}
            className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 active:scale-95 cursor-pointer"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Chaqirish</span>
          </button>
        </div>
      </div>
    </div>
  );
}
