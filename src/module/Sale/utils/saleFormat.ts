import type { SaleStatus } from '../types/sale';

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

export const getSaleStatusConfig = (
  status?: SaleStatus | string | null
): { color: string; label: string; variant?: 'filled' | 'light' | 'outline' } => {
  const norm = String(status || 'DRAFT').toUpperCase();
  switch (norm) {
    case 'PAID':
      return { color: 'teal', label: 'Lunas', variant: 'light' };
    case 'PARTIAL':
    case 'PARTIALLY_PAID':
      return { color: 'yellow', label: 'Sebagian', variant: 'light' };
    case 'OPEN':
    case 'UNPAID':
      return { color: 'blue', label: 'Belum Dibayar', variant: 'light' };
    case 'SENT':
      return { color: 'blue', label: 'Terkirim', variant: 'light' };
    case 'OVERDUE':
      return { color: 'red', label: 'Jatuh Tempo', variant: 'filled' };
    case 'VOID':
      return { color: 'gray', label: 'Dibatalkan', variant: 'outline' };
    case 'DRAFT':
    default:
      return { color: 'gray', label: 'Draft', variant: 'light' };
  }
};
