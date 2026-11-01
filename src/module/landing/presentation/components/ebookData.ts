export interface EbookItem {
  id: string;
  gradient: string;
  pages: number;
  readMinutes: number;
}

export const EBOOK_HIGHLIGHT_KEYS = ['first', 'second', 'third'] as const;

export const EBOOKS: readonly EbookItem[] = [
  {
    id: 'property-accounting-2026',
    gradient:
      'linear-gradient(135deg, var(--mantine-color-primary-6), var(--mantine-color-secondary-6))',
    pages: 48,
    readMinutes: 25,
  },
  {
    id: 'psak-ifrs-dictionary',
    gradient:
      'linear-gradient(135deg, var(--mantine-color-emerald-8), var(--mantine-color-emerald-5))',
    pages: 36,
    readMinutes: 15,
  },
  {
    id: 'bank-recon-mastery',
    gradient:
      'linear-gradient(135deg, var(--mantine-color-indigo-6), var(--mantine-color-indigo-4))',
    pages: 32,
    readMinutes: 20,
  },
];
