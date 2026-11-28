import { useQuery } from '@tanstack/react-query';
import { downloadInvoicePdf } from '../../infrastructure/saleApi';

export const useReminderInvoicePdf = (invoiceId?: string) =>
  useQuery({
    queryKey: ['sales', 'reminder-pdf', invoiceId],
    queryFn: () => downloadInvoicePdf(invoiceId || ''),
    enabled: Boolean(invoiceId),
    staleTime: 30_000,
  });
