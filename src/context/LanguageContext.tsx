'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TRANSLATIONS } from '../lib/translations';

export const LANGUAGES = [
  { code: 'uz' as Language, label: "O'zbekcha", flag: '🇺🇿', short: 'UZ' },
  { code: 'ru' as Language, label: 'Русский', flag: '🇷🇺', short: 'RU' },
  { code: 'en' as Language, label: 'English', flag: '🇬🇧', short: 'EN' },
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
        if (savedLang && (savedLang === 'uz' || savedLang === 'ru' || savedLang === 'en')) {
          setLangState(savedLang);
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
    } catch {
      // ignore
    }
  };

  const t = (key: string, defaultVal?: string): string => {
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang];
    }
    if (entry && entry['uz']) {
      return entry['uz'];
    }
    return defaultVal || key;
  };

  const getCategoryName = (id: string, fallback?: string): string => {
    const key = `cat.${id}`;
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang];
    }
    return fallback || id;
  };

  const getCategoryDesc = (id: string, fallback?: string): string => {
    const key = `cat.${id}_desc`;
    const entry = TRANSLATIONS[key];
    if (entry && entry[lang]) {
      return entry[lang];
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
