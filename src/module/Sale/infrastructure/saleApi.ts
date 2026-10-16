import axios from 'axios';
import apiClient from '@/services/apiClient';
import type {
  CreateSaleFormValues,
  CreateSalePaymentPayload,
  Paginated,
  Sale,
  SaleListParams,
  SalePaymentDetail,
  SalePaymentMethod,
  SaleTag,
} from '../types/sale';

export const SALE_ENDPOINTS = {
  sales: '/v1/sales',
  saleDetail: (id: string) => `/v1/sales/${id}`,
  saleByTxNumber: (txNumber: string) => `/v1/sales/transaction/${txNumber}`,
  generateInvoiceLink: (id: string) => `/v1/sales/${id}/invoice-link`,
  downloadInvoice: (id: string) => `/v1/sales/${id}/print`,
  salePayments: '/v1/sale-payments',
  salePaymentDetail: (id: string) => `/v1/sale-payments/${id}`,
  paymentMethods: '/v1/payment-methods',
  paymentTerms: '/v1/payment-terms',
  taxes: '/v1/taxes',
  tags: '/v1/tags',
  salesByCustomer: (contactId: string) => `/v1/sales/customer/${contactId}`,
  exportCustomerSales: (contactId: string) => `/v1/sales/customer/${contactId}/export`,
} as const;

type ApiEnvelope<T> = { code: number; message: string; data: T };
type PaginatedDto<T> = {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

/* Helper converters */
const toNumber = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0);

