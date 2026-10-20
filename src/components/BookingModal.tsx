'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import { CATEGORIES, DISTRICTS } from '../data/mockData';
import { UrgencyType, BookingRequest } from '../types';
import {
  X,
  Calendar,
  Clock,
  Flame,
  MapPin,
  Phone,
  User,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';
import { sendBookingToTelegram, TELEGRAM_CLIENT_BOT_USERNAME } from '../lib/telegram';

export function BookingModal() {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingSpecialist,
    bookingCategory,
    createBooking,
    setIsMyBookingsOpen,
  } = useApp();

  const { t, getCategoryName } = useLanguage();

  const [category, setCategory] = useState(bookingCategory || 'santexnika');
  const [district, setDistrict] = useState('Chilonzor tumani');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [preferredDate, setPreferredDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [preferredTime, setPreferredTime] = useState('14:00 - 16:00');
  const [urgency, setUrgency] = useState<UrgencyType>('urgent');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('+998 ');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Success state
  const [createdBooking, setCreatedBooking] = useState<BookingRequest | null>(null);

  // Lock body scroll when this modal is open
  useEffect(() => {
    if (!isBookingModalOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isBookingModalOpen]);

  if (!isBookingModalOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSamplePhoto = (url: string) => {
    setPhotoPreview(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const booking = createBooking({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      specialistId: bookingSpecialist?.id,
      specialistName: bookingSpecialist?.name,
      categoryId: bookingSpecialist?.categoryId || category,
      district,
      address: address.trim(),
      preferredDate,
      preferredTime,
      urgency,
      description: description.trim(),
      photoUrl: photoPreview || undefined,
    });

    setCreatedBooking(booking);

    // Broadcast booking order to Telegram Bot
    sendBookingToTelegram(booking);
  };

  const handleSuccessClose = () => {
    setCreatedBooking(null);
    closeBookingModal();
  };

  const handleViewBookings = () => {
    setCreatedBooking(null);
    closeBookingModal();
    setIsMyBookingsOpen(true);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fade-in overscroll-none"
      onClick={closeBookingModal}
    >
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full h-[90dvh] max-h-[90dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up overscroll-contain"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SUCCESS CONFIRMATION MODAL */}
        {createdBooking ? (
          <div className="p-4 sm:p-8 text-center space-y-4 sm:space-y-6 w-full max-w-full overflow-y-auto">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-8 h-8 sm:w-10 sm:h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <span className="inline-block px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-bold border border-emerald-200">
                {t('booking.success_badge')}
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {t('booking.success_title')}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
                {t('booking.success_desc')}
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200 gap-2">
                <span className="text-slate-500 shrink-0">Buyurtma raqami:</span>
                <span className="font-extrabold text-blue-600 text-sm sm:text-base">
                  #{createdBooking.id}
                </span>
              </div>

              {createdBooking.specialistName && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500 shrink-0">Tanlangan usta:</span>
                  <span className="font-bold text-slate-900 truncate text-right">
                    {createdBooking.specialistName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 shrink-0">Kutilayotgan javob vaqti:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 text-xs shrink-0">
                  {createdBooking.estimatedResponseTime}
                </span>
              </div>

              <div className="flex justify-between items-center gap-2">
                <span className="text-slate-500 shrink-0">Manzil:</span>
                <span className="font-semibold text-slate-800 truncate text-right">
                  {createdBooking.district}, {createdBooking.address}
                </span>
              </div>
            </div>

            {/* Notification Banner — Client Notification (Zero exposure of OwnerBot) */}
            <div className="p-3.5 sm:p-4 rounded-2xl bg-sky-50 border border-sky-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-left w-full">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-sky-950 truncate">
                    {t('booking.tg_notif_title', 'Arizangiz dispetcherga yo‘llandi')}
                  </div>
                  <div className="text-[11px] text-sky-700 font-medium truncate">
                    @{TELEGRAM_CLIENT_BOT_USERNAME}
                  </div>
                </div>
              </div>
              <a
                href={`https://t.me/${TELEGRAM_CLIENT_BOT_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 sm:py-2 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>{t('booking.open_bot', 'Botda kuzatish')}</span>
                <Send className="w-3.5 h-3.5 rotate-45 shrink-0" />
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
              <button
                type="button"
                onClick={handleViewBookings}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-colors cursor-pointer"
              >
                {t('booking.go_to_bookings')}
              </button>
              <button
                type="button"
                onClick={handleSuccessClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
              >
                {t('detail.close')}
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <>
            {/* Header */}
            <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between shrink-0">
              <div>
                <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                  {t('booking.quick_order')}
                </span>
                <h3 className="text-lg sm:text-2xl font-black text-white">
                  {bookingSpecialist
                    ? `${bookingSpecialist.name} ${t('booking.title_specialist')}`
                    : t('booking.title_general')}
                </h3>
              </div>

              <button
                onClick={closeBookingModal}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                aria-label={t('detail.close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 flex-1 min-h-0 overflow-y-auto overscroll-contain touch-pan-y">
              {/* If general booking, choose category */}
              {!bookingSpecialist && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('booking.category_label')}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {getCategoryName(c.id, c.name)}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {t('booking.urgency_label')}
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      urgency === 'urgent'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
                    <span>{t('booking.urgency_urgent')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('today')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      urgency === 'today'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>{t('booking.urgency_today')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('scheduled')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all cursor-pointer ${
                      urgency === 'scheduled'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>{t('booking.urgency_scheduled')}</span>
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('booking.description_label')}
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder={t('booking.description_placeholder')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />
              </div>

              {/* Photo Upload / Samples */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {t('booking.photo_label')}
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 cursor-pointer text-xs font-medium text-slate-600 transition-colors">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>{t('booking.photo_hint')}</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </label>

                  {photoPreview && (
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photoPreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotoPreview(null)}
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* District & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('booking.district_label')}
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    {DISTRICTS.filter((d) => d.id !== 'all').map((d) => (
                      <option key={d.id} value={d.name}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('booking.address_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder={t('booking.address_placeholder')}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qulay sana: *
                  </label>
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Qulay vaqt oralig&apos;i: *
                  </label>
                  <select
                    value={preferredTime}
                    onChange={(e) => setPreferredTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden cursor-pointer"
                  >
                    <option value="09:00 - 12:00">09:00 - 12:00</option>
                    <option value="12:00 - 15:00">12:00 - 15:00</option>
                    <option value="15:00 - 18:00">15:00 - 18:00</option>
                    <option value="18:00 - 21:00">18:00 - 21:00</option>
                    <option value="Ixtiyoriy vaqt">Ixtiyoriy vaqt (Zudlik bilan)</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('booking.client_name_label')}
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Anvar Karimov"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    {t('booking.client_phone_label')}
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+998 90 123 45 67"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeBookingModal}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95 cursor-pointer"
                >
                  {t('booking.submit_btn')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
