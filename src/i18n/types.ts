export type SupportedLanguage = 'id' | 'en';

export interface LanguageOption {
  code: SupportedLanguage;
  label: string;
  nativeLabel: string;
  flag: string;
}

export type TranslationDictionary = Record<string, Record<string, unknown>>;

export interface I18nContextState {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
}
