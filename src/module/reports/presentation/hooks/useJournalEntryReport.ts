import { useQuery } from '@tanstack/react-query';
import type { ReportJournalEntryModel } from '@/module/reports/domain/JournalEntry.types';
import { fetchJournalEntryReport } from '@/module/reports/infrastructure/businessOverviewApi';

export const useJournalEntryReport = (fromDate?: string, toDate?: string) =>
  useQuery<ReportJournalEntryModel[]>({
    queryKey: ['journal_entry_report', { fromDate, toDate }],
    queryFn: () => fetchJournalEntryReport(fromDate, toDate),
    retry: false,
  });
