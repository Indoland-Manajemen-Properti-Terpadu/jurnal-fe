import { routes } from '@/router/routes';
import { fetchSaleDetail } from '@/module/sales/infrastructure/saleApi';

/** A sale may have one journal per item; open the invoice when several need to be chosen. */
export const resolveInvoiceJournalPath = async (saleId: string): Promise<string> => {
  const sale = await fetchSaleDetail(saleId);
  const journalIds = [
    sale.journalId,
    ...sale.items.map((item) => item.journalTransaction || item.journalId),
  ].filter((id): id is string => Boolean(id));
  const uniqueIds = [...new Set(journalIds)];
  return uniqueIds.length === 1
    ? routes.journalEntries.detail.replace(':idTransaction', uniqueIds[0])
    : routes.sales.detail.replace(':id', saleId);
};
