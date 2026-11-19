import { useQuery } from '@tanstack/react-query';
import type { QuoteListParams } from '../../domain/saleQuote';
import { fetchQuote, fetchQuotes } from '../../infrastructure/saleQuoteApi';

export const quoteKeys = {
  all: ['sales', 'quotes'] as const,
  lists: () => [...quoteKeys.all, 'list'] as const,
  list: (params: QuoteListParams) => [...quoteKeys.lists(), params] as const,
  detail: (id: string) => [...quoteKeys.all, 'detail', id] as const,
};

export const useQuotes = (params: QuoteListParams = {}) =>
  useQuery({
    queryKey: quoteKeys.list(params),
    queryFn: () => fetchQuotes(params),
    staleTime: 30_000,
  });

export const useQuote = (id?: string) =>
  useQuery({
    queryKey: quoteKeys.detail(id || ''),
    queryFn: () => fetchQuote(id || ''),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
