import { create } from 'zustand';
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import 'dayjs/locale/en';
import { SupportedLanguage, LanguageOption } from './types';
import { id } from './locales/id';
import { en } from './locales/en';

export const AVAILABLE_LANGUAGES: LanguageOption[] = [
  { code: 'id', label: 'Indonesia', nativeLabel: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'en', label: 'English', nativeLabel: 'English (US)', flag: '🇺🇸' },
];

export const translations: Record<SupportedLanguage, Record<string, unknown>> = {
  id,
  en,
};

const STORAGE_KEY = 'app_language';

const getInitialLanguage = (): SupportedLanguage => {
  if (typeof window === 'undefined') return 'id';
  const saved = localStorage.getItem(STORAGE_KEY) as SupportedLanguage;
  if (saved && (saved === 'id' || saved === 'en')) {
    return saved;
  }
  return 'id';
};

interface I18nStoreState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  translate: (path: string, params?: Record<string, string | number>, namespace?: string) => string;
}

// Synchronize dayjs and HTML document lang
const syncLocale = (lang: SupportedLanguage) => {
  try {
    dayjs.locale(lang === 'id' ? 'id' : 'en');
    if (typeof document !== 'undefined') {
      document.documentElement.lang = lang;
    }
  } catch (err) {
    console.warn('[i18n] Failed to sync locale with dayjs:', err);
  }
};

// Initial sync
const initialLang = getInitialLanguage();
syncLocale(initialLang);

export const useI18nStore = create<I18nStoreState>((set, get) => ({
  language: initialLang,
  setLanguage: (lang: SupportedLanguage) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
    }
    syncLocale(lang);
    set({ language: lang });
  },
  translate: (
    path: string,
    params?: Record<string, string | number>,
    namespace?: string
  ): string => {
    const currentLang = get().language;
    const fullPath = namespace ? `${namespace}.${path}` : path;
    const segments = fullPath.split('.');

    // Helper to traverse object
    const resolve = (lang: SupportedLanguage): unknown => {
      let current: unknown = translations[lang];
      for (const seg of segments) {
        if (!current || typeof current !== 'object') return undefined;
        current = (current as Record<string, unknown>)[seg];
      }
      return current;
    };

    // 1. Try current language
    let result = resolve(currentLang);

    // 2. Fallback to default (id) if missing in current
    if (result === undefined && currentLang !== 'id') {
      result = resolve('id');
    }

    // 3. Fallback to path itself if not found
    if (result === undefined) {
      return path;
    }

    if (typeof result !== 'string') {
      return String(result);
    }

    // Interpolation {param} or {{param}}
    if (params) {
      return Object.entries(params).reduce(
        (str, [k, v]) =>
          str
            .replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v))
            .replace(new RegExp(`\\{${k}\\}`, 'g'), String(v)),
        result
      );
    }

    return result;
  },
}));
