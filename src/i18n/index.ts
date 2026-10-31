import { useI18nStore, AVAILABLE_LANGUAGES } from './store';
import { SupportedLanguage } from './types';

export * from './types';
export { AVAILABLE_LANGUAGES };

/**
 * React hook for accessing translations reactively.
 * Supports an optional default namespace:
 * ```tsx
 * const { t, i18n } = useTranslation('journal');
 * return <h1>{t('beginningBalance')}</h1>;
 * ```
 */
export function useTranslation(namespace?: string) {
  const language = useI18nStore((state) => state.language);
  const changeLanguage = useI18nStore((state) => state.setLanguage);
  const translate = useI18nStore((state) => state.translate);

  const translateKey = (key: string, params?: Record<string, string | number>) =>
    translate(key, params, namespace);

  return {
    t: translateKey,
    currentLanguage: language,
    i18n: {
      language,
      changeLanguage,
    },
  };
}

/**
 * Imperative translation function for usage outside of React components.
 */
export function t(
  key: string,
  params?: Record<string, string | number>,
  namespace?: string
): string {
  return useI18nStore.getState().translate(key, params, namespace);
}

/**
 * Imperative language setter.
 */
export function setLanguage(lang: SupportedLanguage): void {
  useI18nStore.getState().setLanguage(lang);
}

/**
 * Get the current active language.
 */
export function getLanguage(): SupportedLanguage {
  return useI18nStore.getState().language;
}

export default useTranslation;
