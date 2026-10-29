export const reconciliationKeys = {
  all: ['get_reconciliation'] as const,
  byAccount: (idAccount: string) => ['get_reconciliation', idAccount] as const,
  allJournalDetails: ['journal_details_for_recon'] as const,
  journalDetails: (bankStatementId: string | null) =>
    ['journal_details_for_recon', bankStatementId] as const,
};
