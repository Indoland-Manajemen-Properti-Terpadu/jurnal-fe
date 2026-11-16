/** A size people read: whole KB below a megabyte (never "0"), MB above with one decimal when needed. */
export const formatFileSize = (bytes: number): string => {
  const megabytes = bytes / (1024 * 1024);
  if (megabytes < 1) return `${Math.max(1, Math.ceil(bytes / 1024))} KB`;
  const rounded = Math.round(megabytes * 10) / 10;
  return `${String(rounded).replace('.', ',')} MB`;
};
