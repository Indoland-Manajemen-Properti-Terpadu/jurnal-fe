/** TanStack Query keys of this module. */
export const journalEntryKeys = {
  /** Prefix of every journal list of every account (used to refresh them after a change). */
  allByAccount: ['transaction_by_account'] as const,
  byAccount: (idAccount: string) =>
    ['transaction_by_account', idAccount, { sortBy: 'transactionNumber' }] as const,
  detail: (idEntry: string) => ['detail_transaction', idEntry] as const,
  allDetails: ['detail_transaction'] as const,
  /** Prefix of every page of the journal history. */
  allHistory: ['journal_history'] as const,
  history: (filters: unknown) => ['journal_history', filters] as const,
  tags: ['tags'] as const,
};
