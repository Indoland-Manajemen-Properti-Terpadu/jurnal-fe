import type { SaleStatus } from './sale';

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const compactIdrFormatter = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const dateTimeFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatIDR = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp 0';
  return idrFormatter.format(value);
};

export const formatCompactIDR = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp 0';
  return `Rp ${compactIdrFormatter.format(value)}`;
};

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

export const formatDateTime = (iso?: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateTimeFormatter.format(date);
};

export type SaleStatusLabelKey =
  | 'draft'
  | 'paid'
  | 'partial'
  | 'unpaid'
  | 'sent'
  | 'overdue'
  | 'void';

export type SaleStatusConfig = {
  color: string;
  /** Indonesian label, kept for features that have not moved to i18n yet. */
  label: string;
  /** Key under `sales.status` for translated labels. */
  labelKey: SaleStatusLabelKey;
  variant?: 'filled' | 'light' | 'outline';
};

export const getSaleStatusConfig = (status?: SaleStatus | string | null): SaleStatusConfig => {
  const norm = String(status || 'DRAFT').toUpperCase();
  switch (norm) {
    case 'PAID':
      return { color: 'teal', label: 'Lunas', labelKey: 'paid', variant: 'light' };
    case 'PARTIAL':
    case 'PARTIALLY_PAID':
      return { color: 'yellow', label: 'Sebagian', labelKey: 'partial', variant: 'light' };
    case 'OPEN':
    case 'UNPAID':
      return { color: 'blue', label: 'Belum Dibayar', labelKey: 'unpaid', variant: 'light' };
    case 'SENT':
      return { color: 'blue', label: 'Terkirim', labelKey: 'sent', variant: 'light' };
    case 'OVERDUE':
      return { color: 'red', label: 'Jatuh Tempo', labelKey: 'overdue', variant: 'filled' };
    case 'VOID':
      return { color: 'gray', label: 'Dibatalkan', labelKey: 'void', variant: 'outline' };
    case 'DRAFT':
    default:
      return { color: 'gray', label: 'Draft', labelKey: 'draft', variant: 'light' };
  }
};

/** File name for a downloaded invoice PDF; characters that are invalid in file names become `_`. */
export const invoiceFilename = (transactionNumber: string): string =>
  `Faktur-${transactionNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
