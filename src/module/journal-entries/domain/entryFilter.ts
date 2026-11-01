import type { JournalEntryByAccount } from './journalEntry';

/**
 * The search box matches the entry number, the memo, or any line description, account name or
 * account number. The date filter matches the calendar day of the entry.
 */
export const filterEntries = (
  entries: JournalEntryByAccount[],
  searchQuery: string,
  selectedDate: string | null
): JournalEntryByAccount[] =>
  entries.filter((item) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery =
      !q ||
      (item.transactionNumber !== undefined &&
        String(item.transactionNumber).toLowerCase().includes(q)) ||
      (item.notes && item.notes.toLowerCase().includes(q)) ||
      item.transactionDetail?.some(
        (td) =>
          td.description?.toLowerCase().includes(q) ||
          td.account?.name?.toLowerCase().includes(q) ||
          td.account?.accountNumber?.toLowerCase().includes(q)
      );

    const matchesDate =
      !selectedDate ||
      (item.transactionDate &&
        new Date(item.transactionDate).toDateString() === new Date(selectedDate).toDateString());

    return Boolean(matchesQuery && matchesDate);
  });
