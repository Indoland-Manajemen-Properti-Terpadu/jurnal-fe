/** Characters that are invalid in file names become `_`. */
const safe = (transactionNumber: string): string =>
  transactionNumber.replace(/[/\\?%*:|"<>]/g, '_');

/** File name for a downloaded quote PDF. */
export const quoteFilename = (transactionNumber: string): string =>
  `Penawaran-${safe(transactionNumber)}.pdf`;

export const orderFilename = (transactionNumber: string): string =>
  `Pesanan-${safe(transactionNumber)}.pdf`;

export const returnFilename = (transactionNumber: string): string =>
  `Retur-${safe(transactionNumber)}.pdf`;
