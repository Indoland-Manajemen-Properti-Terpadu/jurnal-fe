import type { BankStatementPreviewItem } from '../domain/importPreview';

/** The upload response is kept here between the modal and the draft page. Key and shape are fixed. */
const STORAGE_KEY = 'bankStatementData';

export const saveImportDraft = (uploadResponse: unknown): void => {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(uploadResponse));
};

/** The preview rows of the stored upload; null when nothing is stored or it cannot be read. */
export const loadImportPreview = (): BankStatementPreviewItem[] | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;
  try {
    const parsed = JSON.parse(stored) as { data?: { preview?: BankStatementPreviewItem[] } } | null;
    return parsed?.data?.preview || [];
  } catch {
    return null;
  }
};
