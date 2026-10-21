'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../lib/translations';

export const LANGUAGES = [
  { code: 'uz' as Language, label: "O'zbekcha", flag: '🇺🇿', short: 'UZ' },
  { code: 'kaa' as Language, label: 'Qaraqalpaqsha', flag: '🇺🇿', short: 'KAA' },
  { code: 'ru' as Language, label: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'tr' as Language, label: 'Türkçe', flag: '🇹🇷', short: 'TR' },
  { code: 'kk' as Language, label: 'Қазақша', flag: '🇰🇿', short: 'KK' },
  { code: 'tg' as Language, label: 'Тоҷикӣ', flag: '🇹🇯', short: 'TG' },
  { code: 'ar' as Language, label: 'العربية', flag: '🇸🇦', short: 'AR' },
] as const;

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, defaultVal?: string) => string;
  getCategoryName: (id: string, fallback?: string) => string;
  getCategoryDesc: (id: string, fallback?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('uz');

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const savedLang = localStorage.getItem('xizmatchi_language') as Language;
        const validCodes: Language[] = ['uz', 'kaa', 'ru', 'en', 'tr', 'kk', 'tg', 'ar'];
        if (savedLang && validCodes.includes(savedLang)) {
          setLangState(savedLang);
          document.documentElement.lang = savedLang;
          document.documentElement.dir = savedLang === 'ar' ? 'rtl' : 'ltr';
        }
      } catch {
        // localStorage may be disabled in private browsing
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    try {
      localStorage.setItem('xizmatchi_language', newLang);
      document.documentElement.lang = newLang;
      document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    } catch {
      // ignore
    }
  };

  const t = (key: string, defaultVal?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang] as string;
    }
    if (entry && entry['uz']) {
      return entry['uz'] as string;
    }
    return defaultVal || key;
  };

  const getCategoryName = (id: string, fallback?: string): string => {
    const key = `cat.${id}`;
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang] as string;
    }
    if (entry && entry['uz']) {
      return entry['uz'] as string;
    }
    return fallback || id;
  };

  const getCategoryDesc = (id: string, fallback?: string): string => {
    const key = `cat.${id}_desc`;
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang] as string;
    }
    if (entry && entry['uz']) {
      return entry['uz'] as string;
    }
    return fallback || '';
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        getCategoryName,
        getCategoryDesc,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
