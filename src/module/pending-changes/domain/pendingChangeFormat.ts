export const formatIDR = (value: number | string | undefined | null): string => {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num || isNaN(num)) return 'Rp 0';
  return `Rp ${num.toLocaleString('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDateTime = (dateStr: string | null | undefined, lang: string = 'id'): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
};
