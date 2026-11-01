import { isContactType } from '@/module/contacts/domain/contact';

type Translate = (key: string, params?: Record<string, string | number>) => string;

/** Translated label of a contact type; a type the app does not know is shown as sent. */
export const contactTypeLabel = (t: Translate, type: string): string =>
  isContactType(type) ? t(`types.${type}`) : type || t('types.Lainnya');
