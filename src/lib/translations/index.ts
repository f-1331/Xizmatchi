import { uz } from './uz';
import { kaa } from './kaa';
import { ru } from './ru';
import { en } from './en';
import { tr } from './tr';
import { kk } from './kk';
import { tg } from './tg';
import { ar } from './ar';

export type Language = 'uz' | 'kaa' | 'ru' | 'en' | 'tr' | 'kk' | 'tg' | 'ar';

export interface TranslationDictionary {
  [key: string]: Partial<Record<Language, string>> & { uz: string };
}

// Combined translation dictionary with guaranteed fallback to uz
export const TRANSLATIONS: TranslationDictionary = {};

const allKeys = new Set([
  ...Object.keys(uz),
  ...Object.keys(kaa),
  ...Object.keys(ru),
  ...Object.keys(en),
  ...Object.keys(tr),
  ...Object.keys(kk),
  ...Object.keys(tg),
  ...Object.keys(ar),
]);

allKeys.forEach((key) => {
  TRANSLATIONS[key] = {
    uz: uz[key] || key,
    kaa: kaa[key] || uz[key] || key,
    ru: ru[key] || uz[key] || key,
    en: en[key] || uz[key] || key,
    tr: tr[key] || uz[key] || key,
    kk: kk[key] || uz[key] || key,
    tg: tg[key] || uz[key] || key,
    ar: ar[key] || uz[key] || key,
  };
});
