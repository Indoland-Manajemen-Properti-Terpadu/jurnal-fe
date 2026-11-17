/** Short Indonesian date (`15 Jan 2024`); an empty value renders a dash. */
export const formatAssetDate = (dateStr?: string | null): string => {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateStr;
  }
};

/** Month and year of a `YYYY-MM` value (`Oktober 2026`, `October 2026`); empty stays empty. */
export const formatAssetMonth = (month: string, language = 'id'): string => {
  if (!month) return '';
  const [year, index] = month.split('-').map(Number);
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(year, index - 1, 1));
};
