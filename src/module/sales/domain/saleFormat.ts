import type { SaleStatus } from './sale';

const idrFormatter = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});

const decimalFormatter = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 1 });
const countFormatter = new Intl.NumberFormat('id-ID');

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

const COMPACT_UNITS = [
  { size: 1e12, name: 'triliun' },
  { size: 1e9, name: 'miliar' },
  { size: 1e6, name: 'jt' },
];

/** Short money for statistic cards: "Rp 2,1 jt", "Rp 7,3 miliar"; below a million it is written in full. */
export const formatCompactIDR = (value?: number | null): string => {
  if (value === null || value === undefined || Number.isNaN(value)) return 'Rp 0';
  const abs = Math.abs(value);
  const index = COMPACT_UNITS.findIndex((unit) => abs >= unit.size);
  if (index === -1) return formatIDR(value);
  let unit = COMPACT_UNITS[index];
  let scaled = Math.round((value / unit.size) * 10) / 10;
  // 999,96 jt rounds to 1.000 jt: say 1 miliar instead.
  if (Math.abs(scaled) >= 1000 && index > 0) {
    unit = COMPACT_UNITS[index - 1];
    scaled = Math.round((value / unit.size) * 10) / 10;
  }
  return `Rp ${decimalFormatter.format(scaled)} ${unit.name}`;
};

/** A count with thousands separators. */
export const formatCount = (value: number): string => countFormatter.format(value);

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

/** Public address of an invoice; the backend only returns the link's token. */
export const buildInvoiceLink = (origin: string, token: string): string =>
  `${origin.replace(/\/+$/, '')}/invoice/${token}`;
