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
    gradient: 'linear-gradient(135deg, #053079, #09B2FF)',
    pages: 48,
    readMinutes: 25,
  },
  {
    id: 'psak-ifrs-dictionary',
    gradient: 'linear-gradient(135deg, #065F46, #10B981)',
    pages: 36,
    readMinutes: 15,
  },
  {
    id: 'bank-recon-mastery',
    gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    pages: 32,
    readMinutes: 20,
  },
];
