export const MAX_FILES = 5;
export const MAX_FILE_BYTES = 5 * 1024 * 1024;

/** The i18n key of the first problem with the chosen files, or null when they are fine. */
export const validateAttachments = (files: File[]): string | null => {
  if (files.length > MAX_FILES) return 'validation.filesTooMany';
  if (files.some((file) => file.size > MAX_FILE_BYTES)) return 'validation.fileTooLarge';
  return null;
};
