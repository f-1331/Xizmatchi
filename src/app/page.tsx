'use client';

import React from 'react';
import { AppProvider, useApp } from '../context/AppContext';
import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { CategoryGrid } from '../components/CategoryGrid';
import { ServicesCatalogSection } from '../components/ServicesCatalogSection';
import { EmergencyBanner } from '../components/EmergencyBanner';
import { FilterBar } from '../components/FilterBar';
import { SpecialistCard } from '../components/SpecialistCard';
import { SpecialistDetailModal } from '../components/SpecialistDetailModal';
import { BookingModal } from '../components/BookingModal';
import { AddSpecialistModal } from '../components/AddSpecialistModal';
import { MyBookingsModal } from '../components/MyBookingsModal';
import { FavoritesDrawer } from '../components/FavoritesDrawer';
import { AuthModal } from '../components/AuthModal';
import { HowItWorksSection } from '../components/HowItWorksSection';
import { SafetyGuaranteeBanner } from '../components/SafetyGuaranteeBanner';
import { Footer } from '../components/Footer';
import { ToastContainer } from '../components/ToastContainer';
import { ThemeModal } from '../components/ThemeModal';
import { QrCodeModal } from '../components/QrCodeModal';
import { LanguageModal } from '../components/LanguageModal';
import { ThemeFloatingButton } from '../components/ThemeFloatingButton';
import { LanguageFloatingButton } from '../components/LanguageFloatingButton';
import { MobileBottomNav } from '../components/MobileBottomNav';
import { Users, RotateCcw, PlusCircle } from 'lucide-react';
import { LanguageProvider, useLanguage } from '../context/LanguageContext';

function MainContent() {
  const { filteredSpecialists, resetFilters, setIsAddSpecialistModalOpen } = useApp();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 transition-colors duration-300">
      {/* Toast notifications */}
      <ToastContainer />

      {/* Navigation Header */}
      <Header />

      {/* Hero Section */}
      <HeroSection />

      {/* Main Body with mobile bottom nav padding */}
      <main className="flex-1 pb-28 md:pb-0">
        {/* Category Grid Section */}
        <CategoryGrid />

        {/* 38+ Popular Services & Price Guide Catalog */}
        <ServicesCatalogSection />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Emergency 24/7 Callout */}
          <EmergencyBanner />

          {/* Specialists Listing Section */}
          <section id="specialists-section" className="scroll-mt-24 pt-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-3">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider mb-1.5">
                  <Users className="w-3.5 h-3.5" /> {t('specialists.section_badge')}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {t('specialists.section_title')}
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {t('specialists.section_subtitle')}
                </p>
              </div>

              <button
                onClick={() => setIsAddSpecialistModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-blue-600/30 text-blue-600 hover:bg-blue-50 text-xs font-bold transition-colors cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{t('specialists.add_profile_btn')}</span>
              </button>
            </div>

            {/* Filter Bar */}
            <FilterBar />

            {/* Specialists Cards Grid */}
            {filteredSpecialists.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200/90 shadow-xs max-w-lg mx-auto my-12 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Users className="w-8 h-8 stroke-1" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  {t('specialists.not_found_title')}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                  {t('specialists.not_found_desc')}
                </p>
                <div className="pt-2">
                  <button
                    onClick={resetFilters}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>{t('specialists.reset_filters')}</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6">
                {filteredSpecialists.map((specialist) => (
                  <SpecialistCard key={specialist.id} specialist={specialist} />
                ))}
              </div>
            )}
          </section>
        </div>

        {/* How it works */}
        <HowItWorksSection />

        {/* Safety & Guarantee */}
        <SafetyGuaranteeBanner />
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals and Drawers */}
      <SpecialistDetailModal />
      <BookingModal />
      <AddSpecialistModal />
      <AuthModal />
      <MyBookingsModal />
      <FavoritesDrawer />
      <ThemeModal />
      <QrCodeModal />
      <LanguageModal />

      {/* Floating Buttons */}
      <ThemeFloatingButton />
      <LanguageFloatingButton />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav />
    </div>
  );
}

export default function Home() {
  return (
    <LanguageProvider>
      <AppProvider>
        <MainContent />
      </AppProvider>
    </LanguageProvider>
  );
}
