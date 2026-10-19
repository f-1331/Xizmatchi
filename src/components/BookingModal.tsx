'use client';

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
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
import { sendBookingToTelegram, TELEGRAM_BOT_USERNAME } from '../lib/telegram';

export function BookingModal() {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingSpecialist,
    bookingCategory,
    createBooking,
    setIsMyBookingsOpen,
  } = useApp();

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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in">
      <div
        className="relative bg-white rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* SUCCESS CONFIRMATION MODAL */}
        {createdBooking ? (
          <div className="p-6 sm:p-8 text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                Buyurtma muvaffaqiyatli qabul qilindi!
              </span>
              <h3 className="text-2xl font-black text-slate-900">
                Tez orada siz bilan bog&apos;lanishadi
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Buyurtmangiz tizimda ro&apos;yxatdan o&apos;tkazildi va Telegram orqali mutaxassisga yo&apos;llandi.
              </p>
            </div>

            {/* Order Details Card */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-3 text-xs sm:text-sm">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500">Buyurtma raqami:</span>
                <span className="font-extrabold text-blue-600 text-base">
                  #{createdBooking.id}
                </span>
              </div>

              {createdBooking.specialistName && (
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Tanlangan usta:</span>
                  <span className="font-bold text-slate-900">
                    {createdBooking.specialistName}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Kutilayotgan javob vaqti:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {createdBooking.estimatedResponseTime}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slate-500">Manzil:</span>
                <span className="font-semibold text-slate-800 truncate max-w-[220px]">
                  {createdBooking.district}, {createdBooking.address}
                </span>
              </div>
            </div>

            {/* Telegram Notification Banner */}
            <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between gap-3 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Send className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-sky-950">Telegram botga yuborildi</div>
                  <div className="text-[11px] text-sky-700 font-medium">@{TELEGRAM_BOT_USERNAME}</div>
                </div>
              </div>
              <a
                href={`https://t.me/${TELEGRAM_BOT_USERNAME}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors shrink-0 flex items-center gap-1"
              >
                <span>Botni ochish</span>
              </a>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleViewBookings}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-colors"
              >
                Buyurtmalarim bo&apos;limiga o&apos;tish
              </button>
              <button
                type="button"
                onClick={handleSuccessClose}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-sm transition-colors"
              >
                Yopish
              </button>
            </div>
          </div>
        ) : (
          /* BOOKING FORM */
          <>
            {/* Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-900 to-indigo-900 text-white flex items-center justify-between">
              <div>
                <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                  Tezkor buyurtma
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  {bookingSpecialist
                    ? `${bookingSpecialist.name}ni chaqirish`
                    : "Ustani chaqirish (Ariza qoldirish)"}
                </h3>
              </div>

              <button
                onClick={closeBookingModal}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                aria-label="Yopish"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {/* If general booking, choose category */}
              {!bookingSpecialist && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Xizmat sohasini tanlang: *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Urgency Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Qanchalik shoshilinch? *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setUrgency('urgent')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      urgency === 'urgent'
                        ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Flame className="w-4 h-4 text-rose-600 fill-rose-600 animate-pulse" />
                    <span>Shoshilinch</span>
                    <span className="text-[10px] font-normal text-slate-500">~1 soatda</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('today')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      urgency === 'today'
                        ? 'bg-blue-50 border-blue-500 text-blue-700 ring-2 ring-blue-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span>Bugun</span>
                    <span className="text-[10px] font-normal text-slate-500">kun davomida</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUrgency('scheduled')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition-all ${
                      urgency === 'scheduled'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Rejali</span>
                    <span className="text-[10px] font-normal text-slate-500">aniq kunda</span>
                  </button>
                </div>
              </div>

              {/* Problem Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Muammo tavsifi: *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Nimani tuzatish yoki o'rnatish kerakligini qisqacha tushuntiring..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                />

                {/* Quick description templates */}
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {[
                    "Smesitel tagidan suv oqyapti",
                    "Elektr quvvat uzildi / avtomat o'chdi",
                    "Konditsioner yaxshi sovutmayapti",
                    "Qulf buzildi, ochilmayapti",
                    "Kameralar va domofon o'rnatish",
                    "Akfa derazadan shamol kiryapti",
                    "Yuk tashish uchun mashina va ishchilar",
                    "Klop va tarakanga qarshi dezinfeksiya",
                    "Akkumulyator 'prikurit' qilish kerak",
                    "Katyol bosimi tushib ketyapti",
                  ].map((temp) => (
                    <button
                      key={temp}
                      type="button"
                      onClick={() => setDescription(temp)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-blue-100 text-slate-600 hover:text-blue-700 transition-colors"
                    >
                      + {temp}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photo Upload / Samples */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Muammo fotosurati (ixtiyoriy):
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 cursor-pointer text-xs font-medium text-slate-600 transition-colors">
                    <UploadCloud className="w-4 h-4 text-blue-600" />
                    <span>Rasm yuklash</span>
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
                        className="absolute top-0 right-0 bg-red-600 text-white p-0.5 rounded-bl"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Quick sample damage preview */}
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[11px] text-slate-400">Namuna rasmlar:</span>
                  {[
                    {
                      label: 'Kran',
                      url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=300',
                    },
                    {
                      label: 'Shchit',
                      url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&q=80&w=300',
                    },
                  ].map((s) => (
                    <button
                      key={s.label}
                      type="button"
                      onClick={() => handleSamplePhoto(s.url)}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-600"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* District & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tuman: *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
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
                    Aniq manzil (ko&apos;cha, uy, xonadon): *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Masalan: Chilonzor 9, 12-uy, 34-xonadon"
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
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm font-medium focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-hidden"
                  >
                    <option value="09:00 - 12:00">09:00 - 12:00 (Ertalab)</option>
                    <option value="12:00 - 15:00">12:00 - 15:00 (Tushdan keyin)</option>
                    <option value="15:00 - 18:00">15:00 - 18:00 (Kechki payt)</option>
                    <option value="18:00 - 21:00">18:00 - 21:00 (Kechqurun)</option>
                    <option value="Ixtiyoriy vaqt">Ixtiyoriy vaqt (Zudlik bilan)</option>
                  </select>
                </div>
              </div>

              {/* Client Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ism-familiyangiz: *
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
                    Telefon raqamingiz: *
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
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-colors"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
                >
                  Buyurtmani tasdiqlash
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