/* eslint-disable @typescript-eslint/no-explicit-any */
export const mapSaleDto = (dto: any): Sale => {
  if (!dto) {
    return {
      id: '',
      transactionNumber: '—',
      customer: null,
      emails: [],
      transactionDate: null,
      dueDate: null,
      tags: [],
      paymentTerm: null,
      isPriceIncludeTax: false,
      items: [],
      subtotal: 0,
      total: 0,
      finalAmount: 0,
      paidAmount: 0,
      remainingAmount: 0,
      attachments: [],
      status: 'DRAFT',
      deleted: false,
      createdAt: null,
      updatedAt: null,
    };
  }

  const cust = dto.customer;
  const items = Array.isArray(dto.items)
    ? dto.items.map((i: any) => ({
        id: i.id || i._id,
        product: i.product
          ? {
              id: i.product.id || i.product._id,
              name: i.product.name,
              productCode: i.product.productCode || i.product.code,
            }
          : null,
        description: i.description,
        quantity: toNumber(i.quantity),
        unitPrice: toNumber(i.unitPrice || i.unit_price),
        tax: i.tax
          ? {
              id: i.tax.id || i.tax._id,
              name: i.tax.name,
              rate: toNumber(i.tax.rate),
            }
          : null,
        taxAmount: toNumber(i.taxAmount),
        amount: toNumber(i.amount),
        adjustedAmount:
          i.adjustedAmount !== undefined && i.adjustedAmount !== null
            ? toNumber(i.adjustedAmount)
            : undefined,
        paidAmount: toNumber(i.paidAmount),
        journalTransaction:
          typeof i.journalTransaction === 'string'
            ? i.journalTransaction
            : i.journalTransaction?.id || i.journalTransaction?._id || null,
        journalId:
          i.journalId ||
          i.journal_id ||
          (typeof i.journalTransaction === 'string' ? i.journalTransaction : i.journalTransaction?.id) ||
          i.journal?.id ||
          i.journal?._id ||
          null,
        transactionId:
          i.transactionId ||
          i.transaction_id ||
          i.transactionJournalId ||
          i.journalTransactionId ||
          (typeof i.journalTransaction === 'string' ? i.journalTransaction : i.journalTransaction?.id) ||
          null,
        salesAccount: typeof i.salesAccount === 'string' ? i.salesAccount : i.salesAccount?.id || null,
        accountReceivable:
          typeof i.accountReceivable === 'string'
            ? i.accountReceivable
            : i.accountReceivable?.id || null,
      }))
    : [];

  const attachments = Array.isArray(dto.attachments)
    ? dto.attachments.map((a: any) => ({
        id: a.id || a._id,
        fileName: a.fileName || a.name,
        filePath: a.filePath || a.path,
        mimeType: a.mimeType,
        createdAt: a.createdAt,
      }))
    : [];

  const rawTags = dto.tags ?? dto.tag;
  const tags: SaleTag[] = Array.isArray(rawTags)
    ? rawTags.map((t: any) =>
        typeof t === 'string'
          ? { id: t, name: t }
          : { id: t.id || t._id || t.name, name: t.name || t.id || 'Tag' }
      )
    : typeof rawTags === 'string' && rawTags.trim()
    ? rawTags
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean)
        .map((s: string) => ({ id: s, name: s }))
    : [];

  return {
    id: dto.id || dto._id || '',
    site: dto.site,
    transactionNumber: dto.transactionNumber || dto.transaction_number || '—',
    customer: cust
      ? {
          id: cust.id || cust._id,
          displayName: cust.displayName || cust.name || 'Pelanggan',
          fullName: cust.fullName,
          contactNumber: cust.contactNumber,
          emails: Array.isArray(cust.emails) ? cust.emails : [],
          phones: cust.phones,
          billingAddress: cust.addresses?.billing?.general || cust.billingAddress,
          identity: cust.identity,
        }
      : null,
    emails: Array.isArray(dto.emails) ? dto.emails : [],
    billingAddress: dto.billingAddress,
    transactionDate: dto.transactionDate || null,
    dueDate: dto.dueDate || null,
    tags,
    customerRefNumber: dto.customerRefNumber || null,
    paymentTerm: dto.paymentTerm
      ? {
          id: dto.paymentTerm.id || dto.paymentTerm._id,
          name: dto.paymentTerm.name,
          days: dto.paymentTerm.days,
          isDefault: dto.paymentTerm.isDefault,
        }
      : null,
    isPriceIncludeTax: Boolean(dto.isPriceIncludeTax),
    items,
    subtotal: toNumber(dto.subtotal),
    discountType: dto.discountType,
    discountValue: toNumber(dto.discountValue),
    discountAmount: toNumber(dto.discountAmount),
    taxAmount: toNumber(dto.taxAmount),
    total: toNumber(dto.total),
    adjustedAmount:
      dto.adjustedAmount !== undefined && dto.adjustedAmount !== null
        ? toNumber(dto.adjustedAmount)
        : undefined,
    lateFeeAmount: toNumber(dto.lateFeeAmount),
    lateFeePaidAmount: toNumber(dto.lateFeePaidAmount),
    withholdingType: dto.withholdingType,
    withholdingValue: toNumber(dto.withholdingValue),
    withholdingAmount: toNumber(dto.withholdingAmount),
    withholdingAccount: dto.withholdingAccount
      ? {
          id: dto.withholdingAccount.id || dto.withholdingAccount._id,
          name: dto.withholdingAccount.name,
          accountNumber: dto.withholdingAccount.accountNumber,
        }
      : null,
    finalAmount: toNumber(dto.finalAmount ?? dto.total),
    paidAmount: toNumber(dto.paidAmount),
    remainingAmount: toNumber(dto.remainingAmount),
    attachments,
    message: dto.message || null,
    memo: dto.memo || null,
    status: dto.status || 'DRAFT',
    invoiceLink: dto.invoiceLink || null,
    journalId:
      dto.journalId ||
      dto.journal_id ||
      dto.journalTransactionId ||
      dto.transactionJournalId ||
      dto.journal?.id ||
      dto.journal?._id ||
      null,
    transactionId:
      dto.transactionId ||
      dto.transaction_id ||
      dto.journalId ||
      dto.journal_id ||
      null,
    deleted: Boolean(dto.deleted),
    createdAt: dto.createdAt || null,
    updatedAt: dto.updatedAt || null,
  };
};

/* API Calls */
export const fetchSales = async (params: SaleListParams = {}): Promise<Paginated<Sale>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<any>>>(SALE_ENDPOINTS.sales, {
    params: {
      page: params.page || 1,
      limit: params.limit || 10,
      search: params.search?.trim() || undefined,
      status: params.status && params.status !== 'all' ? params.status : undefined,
      startDate: params.startDate || undefined,
      endDate: params.endDate || undefined,
      customerId: params.customerId || undefined,
    },
  });

  const raw = data.data;
  const items = (raw?.data || []).map(mapSaleDto);
  return {
    items,
    pagination: {
      total: raw?.pagination?.total ?? items.length,
      page: raw?.pagination?.page ?? (params.page || 1),
      limit: raw?.pagination?.limit ?? (params.limit || 10),
      totalPages: raw?.pagination?.totalPages ?? 1,
    },
  };
};

export const fetchSaleDetail = async (id: string): Promise<Sale> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(SALE_ENDPOINTS.saleDetail(id));
  return mapSaleDto(data.data);
};

