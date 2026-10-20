'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  Share2,
  Smartphone,
  Sparkles,
  Camera,
  Send,
} from 'lucide-react';

export function QrCodeModal() {
  const { isQrModalOpen, setIsQrModalOpen, showToast } = useApp();
  const { t } = useLanguage();

  const [copied, setCopied] = useState(false);
  const [siteUrl, setSiteUrl] = useState('https://xizmatchi.vercel.app');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Use current window origin or default domain
      const origin = window.location.origin;
      if (origin && !origin.includes('localhost')) {
        setSiteUrl(origin);
      }
    }
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isQrModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsQrModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isQrModalOpen, setIsQrModalOpen]);

  if (!isQrModalOpen) return null;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&margin=12&format=svg&data=${encodeURIComponent(
    siteUrl
  )}`;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(siteUrl);
      } else {
        const input = document.createElement('input');
        input.value = siteUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      showToast(t('qrcode.copied', 'Havola nusxalandi!'), 'success', 'QR Kod');
      setTimeout(() => setCopied(false), 2500);
    } catch {
      showToast('Nusxalash imkoni bo‘lmadi', 'error');
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Xizmatchi — O‘zbekiston usta va maishiy xizmatlar portali',
          text: 'Xizmatchi portali orqali professional ustalarni tez va qulay chaqiring!',
          url: siteUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fade-in"
      onClick={() => setIsQrModalOpen(false)}
    >
      <div
        className="relative bg-white rounded-3xl max-w-md w-full shadow-2xl overflow-hidden border border-slate-200/90 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center backdrop-blur-xs border border-white/20 text-white shadow-inner">
              <QrCode className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white">
                  {t('qrcode.title', 'Platformaga tezkor kirish')}
                </h3>
              </div>
              <p className="text-xs text-blue-100 flex items-center gap-1 font-medium mt-0.5">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>Xizmatchi — O‘zbekiston</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setIsQrModalOpen(false)}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Yopish"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 sm:p-6 space-y-4 sm:space-y-5">
          <p className="text-xs sm:text-sm text-slate-600 text-center leading-relaxed">
            {t(
              'qrcode.subtitle',
              'Telefon kamerasi yoki Telegram orqali QR kodni skanerlang va platformaga bir zumda kiring!'
            )}
          </p>

          {/* QR Code Graphic Frame */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative p-3.5 sm:p-4 rounded-3xl bg-gradient-to-b from-blue-50 to-slate-100 border-2 border-blue-200/80 shadow-md">
              <div className="bg-white p-3 rounded-2xl shadow-inner border border-slate-200 flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImageUrl}
                  alt="Xizmatchi Platform QR Code"
                  width={240}
                  height={240}
                  className="w-48 h-48 sm:w-56 sm:h-56 object-contain rounded-lg"
                  loading="eager"
                />
              </div>

              {/* Brand center badge */}
              <div className="mt-2 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-700">
                <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                <span>{siteUrl.replace(/^https?:\/\//, '')}</span>
              </div>
            </div>
          </div>

          {/* Scanner Instructions */}
          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-700">
              <Camera className="w-4 h-4 text-blue-600" />
              <span>Telefon kamerasi</span>
            </div>
            <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col items-center gap-1 text-[11px] font-semibold text-slate-700">
              <Send className="w-4 h-4 text-sky-500" />
              <span>Telegram orqali</span>
            </div>
          </div>

          {/* URL Box & Actions */}
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 sm:p-2.5 rounded-2xl bg-slate-100 border border-slate-200 text-xs">
              <span className="font-mono text-slate-800 truncate select-all px-1.5 font-bold">
                {siteUrl}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer text-xs shrink-0 ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-white hover:bg-slate-200/80 text-slate-800 border border-slate-300 shadow-2xs'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Nusxalandi</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-blue-600" />
                    <span>Nusxalash</span>
                  </>
                )}
              </button>
            </div>

            {/* Action Buttons: Share & Open */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-slate-100 hover:bg-slate-200/80 text-slate-800 font-bold text-xs transition-colors border border-slate-200 cursor-pointer"
              >
                <Share2 className="w-4 h-4 text-blue-600" />
                <span>{t('qrcode.share', 'Ulashish')}</span>
              </button>

              <a
                href={siteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors shadow-xs cursor-pointer"
              >
                <ExternalLink className="w-4 h-4" />
                <span>{t('qrcode.open_site', 'Saytni ochish')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
