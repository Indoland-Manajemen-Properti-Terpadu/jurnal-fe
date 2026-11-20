export const journalMatchKeys = {
  all: ['journal_matches'] as const,
  byJournal: (journalId: string) => ['journal_matches', journalId] as const,
};