export const fetchSaleByTxNumber = async (txNumber: string): Promise<Sale> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(SALE_ENDPOINTS.saleByTxNumber(txNumber));
  return mapSaleDto(data.data);
};

export const createSale = async (values: CreateSaleFormValues): Promise<Sale> => {
  const formData = new FormData();
  formData.append('customer', values.customer);

  if (values.transactionDate) formData.append('transactionDate', values.transactionDate);
  if (values.dueDate) formData.append('dueDate', values.dueDate);
  if (values.billingAddress) formData.append('billingAddress', values.billingAddress);
  if (values.transactionNumber) formData.append('transactionNumber', values.transactionNumber);
  if (values.customerRefNumber) formData.append('customerRefNumber', values.customerRefNumber);
  if (values.paymentTerm) formData.append('paymentTerm', values.paymentTerm);
  formData.append('isPriceIncludeTax', String(values.isPriceIncludeTax));

  values.emails.forEach((email) => {
    if (email.trim()) formData.append('emails[]', email.trim());
  });

  values.tags.forEach((tag) => {
    if (tag.trim()) formData.append('tags[]', tag.trim());
  });

  values.items.forEach((item, index) => {
    formData.append(`items[${index}][product]`, item.productId);
    if (item.description) formData.append(`items[${index}][description]`, item.description);
    formData.append(`items[${index}][quantity]`, String(item.quantity));
    formData.append(`items[${index}][unitPrice]`, String(item.unitPrice));
    if (item.taxId) formData.append(`items[${index}][tax]`, item.taxId);
  });

  if (values.discountType && values.discountValue > 0) {
    formData.append('discountType', values.discountType);
    formData.append('discountValue', String(values.discountValue));
  }

  if (values.withholdingAccount && values.withholdingValue > 0) {
    formData.append('withholdingType', values.withholdingType);
    formData.append('withholdingValue', String(values.withholdingValue));
    formData.append('withholdingAccount', values.withholdingAccount);
  }

  if (values.message) formData.append('message', values.message);
  if (values.memo) formData.append('memo', values.memo);

  if (values.attachments && values.attachments.length > 0) {
    values.attachments.forEach((file) => {
      formData.append('attachments', file);
    });
  }

  const { data } = await apiClient.post<ApiEnvelope<any>>(SALE_ENDPOINTS.sales, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return mapSaleDto(data.data);
};

export const generateInvoiceLink = async (id: string): Promise<string> => {
  const { data } = await apiClient.post<ApiEnvelope<{ invoiceLink?: string }>>(
    SALE_ENDPOINTS.generateInvoiceLink(id)
  );
  return data.data?.invoiceLink || '';
};

export const downloadInvoicePdf = async (id: string): Promise<Blob> => {
  const response = await apiClient.get(SALE_ENDPOINTS.downloadInvoice(id), {
    responseType: 'blob',
  });
  return response.data;
};

/* Payment API */
export const createSalePayment = async (payload: CreateSalePaymentPayload): Promise<any> => {
  const { data } = await apiClient.post<ApiEnvelope<any>>(SALE_ENDPOINTS.salePayments, payload);
  return data.data;
};

export const fetchSalePaymentDetail = async (id: string): Promise<SalePaymentDetail> => {
  const { data } = await apiClient.get<ApiEnvelope<any>>(SALE_ENDPOINTS.salePaymentDetail(id));
  const raw = data.data;
  return {
    id: raw.id || raw._id,
    site: raw.site,
    sale: raw.sale,
    depositAccount: raw.depositAccount,
    paymentMethod: raw.paymentMethod,
    paymentDate: raw.paymentDate,
    amount: toNumber(raw.amount),
    transactionNumber: raw.transactionNumber || '—',
    memo: raw.memo,
    createdAt: raw.createdAt,
  };
};

export const fetchPaymentMethods = async (): Promise<SalePaymentMethod[]> => {
  const { data } = await apiClient.get<ApiEnvelope<{ data: any[] }>>(SALE_ENDPOINTS.paymentMethods);
  return (data.data?.data || []).map((m: any) => ({
    id: m.id || m._id,
    name: m.name,
    adminFee: toNumber(m.adminFee),
    external_id: m.external_id,
    isDefault: Boolean(m.isDefault),
    defaultAccount: m.defaultAccount,
    feeAccount: m.feeAccount,
  }));
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};
