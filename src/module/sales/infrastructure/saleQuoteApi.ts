import apiClient from '@/lib/http/apiClient';
import type { SaleDocPage } from '../domain/saleDocument';
import type { QuoteListParams, QuoteSummary, SaleQuote } from '../domain/saleQuote';
import type { QuoteFormValues } from '../domain/saleQuoteForm';
import type { SaleDocPageDto } from './saleDocDto';
import { mapDocPage } from './saleDocMapper';
import type { QuoteSummaryDto, SaleQuoteDto } from './saleQuoteDto';
import { mapQuoteDto, mapQuoteSummary } from './saleQuoteMapper';
import { buildQuoteBody, buildSendBody, type SendQuoteInput } from './saleQuotePayloads';

export const QUOTE_ENDPOINTS = {
  quotes: '/v1/sale-quotes',
  detail: (id: string) => `/v1/sale-quotes/${id}`,
  print: (id: string) => `/v1/sale-quotes/${id}/print`,
  send: (id: string) => `/v1/sale-quotes/${id}/send`,
  resend: (id: string) => `/v1/sale-quotes/${id}/resend`,
  revise: (id: string) => `/v1/sale-quotes/${id}/revise`,
  accept: (id: string) => `/v1/sale-quotes/${id}/accept`,
  reject: (id: string) => `/v1/sale-quotes/${id}/reject`,
  void: (id: string) => `/v1/sale-quotes/${id}/void`,
  duplicate: (id: string) => `/v1/sale-quotes/${id}/duplicate`,
} as const;

type Envelope<T> = { code: number; message: string; data: T };

export interface SendQuoteResult {
  quote: SaleQuote;
  emailSent: boolean;
  emailRecipients: string[];
  emailError: string;
}

export const fetchQuotes = async (
  params: QuoteListParams = {}
): Promise<SaleDocPage<SaleQuote, QuoteSummary>> => {
  const page = params.page || 1;
  const limit = params.limit || 10;
  const { data } = await apiClient.get<Envelope<SaleDocPageDto<SaleQuoteDto, QuoteSummaryDto>>>(
    QUOTE_ENDPOINTS.quotes,
    {
      params: {
        page,
        limit,
        tab: params.tab || undefined,
        status: params.status && params.status !== 'all' ? params.status : undefined,
        customer: params.customer || undefined,
        search: params.search?.trim() || undefined,
        startDate: params.startDate || undefined,
        endDate: params.endDate || undefined,
        sortBy: params.sortBy || undefined,
        sortOrder: params.sortBy ? params.sortOrder : undefined,
      },
    }
  );
  return mapDocPage(data.data, mapQuoteDto, mapQuoteSummary, { page, limit });
};

export const fetchQuote = async (id: string): Promise<SaleQuote> => {
  const { data } = await apiClient.get<Envelope<SaleQuoteDto>>(QUOTE_ENDPOINTS.detail(id));
  return mapQuoteDto(data.data);
};

export const createQuote = async (values: QuoteFormValues): Promise<SaleQuote> => {
  const { data } = await apiClient.post<Envelope<SaleQuoteDto>>(
    QUOTE_ENDPOINTS.quotes,
    buildQuoteBody(values, 'create')
  );
  return mapQuoteDto(data.data);
};

export const updateQuote = async (id: string, values: QuoteFormValues): Promise<SaleQuote> => {
  const { data } = await apiClient.put<Envelope<SaleQuoteDto>>(
    QUOTE_ENDPOINTS.detail(id),
    buildQuoteBody(values, 'update')
  );
  return mapQuoteDto(data.data);
};

export const deleteQuote = async (id: string): Promise<void> => {
  await apiClient.delete(QUOTE_ENDPOINTS.detail(id));
};

const mapSendResult = (dto: SaleQuoteDto): SendQuoteResult => ({
  quote: mapQuoteDto(dto),
  emailSent: Boolean(dto.emailSent),
  emailRecipients: dto.emailRecipients ?? [],
  emailError: dto.emailError || '',
});

/** Marks a draft as sent; with addresses the email goes out after the status changed. */
export const sendQuote = async (id: string, input: SendQuoteInput): Promise<SendQuoteResult> => {
  const { data } = await apiClient.post<Envelope<SaleQuoteDto>>(
    QUOTE_ENDPOINTS.send(id),
    buildSendBody(input)
  );
  return mapSendResult(data.data);
};

/** Emails again; an empty address list uses the saved ones, else the customer's. */
export const resendQuote = async (id: string, input: SendQuoteInput): Promise<SendQuoteResult> => {
  const { data } = await apiClient.post<Envelope<SaleQuoteDto>>(
    QUOTE_ENDPOINTS.resend(id),
    buildSendBody(input)
  );
  return mapSendResult(data.data);
};

const transition = async (url: string, body?: object): Promise<SaleQuote> => {
  const { data } = await apiClient.post<Envelope<SaleQuoteDto>>(url, body);
  return mapQuoteDto(data.data);
};

export const reviseQuote = (id: string) => transition(QUOTE_ENDPOINTS.revise(id));
export const acceptQuote = (id: string) => transition(QUOTE_ENDPOINTS.accept(id));
export const rejectQuote = (id: string, reason: string) =>
  transition(QUOTE_ENDPOINTS.reject(id), { reason });
export const voidQuote = (id: string, reason: string) =>
  transition(QUOTE_ENDPOINTS.void(id), { reason });
export const duplicateQuote = (id: string) => transition(QUOTE_ENDPOINTS.duplicate(id));

export const downloadQuotePdf = async (id: string): Promise<Blob> => {
  const { data } = await apiClient.get<Blob>(QUOTE_ENDPOINTS.print(id), { responseType: 'blob' });
  return data;
};
