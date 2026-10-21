'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  Phone,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Smartphone,
  User,
} from 'lucide-react';
import { UserProfile } from '../types';

export function AuthModal() {
  const { isAuthModalOpen, setIsAuthModalOpen, currentUser, login, showToast } = useApp();

  const [step, setStep] = useState<'phone' | 'otp' | 'success'>('phone');
  const [phone, setPhone] = useState('+998 ');
  const [name, setName] = useState('');
  const [district] = useState('Chilonzor tumani');
  const [otp, setOtp] = useState(['', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [demoCode, setDemoCode] = useState<string | null>(null);
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

  // Lock body scroll when Auth modal is open
  useEffect(() => {
    if (!isAuthModalOpen) return;
    const origOverflow = document.body.style.overflow;
    const origTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = origOverflow;
      document.body.style.touchAction = origTouchAction;
    };
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    if (!val.startsWith('+998')) {
      val = '+998 ';
    }
    setPhone(val);
    setError('');
  };

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const digitsOnly = phone.replace(/[^\d]/g, '');
    if (digitsOnly.length < 9) {
      setError('Iltimos, to\'liq telefon raqamingizni kiriting (+998 90 123 45 67).');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, purpose: 'login' }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'SMS kod yuborishda xatolik');
      }

      setDemoCode(data.code);
      setTelegramDelivered(data.telegramDelivered);
      setStep('otp');
      setTimer(60);
      setIsTimerActive(true);
      showToast(
        data.telegramDelivered
          ? 'SMS kod telefoningizga va Telegram botingizga yuborildi!'
          : `SMS tasdiqlash kodi: ${data.code}`,
        'info',
        'SMS Yuborildi'
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);
    setError('');

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`auth-otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`auth-otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = otp.join('');
    if (fullCode.length < 4) {
      setError('Iltimos, 4 xonali SMS kodni to\'liq kiriting.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          code: fullCode,
          name: name.trim() || undefined,
          district,
          role: 'client',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || 'SMS kod noto\'g\'ri');
      }

      login(data.user as UserProfile);
      setStep('success');
      showToast('Profil muvaffaqiyatli tasdiqlandi va saytga kirdingiz!', 'success', 'Xush kelibsiz!');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Kodni tekshirishda xatolik.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setIsAuthModalOpen(false);
    // Reset state after transition
    setTimeout(() => {
      setStep('phone');
      setError('');
      setOtp(['', '', '', '']);
      setDemoCode(null);
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2.5 sm:p-4 md:p-6 animate-fade-in overscroll-none">
      <div
        className="relative bg-white rounded-3xl max-w-md w-full max-h-[92dvh] sm:max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-scale-up my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20 shrink-0">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <span className="text-xs text-blue-200 font-semibold uppercase tracking-wider">
                Yagona hisob
              </span>
              <h3 className="text-base sm:text-xl font-black text-white leading-tight">
                {step === 'phone' ? "Tizimga kirish" : step === 'otp' ? "SMS Tasdiqlash" : "Muvaffaqiyatli!"}
              </h3>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer shrink-0"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex-1 min-h-0 overflow-y-auto overscroll-contain">
          {error && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {step === 'phone' && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-sm text-slate-600">
                  Telefon raqamingiz orqali kiring. Botdagi va saytdagi ma&apos;lumotlaringiz bir xil bo&apos;ladi.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ismingiz (ixtiyoriy)
                </label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Masalan: Sardor Rahimiy"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden font-medium text-slate-900 transition-all text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Telefon raqamingiz <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={handlePhoneChange}
                    placeholder="+998 90 123 45 67"
                    className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden font-semibold text-slate-900 transition-all text-sm"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Ushbu raqamga 4 xonali SMS kod jo&apos;natiladi.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      SMS kod yuborilmoqda...
                    </>
                  ) : (
                    <>
                      <span>SMS kod olish</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              {/* Telegram sync notice */}
              <div className="mt-4 p-3 rounded-2xl bg-sky-50 border border-sky-100 flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
                <p className="text-xs text-sky-800 leading-relaxed">
                  Agar Telegram botimiz (<b>@xizmatchiuz_Uzbekistan_bot</b>) orqali kirsangiz, bu yerda kiritilgan raqam avtomatik bitta hisob sifatida birlashadi!
                </p>
              </div>
            </form>
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div className="text-center pb-2">
                <p className="text-sm font-semibold text-slate-800">
                  {phone}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Raqamiga yuborilgan 4 xonali SMS tasdiqlash kodini kiriting:
                </p>
              </div>

              {/* Demo Code Indicator */}
              {demoCode && (
                <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  <div className="flex items-center justify-between font-bold mb-1">
                    <span>📱 SMS Tasdiqlash Xabari:</span>
                    <span className="font-mono bg-amber-200 px-2 py-0.5 rounded-lg text-sm text-amber-950">
                      {demoCode}
                    </span>
                  </div>
                  <p className="text-amber-700 text-[11px]">
                    {telegramDelivered
                      ? "Kod Telegram botingizga ham yuborildi. Yuqoridagi kodni pastdagi kataklarga kiriting."
                      : "Xavfsizlik tizimi tomonidan taqdim etilgan 4 xonali kod."}
                  </p>
                </div>
              )}

              {/* 4-digit OTP Inputs */}
              <div className="flex justify-center gap-3 py-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`auth-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-14 h-14 text-center text-2xl font-black rounded-2xl border-2 border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-100 outline-hidden text-slate-900 transition-all"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
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
                    onClick={() => handleSendCode()}
                    className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1 transition-colors"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Kodni qayta yuborish
                  </button>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || otp.join('').length < 4}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Tasdiqlash va Kirish</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <h4 className="text-xl font-black text-slate-900">
                  Xush kelibsiz!
                </h4>
                <p className="text-sm text-slate-600 mt-1">
                  Telefon raqamingiz muvaffaqiyatli tasdiqlandi va profil faollashdi.
                </p>
              </div>

              {currentUser && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Foydalanuvchi:</span>
                    <span className="font-bold text-slate-900">{currentUser.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Telefon:</span>
                    <span className="font-bold text-slate-900">{currentUser.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Holat:</span>
                    <span className="font-bold text-emerald-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> SMS Tasdiqlangan
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={closeModal}
                className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all"
              >
                Davom etish
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
