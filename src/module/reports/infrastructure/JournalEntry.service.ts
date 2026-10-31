import { API_REPORT } from '@/services/endpoint';
import { useQuery } from '@tanstack/react-query';
import { get } from '@/lib/http/apiClient';
import { ReportJournalEntryModel } from '@/module/reports/domain/JournalEntry.types';

export const GetJournalEntryReport = (fromDate?: string, toDate?: string) => {
  return useQuery<ReportJournalEntryModel[]>({
    queryKey: ['journal_entry_report', { fromDate, toDate }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (fromDate) params.append('fromDate', fromDate);
      if (toDate) params.append('toDate', toDate);

      const result = await get(`${API_REPORT.GET_JOURNAL_ENTRY_REPORT}?${params.toString()}`);
      return result;
    },
    retry: false,
    // enabled: Boolean(fromDate && toDate),
  });
};
