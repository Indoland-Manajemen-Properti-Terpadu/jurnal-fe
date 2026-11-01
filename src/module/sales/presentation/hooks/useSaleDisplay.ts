import { useTranslation } from '@/i18n';

export function useSaleDisplay() {
  const { t, i18n } = useTranslation('saleDetail');
  const locale = i18n.language === 'en' ? 'en-US' : 'id-ID';
  const currency = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  });
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' });
  const dateTime = new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
  return {
    t,
    money: (value: number) => currency.format(value),
    date: (value: string | null) => (value ? date.format(new Date(value)) : '—'),
    dateTime: (value: string | null) => (value ? dateTime.format(new Date(value)) : '—'),
    number: (value: number) => new Intl.NumberFormat(locale).format(value),
  };
}

export type SaleDisplay = ReturnType<typeof useSaleDisplay>;
