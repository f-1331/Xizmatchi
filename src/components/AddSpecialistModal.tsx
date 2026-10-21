'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES, DISTRICTS } from '../data/mockData';
import { formatPrice } from '../lib/storage';
import {
  X,
  Phone,
  Send,
  ShieldCheck,
  CheckCircle2,
  Plus,
  Trash2,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  RefreshCw,
  Lock,
} from 'lucide-react';

export function AddSpecialistModal() {
  const { isAddSpecialistModalOpen, setIsAddSpecialistModalOpen, addSpecialist, showToast } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Step 1: Basic info
  const [name, setName] = useState('');
  const [profession, setProfession] = useState('');
  const [categoryId, setCategoryId] = useState('santexnika');
  const [experienceYears, setExperienceYears] = useState(5);
  const [district, setDistrict] = useState('Chilonzor tumani');

  // Step 2: Contact & Pricing
  const [startingPrice, setStartingPrice] = useState(100000);
  const [priceUnit, setPriceUnit] = useState("so'mdan");
  const [phone, setPhone] = useState('+998 ');
  const [telegram, setTelegram] = useState('@');
  const [isAvailable24_7, setIsAvailable24_7] = useState(false);
  const [customBadge, setCustomBadge] = useState('Sifat kafolati');

  // Step 3: Bio, Avatar, and Services
  const [bio, setBio] = useState('');
  const [avatar, setAvatar] = useState(
    'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400'
  );
  const [services, setServices] = useState<{ name: string; price: number; unit: string }[]>([
    { name: "Standart ta'mirlash xizmati", price: 100000, unit: 'xizmat' },
    { name: "Diagnostika va maslahat", price: 50000, unit: 'marta' },
  ]);
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState(100000);

  // Step 4: SMS Verification (Anti-prank / Real Specialist Protection)
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isSendingSms, setIsSendingSms] = useState(false);
  const [isVerifyingSms, setIsVerifyingSms] = useState(false);
  const [smsError, setSmsError] = useState('');
  const [demoSmsCode, setDemoSmsCode] = useState<string | null>(null);
  const [telegramDelivered, setTelegramDelivered] = useState(false);
  const [timer, setTimer] = useState(60);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timer]);

  // Lock body scroll when Add Specialist modal is open
  useEffect(() => {
    if (!isAddSpecialistModalOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isAddSpecialistModalOpen]);

  if (!isAddSpecialistModalOpen) return null;

  const handleAddService = () => {
    if (!newServiceName.trim()) return;
    setServices([
      ...services,
      { name: newServiceName.trim(), price: Number(newServicePrice), unit: 'xizmat' },
    ]);
    setNewServiceName('');
    setNewServicePrice(100000);
  };

  const handleRemoveService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  // Request SMS verification code
  const handleRequestSmsCode = async () => {
    const cleanDigits = phone.replace(/[^\d]/g, '');
    if (cleanDigits.length < 9) {
      showToast('Iltimos, to\'liq telefon raqamingizni kiriting (+998 90 123 45 67).', 'error');
      setStep(2);
      return;
    }

    setIsSendingSms(true);
    setSmsError('');

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'register_specialist' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'SMS kod yuborishda xatolik yuz berdi');
      }

      setDemoSmsCode(data.code);
      setTelegramDelivered(data.telegramDelivered);
      setTimer(60);
      setIsTimerActive(true);
      setStep(4);

      showToast(
        data.telegramDelivered
          ? 'SMS kod telefoningizga va Telegram botingizga yuborildi!'
          : `SMS tasdiqlash kodi: ${data.code}`,
        'info',
        'Xavfsizlik tekshiruvi'
      );
    } catch (err: unknown) {
      setSmsError(err instanceof Error ? err.message : 'SMS kod yuborishda xatolik yuz berdi.');
    } finally {
      setIsSendingSms(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setSmsError('');

    if (val && index < 3) {
      const nextInput = document.getElementById(`spec-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`spec-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 4: Verify SMS code and register specialist
  const handleVerifyAndSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 4) {
      setSmsError('Iltimos, 4 xonali SMS tasdiqlash kodini to\'liq kiriting.');
      return;
    }

    setIsVerifyingSms(true);
    setSmsError('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: fullCode,
          name: name.trim(),
          district,
          role: 'specialist',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'SMS tasdiqlash kodi noto\'g\'ri!');
      }

      // Code is 100% verified! Add specialist to catalogue
      addSpecialist({
        name: name.trim(),
        profession: profession.trim(),
        categoryId,
        experienceYears: Number(experienceYears),
        startingPrice: Number(startingPrice),
        priceUnit,
        phone: phone.trim(),
        telegram: telegram.trim(),
        district,
        avatar,
        bio:
          bio.trim() ||
          `${experienceYears} yillik tajribaga ega malakali usta. Sifatli va tezkor xizmat.`,
        services,
        portfolio: [
          {
            id: `port-${Date.now()}`,
            title: "Bajarilgan ish namunasi",
            image:
              'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=600',
            category: 'Standart',
          },
        ],
        isVerified: true,
        isAvailable24_7,
        badges: [
          'Tasdiqlangan usta',
          'SMS tekshiruvdan o\'tgan',
          customBadge || 'Kafolat beradi',
          isAvailable24_7 ? '24/7 xizmat' : 'Tezkor yetib borish',
        ],
      });

      setStep(5);
    } catch (err: unknown) {
      setSmsError(err instanceof Error ? err.message : 'Tasdiqlashda xatolik yuz berdi.');
    } finally {
      setIsVerifyingSms(false);
    }
  };

  const handleClose = () => {
    setIsAddSpecialistModalOpen(false);
    setTimeout(() => {
      setStep(1);
      setOtp(['', '', '', '']);
      setSmsError('');
      setDemoSmsCode(null);
    }, 200);
  };

  const avatarOptions = [
    {
      label: 'Erkak usta 1',
      url: 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Erkak usta 2',
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Erkak usta 3',
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Ayol mutaxassis 1',
      url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=400',
    },
    {
      label: 'Ayol mutaxassis 2',
      url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=400',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in overscroll-none">
      <div
        className="relative bg-white rounded-3xl max-w-2xl w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - shrink-0 */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div>
            <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Rasmiy Hamkorlik Dasturi
            </span>
            <h3 className="text-lg sm:text-2xl font-black text-white leading-tight">
              {step === 4
                ? "Telefon raqamni SMS orqali tasdiqlash"
                : step === 5
                ? "Tasdiqlandi va Qabul qilindi!"
                : "Usta sifatida ro'yxatdan o'tish"}
            </h3>
          </div>

          <button
            onClick={handleClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator - shrink-0 */}
        {step <= 4 && (
          <div className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-500 overflow-x-auto shrink-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 1 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                }`}
              >
                1
              </span>
              <span className={step >= 1 ? 'text-blue-600' : ''}>Ma&apos;lumotlar</span>
            </div>

            <div className="h-0.5 w-6 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 2 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                }`}
              >
                2
              </span>
              <span className={step >= 2 ? 'text-blue-600' : ''}>Aloqa</span>
            </div>

            <div className="h-0.5 w-6 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step >= 3 ? 'bg-blue-600 text-white' : 'bg-slate-200'
                }`}
              >
                3
              </span>
              <span className={step >= 3 ? 'text-blue-600' : ''}>Xizmatlar</span>
            </div>

            <div className="h-0.5 w-6 bg-slate-200 shrink-0" />

            <div className="flex items-center gap-1.5 shrink-0">
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  step === 4 ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
              </span>
              <span className={step === 4 ? 'text-emerald-700 font-extrabold' : ''}>
                SMS Tasdiqlash
              </span>
            </div>
          </div>
        )}

        {/* STEP 1 */}
        {step === 1 && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                To&apos;liq ism-familiyangiz: *
              </label>
              <input
                type="text"
                required
                placeholder="Masalan: Botir Rahimov"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mutaxassislik yo&apos;nalishi: *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kasb / Unvoningiz: *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Masalan: Oliy toifali elektrik"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ish tajribangiz (yil): *
                </label>
                <input
                  type="number"
                  min={1}
                  max={45}
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Asosiy xizmat ko&apos;rsatish tumani: *
                </label>
                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  {DISTRICTS.filter((d) => d.id !== 'all').map((dist) => (
                    <option key={dist.id} value={dist.name}>
                      {dist.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="button"
                disabled={!name.trim() || !profession.trim()}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Keyingi qadam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Boshlang&apos;ich xizmat narxi: *
                </label>
                <input
                  type="number"
                  step={10000}
                  value={startingPrice}
                  onChange={(e) => setStartingPrice(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Birlik:
                </label>
                <select
                  value={priceUnit}
                  onChange={(e) => setPriceUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600 bg-white"
                >
                  <option value="so'mdan">so&apos;mdan</option>
                  <option value="so'm / soat">so&apos;m / soat</option>
                  <option value="so'm / xizmat">so&apos;m / xizmat</option>
                  <option value="so'm / m²">so&apos;m / m²</option>
                </select>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <b className="font-bold">E&apos;tibor bering:</b> Kiritilgan telefon raqamingizga keyingi qadamda SMS tasdiqlash kodi yuboriladi. Haqiqiy telefoningizni kiriting.
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telefon raqamingiz: *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => {
                      let val = e.target.value;
                      if (!val.startsWith('+998')) val = '+998 ';
                      setPhone(val);
                    }}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Telegram manzilingiz:
                </label>
                <div className="relative">
                  <Send className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="@ustamiz"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Maxsus ko&apos;rsatkich (Badge):
              </label>
              <input
                type="text"
                value={customBadge}
                onChange={(e) => setCustomBadge(e.target.value)}
                placeholder="Masalan: 1 yil kafolat, Toza ishlovchi"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="modal247"
                checked={isAvailable24_7}
                onChange={(e) => setIsAvailable24_7(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500"
              />
              <label htmlFor="modal247" className="text-xs font-semibold text-slate-800 cursor-pointer">
                Tungi va shoshilinch chaqiruvlarga tayyorman (24/7 navbatchilik)
              </label>
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="button"
                disabled={phone.replace(/[^\d]/g, '').length < 9}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                <span>Keyingi qadam</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Profil rasmingizni tanlang:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {avatarOptions.map((opt, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setAvatar(opt.url)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition-all ${
                      avatar === opt.url
                        ? 'border-blue-600 ring-2 ring-blue-200 scale-105'
                        : 'border-slate-200 opacity-60 hover:opacity-100'
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={opt.url} alt={opt.label} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                O&apos;zingiz haqingizda qisqacha ma&apos;lumot:
              </label>
              <textarea
                rows={3}
                placeholder="Tajribangiz, ishlatadigan asbob-uskunalaringiz va mijozlarga takliflaringiz..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Services list */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ko&apos;rsatadigan xizmatlaringiz va narxlari:
              </label>

              <div className="space-y-2 mb-3">
                {services.map((srv, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm"
                  >
                    <span className="font-semibold text-slate-800">{srv.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-blue-700">
                        {formatPrice(srv.price)} / {srv.unit}
                      </span>
                      {services.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveService(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add new service row */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Xizmat nomi (masalan: Kran almashtirish)"
                  value={newServiceName}
                  onChange={(e) => setNewServiceName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <input
                  type="number"
                  step={10000}
                  placeholder="Narxi"
                  value={newServicePrice}
                  onChange={(e) => setNewServicePrice(Number(e.target.value))}
                  className="w-24 px-2 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm font-semibold focus:outline-hidden focus:ring-2 focus:ring-blue-600"
                />
                <button
                  type="button"
                  onClick={handleAddService}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Qo&apos;shish</span>
                </button>
              </div>
            </div>

            {/* Bottom Buttons */}
            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="button"
                disabled={isSendingSms}
                onClick={handleRequestSmsCode}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all active:scale-95 flex items-center gap-2 disabled:opacity-50"
              >
                {isSendingSms ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    SMS yuborilmoqda...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Davom etish (SMS Tasdiqlash)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: SMS VERIFICATION (ANTI-PRANK / REAL SPECIALIST PROTECTION) */}
        {step === 4 && (
          <form onSubmit={handleVerifyAndSubmit} className="p-6 space-y-4 animate-fade-in">
            {/* Anti-prank banner */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex items-start gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h5 className="font-bold text-sm text-amber-900">
                  Xavfsizlik va Haqiqiylik Nazorati
                </h5>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Platformamizda yosh bolalar, prank qiluvchilar yoki soxta arizalarning oldini olish maqsadida har bir usta o&apos;z telefon raqamini SMS kod orqali tasdiqlashi shart.
                </p>
              </div>
            </div>

            {smsError && (
              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{smsError}</span>
              </div>
            )}

            <div className="text-center pt-2">
              <p className="text-sm font-bold text-slate-800">
                {phone}
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Raqamiga yuborilgan 4 xonali SMS tasdiqlash kodini kiriting:
              </p>
            </div>

            {/* Demo Code Indicator */}
            {demoSmsCode && (
              <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-sky-950 text-xs">
                <div className="flex items-center justify-between font-bold mb-1">
                  <span>📱 SMS Xabar:</span>
                  <span className="font-mono bg-sky-200 px-2 py-0.5 rounded-lg text-sm text-sky-950">
                    {demoSmsCode}
                  </span>
                </div>
                <p className="text-sky-800 text-[11px]">
                  {telegramDelivered
                    ? "Kod @xizmatchiuz_Uzbekistan_bot Telegram botingizga ham jo'natildi. Ushbu kodni pastga kiriting."
                    : "Xizmat provayderi orqali yuborilgan SMS tasdiqlash kodi."}
                </p>
              </div>
            )}

            {/* OTP inputs */}
            <div className="flex justify-center gap-3 py-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  id={`spec-otp-${idx}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="w-14 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100 outline-hidden text-slate-900 transition-all"
                />
              ))}
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-slate-500 hover:text-slate-800 font-medium transition-colors"
              >
                Raqamni o&apos;zgartirish
              </button>

              {isTimerActive ? (
                <span className="text-slate-400 font-medium">
                  Qayta yuborish: {timer}s
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleRequestSmsCode}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Kodni qayta yuborish
                </button>
              )}
            </div>

            <div className="pt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold text-sm flex items-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Orqaga</span>
              </button>

              <button
                type="submit"
                disabled={isVerifyingSms || otp.join('').length < 4}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isVerifyingSms ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Tekshirilmoqda...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Tasdiqlash va Usta Bo&apos;lish</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: SUCCESS & VERIFICATION BADGE */}
        {step === 5 && (
          <div className="p-8 text-center space-y-5 animate-scale-up">
            <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
                <ShieldCheck className="w-4 h-4" /> SMS Tasdiqlangan Mutaxassis
              </span>
              <h4 className="text-2xl font-black text-slate-900">
                Tabriklaymiz, {name}!
              </h4>
              <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
                Telefon raqamingiz muvaffaqiyatli tekshirildi. Sizning profilingiz rasmiy ustalar ro&apos;yxatiga qo&apos;shildi va mijozlar sizga buyurtma bera oladi.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 max-w-sm mx-auto">
              <div className="flex justify-between">
                <span className="text-slate-500">Mutaxassis:</span>
                <span className="font-bold text-slate-900">{name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Soha:</span>
                <span className="font-bold text-blue-700">{profession}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Telefon:</span>
                <span className="font-bold text-slate-900">{phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Xizmat hududi:</span>
                <span className="font-bold text-slate-900">{district}</span>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="px-8 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-xl transition-all"
            >
              Ustalar ro&apos;yxatini ko&apos;rish
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
