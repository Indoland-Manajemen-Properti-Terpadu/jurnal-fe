/** Same limit as the manual journal: PDF, PNG or JPG, 30 MB per file. */
export const MAX_ATTACHMENT_BYTES = 30 * 1024 * 1024;

const sameFile = (a: File, b: File): boolean => a.name === b.name && a.size === b.size;

/** Adds dropped files after the chosen ones, leaving out a file that is already there. */
export const addAttachments = (current: File[], dropped: File[]): File[] =>
  dropped.reduce(
    (files, file) =>
      files.some((existing) => sameFile(existing, file)) ? files : [...files, file],
    current
  );

export const removeAttachment = (files: File[], index: number): File[] =>
  files.filter((_, position) => position !== index);

export { formatFileSize } from '@/utils/formatFileSize';
