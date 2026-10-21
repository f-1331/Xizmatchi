'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../lib/storage';
import {
  X,
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
  Layers,
  Image as ImageIcon,
  MessageSquare,
  Share2,
} from 'lucide-react';

export function SpecialistDetailModal() {
  const {
    selectedSpecialist,
    setSelectedSpecialist,
    selectedSpecialistTab,
    openBookingModal,
    toggleFavorite,
    isFavorite,
    addReview,
    showToast,
  } = useApp();

  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'services' | 'portfolio' | 'reviews'>('services');
  const [prevSpecialistKey, setPrevSpecialistKey] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Sync tab when a specialist modal opens with a specific tab
  const currentKey = selectedSpecialist ? `${selectedSpecialist.id}_${selectedSpecialistTab || 'services'}` : null;
  if (currentKey && currentKey !== prevSpecialistKey) {
    setPrevSpecialistKey(currentKey);
    setActiveTab(selectedSpecialistTab || 'services');
  }

  // Lock body scroll when this modal is open
  useEffect(() => {
    if (!selectedSpecialist) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [selectedSpecialist]);

  // Review form state
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewService, setReviewService] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  if (!selectedSpecialist) return null;

  const favorited = isFavorite(selectedSpecialist.id);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      showToast("Iltimos, ismingiz va fikringizni yozing", 'warning');
      return;
    }

    setIsSubmittingReview(true);
    addReview(selectedSpecialist.id, {
      authorName: reviewAuthor.trim(),
      rating: reviewRating,
      comment: reviewComment.trim(),
      serviceType: reviewService.trim() || undefined,
    });

    setReviewAuthor('');
    setReviewComment('');
    setReviewService('');
    setReviewRating(5);
    setIsSubmittingReview(false);
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast(t('detail.link_copied'), 'info');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in overscroll-none"
      onClick={() => setSelectedSpecialist(null)}
    >
      <div
        className="relative bg-white rounded-3xl max-w-3xl w-full h-[90dvh] max-h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="relative bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-7 shrink-0">
          {/* Close button */}
          <button
            onClick={() => setSelectedSpecialist(null)}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label={t('detail.close')}
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="w-18 h-18 sm:w-26 sm:h-26 rounded-2xl overflow-hidden border-3 border-white/30 shadow-lg bg-slate-800">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSpecialist.avatar}
                  alt={selectedSpecialist.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {selectedSpecialist.isVerified && (
                <div
                  title={t('card.verified_tooltip')}
                  className="absolute -bottom-1 -right-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center ring-2 ring-slate-900 shadow-md"
                >
                  <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
                </div>
              )}
            </div>

            {/* Specialist Info */}
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/30 border border-blue-400/30 text-blue-200 text-xs font-semibold">
                  {selectedSpecialist.profession}
                </span>
                {selectedSpecialist.isAvailable24_7 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/30 text-rose-200 text-xs font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t('card.urgent_badge')}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-white tracking-tight truncate">
                {selectedSpecialist.name}
              </h2>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 mt-1.5 text-xs sm:text-sm text-slate-300">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="font-bold text-white">{selectedSpecialist.rating.toFixed(1)}</span>
                  <span>({selectedSpecialist.reviewsCount} {t('card.reviews_count')})</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>{selectedSpecialist.district}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Briefcase className="w-4 h-4 text-blue-300" />
                  <span>{selectedSpecialist.experienceYears} {t('card.experience')}</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-2.5">
                {selectedSpecialist.badges.map((b, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-md bg-white/10 text-slate-200 text-[11px] font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Contact Bar */}
          <div className="mt-4 pt-3.5 sm:mt-5 sm:pt-4 border-t border-white/15 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`tel:${selectedSpecialist.phone.replace(/\s+/g, '')}`}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
              >
                <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span>{selectedSpecialist.phone}</span>
              </a>

              {selectedSpecialist.telegram && (
                <a
                  href={`https://t.me/${selectedSpecialist.telegram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-xs sm:text-sm transition-colors shadow-md cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>{selectedSpecialist.telegram}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-1.5 ml-auto">
              <button
                onClick={() => toggleFavorite(selectedSpecialist.id)}
                className={`p-2 rounded-xl border transition-colors cursor-pointer ${
                  favorited
                    ? 'bg-rose-500/20 border-rose-400 text-rose-300'
                    : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}
                title={favorited ? 'Saqlangan' : 'Saqlash'}
              >
                <Heart className={`w-4 h-4 ${favorited ? 'fill-rose-400 text-rose-400' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-colors cursor-pointer"
                title="Ulashish"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-slate-200 bg-slate-50 px-4 sm:px-6 flex gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'services'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>{t('detail.tab_services')}</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'portfolio'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <ImageIcon className="w-4 h-4 text-blue-600" />
            <span>{t('detail.tab_portfolio')} ({selectedSpecialist.portfolio.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('reviews')}
            className={`py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'reviews'
                ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>{t('detail.tab_reviews')} ({selectedSpecialist.reviews.length})</span>
          </button>
        </div>

        {/* Modal Body / Tab Content - min-h-0 and overscroll-contain guarantee smooth scrolling without affecting background */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-7 space-y-6 touch-pan-y">
          {/* TAB 1: Services & Bio */}
          {activeTab === 'services' && (
            <div className="space-y-6">
              {/* Bio block */}
              <div>
                <h4 className="font-bold text-slate-900 text-base mb-2">
                  {t('detail.about_title')}
                </h4>
                <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  {selectedSpecialist.bio}
                </p>
              </div>

              {/* Services & Price List */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-base">
                    {t('detail.tab_services')}
                  </h4>
                  <span className="text-xs text-slate-500">* Boshlang&apos;ich taxminiy narxlar</span>
                </div>

                <div className="divide-y divide-slate-100 rounded-2xl border border-slate-200 overflow-hidden bg-white shadow-2xs">
                  {selectedSpecialist.services.map((service, index) => (
                    <div
                      key={index}
                      className="p-3.5 sm:p-4 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="text-sm font-medium text-slate-800">
                          {service.name}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-sm font-bold text-slate-900">
                          {formatPrice(service.price)}
                        </span>
                        {service.unit && (
                          <span className="text-xs text-slate-500 ml-1">/{service.unit}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Portfolio */}
          {activeTab === 'portfolio' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-500">
                {t('detail.portfolio_subtitle')}
              </p>

              {selectedSpecialist.portfolio.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto stroke-1 mb-2" />
                  <p className="text-sm">{t('detail.portfolio_empty')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {selectedSpecialist.portfolio.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedImage(item.image)}
                      className="group relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 cursor-pointer shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="aspect-video w-full overflow-hidden bg-slate-200">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          loading="lazy"
                        />
                      </div>
                      <div className="p-3 bg-white">
                        <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                          {item.category || 'Ish natijasi'}
                        </span>
                        <h5 className="font-semibold text-slate-900 text-xs sm:text-sm mt-0.5 line-clamp-2">
                          {item.title}
                        </h5>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: Reviews */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              {/* Write Review Form */}
              <div className="bg-blue-50/60 p-5 rounded-2xl border border-blue-100">
                <h4 className="font-bold text-slate-900 text-sm sm:text-base mb-1">
                  {t('detail.leave_review_title')}
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  {t('detail.leave_review_desc')}
                </p>

                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('detail.name_field')}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={t('detail.name_placeholder')}
                        value={reviewAuthor}
                        onChange={(e) => setReviewAuthor(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        {t('detail.service_field')}
                      </label>
                      <input
                        type="text"
                        placeholder="Masalan: Quvur almashtirish"
                        value={reviewService}
                        onChange={(e) => setReviewService(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                      />
                    </div>
                  </div>

                  {/* Star Rating Picker */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('detail.rating_field')}
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating(star)}
                          className="p-1 text-amber-400 hover:scale-125 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-6 h-6 ${
                              star <= reviewRating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {reviewRating} / 5 {t('detail.stars_label')}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {t('detail.comment_field')}
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={t('detail.comment_placeholder')}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
                  >
                    {t('detail.submit_review')}
                  </button>
                </form>
              </div>

              {/* Reviews List */}
              <div className="space-y-3">
                <h4 className="font-bold text-slate-900 text-base">
                  {t('detail.all_reviews')} ({selectedSpecialist.reviews.length})
                </h4>

                {selectedSpecialist.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl border border-slate-200/90 bg-white space-y-2 shadow-2xs"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">
                          {rev.authorName}
                        </span>
                        {rev.serviceType && (
                          <span className="ml-2 px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[11px] font-medium">
                            {rev.serviceType}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, idx) => (
                        <Star
                          key={idx}
                          className={`w-3.5 h-3.5 ${
                            idx < Math.floor(rev.rating)
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-200'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-1">
                        {rev.rating}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Sticky Bottom Actions */}
        <div className="p-3.5 sm:p-5 bg-white border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <div>
            <div className="text-[11px] sm:text-xs text-slate-500">
              {t('detail.price_starts')}
            </div>
            <div className="text-base sm:text-xl font-black text-slate-900">
              {formatPrice(selectedSpecialist.startingPrice)}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setSelectedSpecialist(null)}
              className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
            >
              {t('detail.close')}
            </button>

            <button
              onClick={() => {
                const spec = selectedSpecialist;
                setSelectedSpecialist(null);
                openBookingModal(spec);
              }}
              className="px-4 sm:px-6 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('detail.book_specialist')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Fullsize image preview if clicked */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-60 bg-black/85 flex items-center justify-center p-4 overscroll-none"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-10 right-0 text-white hover:text-slate-300 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selectedImage}
              alt="Portfolio full view"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
}
