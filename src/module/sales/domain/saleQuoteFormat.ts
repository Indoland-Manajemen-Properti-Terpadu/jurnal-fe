/** File name for a downloaded quote PDF; characters that are invalid in file names become `_`. */
export const quoteFilename = (transactionNumber: string): string =>
  `Penawaran-${transactionNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`;
