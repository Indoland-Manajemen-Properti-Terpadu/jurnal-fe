export const MAX_IMPORT_FILE_BYTES = 5 * 1024 ** 2;

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];

export type ImportFileError = 'type' | 'size';

/** The upload step accepts spreadsheet files up to 5 MB; anything else is rejected before upload. */
export const validateImportFile = (file: {
  name: string;
  size: number;
}): ImportFileError | null => {
  const name = file.name.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.some((extension) => name.endsWith(extension))) return 'type';
  if (file.size > MAX_IMPORT_FILE_BYTES) return 'size';
  return null;
};

export const IMPORT_ACCEPT = ACCEPTED_EXTENSIONS.join(',');
