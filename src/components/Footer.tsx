'use client';

import React from 'react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../data/mockData';
import { Logo } from './Logo';
import {
  Wrench,
  Phone,
  Send,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  PlusCircle,
} from 'lucide-react';

export function Footer() {
  const { setFilters, setIsAddSpecialistModalOpen } = useApp();

  const handleCategoryClick = (catId: string) => {
    setFilters((prev) => ({ ...prev, categoryId: catId }));
    const el = document.getElementById('specialists-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-900">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Logo theme="dark" />

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-sm">
              Xonadonlar, kottejlar va ofislar uchun ishonchli va malakali ustalarni
              tez va oson topish platformasi. Halol narxlar, shaffof sharhlar va kafolatli xizmat.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <button
                onClick={() => setIsAddSpecialistModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-md active:scale-95"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Usta sifatida qo&apos;shilish</span>
              </button>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Xizmat toifalari</h4>
            <ul className="space-y-2 text-xs">
              {CATEGORIES.slice(0, 8).map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => handleCategoryClick(c.id)}
                    className="hover:text-blue-400 transition-colors text-left"
                  >
                    {c.name} xizmati
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Information Links */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Foydalanuvchilarga</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                  Qanday ishlaydi?
                </a>
              </li>
              <li>
                <a href="#specialists-section" className="hover:text-blue-400 transition-colors">
                  Barcha ustalar reytingi
                </a>
              </li>
              <li>
                <button
                  onClick={() => setIsAddSpecialistModalOpen(true)}
                  className="hover:text-blue-400 transition-colors text-left"
                >
                  Usta bo&apos;lib ishlash
                </button>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Xavfsizlik qoidalari
                </span>
              </li>
              <li>
                <span className="hover:text-blue-400 transition-colors cursor-pointer">
                  Ko&apos;p beriladigan savollar (FAQ)
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white text-sm mb-4">Aloqa & Qo&apos;llab-quvvatlash</h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href="tel:+998712000000" className="text-white font-bold hover:underline">
                  +998 (71) 200-00-00
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Send className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href="https://t.me/xizmatchiuz_Uzbekistan_bot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white"
                >
                  @xizmatchiuz_Uzbekistan_bot
                </a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <a
                  href="https://xizmatchiuz.netlify.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white"
                >
                  xizmatchiuz.netlify.app
                </a>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-slate-300 leading-snug">
                  Toshkent shahri, Amir Temur shoh ko&apos;chasi, 107B
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Xizmatchi Platformasi. Barcha huquqlar himoyalangan.</p>
          <p className="flex items-center gap-1">
            O&apos;zbekistonda mehr bilan yaratilgan <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
          </p>
        </div>
      </div>
    </footer>
  );
}
