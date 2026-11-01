import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { t } from '@/i18n';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type {
  AccountOption,
  Contact,
  ContactFormValues,
  ContactGroup,
  ContactListParams,
  FilteredAccount,
  Paginated,
  PaymentTerm,
} from '@/module/contacts/domain/contact';
import type { Sale } from '@/module/sales';
import { mapSaleDto } from '@/module/sales/infrastructure/saleMapper';
import type { ApiEnvelope, ContactDto, ContactPayloadDto, PaginatedDto } from './contactDto';
import { buildContactPayload, mapContact, mapPagination } from './contactMapper';

export const CONTACT_ENDPOINTS = {
  contacts: '/v1/contacts',
  contactDetail: (id: string) => `/v1/contacts/${id}`,
  contactArchive: (id: string) => `/v1/contacts/${id}/archive`,
  contactGroups: '/v1/contacts/groups',
  contactGroupDetail: (id: string) => `/v1/contacts/groups/${id}`,
  contactExport: '/v1/contacts/export',
  contactTemplate: '/v1/contacts/template/download',
  contactImport: '/v1/contacts/import',
  contactSync: '/v1/contacts/sync',
  paymentTerms: '/v1/payment-terms',
  filteredAccounts: (cat: string) => `/v1/accounts/filtered?category=${cat}`,
  salesByCustomer: (id: string) => `/v1/sales/customer/${id}`,
  exportSalesByCustomer: (id: string) => `/v1/sales/customer/${id}/export`,
} as const;

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

const saveBlob = (
  response: { data: BlobPart; headers: Record<string, unknown> },
  filename: string
): void => {
  const contentType = String(
    response.headers['content-type'] ||
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );
  const blob = new Blob([response.data], { type: contentType });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

/* ---------- API Functions ---------- */

export const fetchContacts = async (params: ContactListParams): Promise<Paginated<Contact>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<ContactDto>>>(
    CONTACT_ENDPOINTS.contacts,
    {
      params: {
        page: params.page,
        limit: params.limit,
        search: params.search?.trim() || undefined,
        contactType: params.contactType || undefined,
      },
    }
  );

  const rawData = data.data;
  const items = (rawData?.data ?? []).map(mapContact);

  return { items, pagination: mapPagination(rawData?.pagination, items.length, params) };
};

export const fetchContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.get<ApiEnvelope<ContactDto>>(
    CONTACT_ENDPOINTS.contactDetail(id)
  );
  return mapContact(data.data);
};

export const createContact = async (values: ContactFormValues): Promise<Contact> => {
  const payload = buildContactPayload(values, { includeExternalId: true });
  const { data } = await apiClient.post<ApiEnvelope<ContactDto>>(
    CONTACT_ENDPOINTS.contacts,
    payload
  );
  return mapContact(data.data);
};

export const updateContact = async (id: string, values: ContactFormValues): Promise<Contact> => {
  const { data } = await apiClient.put<ApiEnvelope<ContactDto>>(
    CONTACT_ENDPOINTS.contactDetail(id),
    buildContactPayload(values)
  );
  return mapContact(data.data);
};

export const archiveContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.patch<ApiEnvelope<ContactDto>>(
    CONTACT_ENDPOINTS.contactArchive(id)
  );
  return mapContact(data.data);
};

export const fetchAccountOptions = async (): Promise<AccountOption[]> => {
  const accounts = await getJournalAccounts();
  const list = Array.isArray(accounts) ? accounts : [];
  return list.map((acc) => ({
    id: acc.id,
    label: acc.accountNumber ? `${acc.accountNumber} · ${acc.name}` : acc.name,
    category:
      acc.category?.name ?? acc.type ?? t('form.options.otherAccounts', undefined, 'contacts'),
    accountNumber: acc.accountNumber,
    name: acc.name,
  }));
};

const netDaysName = (count: number) => t('paymentTerm.netDays', { count }, 'contacts');

export const fetchPaymentTerms = async (): Promise<PaymentTerm[]> => {
  try {
    const { data } = await apiClient.get<ApiEnvelope<{ data: PaymentTerm[] }>>(
      CONTACT_ENDPOINTS.paymentTerms,
      { params: { page: 1, limit: 50 } }
    );
    const list = data.data?.data;
    if (Array.isArray(list) && list.length > 0) {
      return list;
    }
  } catch {
    // Graceful fallback to default accounting terms if endpoint unpopulated
  }

  return [
    { id: 'cod', name: t('paymentTerm.cod', undefined, 'contacts'), days: 0, isDefault: true },
    { id: 'net15', name: netDaysName(15), days: 15, isDefault: false },
    { id: 'net30', name: netDaysName(30), days: 30, isDefault: true },
    { id: 'net60', name: netDaysName(60), days: 60, isDefault: false },
  ];
};

/* ---------- Transactions by Contact (Sales / Invoices) ---------- */

export type ContactTransactionParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
};

export const fetchSalesByCustomer = async (
  contactId: string,
  params: ContactTransactionParams = {}
): Promise<Paginated<Sale>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<Parameters<typeof mapSaleDto>[0]>>>(
    CONTACT_ENDPOINTS.salesByCustomer(contactId),
    {
      params: {
        page: params.page || 1,
        limit: params.limit || 10,
        search: params.search?.trim() || undefined,
        status: params.status && params.status !== 'all' ? params.status : undefined,
      },
    }
  );

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

export const exportSalesByCustomer = async (
  contactId: string,
  filename = 'transaksi-kontak.xlsx'
): Promise<void> => {
  const response = await apiClient.get(CONTACT_ENDPOINTS.exportSalesByCustomer(contactId), {
    responseType: 'blob',
  });

  saveBlob(response, filename);
};

/* ---------- Contact Groups ---------- */

export const fetchContactGroups = async (): Promise<ContactGroup[]> => {
  const { data } = await apiClient.get<ApiEnvelope<ContactGroup[]>>(
    CONTACT_ENDPOINTS.contactGroups
  );
  return Array.isArray(data.data) ? data.data : [];
};

export const createContactGroup = async (name: string): Promise<ContactGroup> => {
  const { data } = await apiClient.post<ApiEnvelope<ContactGroup>>(
    CONTACT_ENDPOINTS.contactGroups,
    { name: name.trim() }
  );
  return data.data;
};

export const updateContactGroup = async (groupId: string, name: string): Promise<ContactGroup> => {
  const { data } = await apiClient.put<ApiEnvelope<ContactGroup>>(
    CONTACT_ENDPOINTS.contactGroupDetail(groupId),
    { name: name.trim() }
  );
  return data.data;
};

export const deleteContactGroup = async (groupId: string): Promise<void> => {
  await apiClient.delete(CONTACT_ENDPOINTS.contactGroupDetail(groupId));
};

/* ---------- Export & Import Contacts ---------- */

export const exportContacts = async (filename = 'data-kontak.xlsx'): Promise<void> => {
  const response = await apiClient.get(CONTACT_ENDPOINTS.contactExport, {
    responseType: 'blob',
  });
  saveBlob(response, filename);
};

export const downloadContactTemplate = async (
  filename = 'contacts-template.xlsx'
): Promise<void> => {
  const response = await apiClient.get(CONTACT_ENDPOINTS.contactTemplate, {
    responseType: 'blob',
  });
  saveBlob(response, filename);
};

export const importContacts = async (file: File): Promise<{ imported: number }> => {
  const formData = new FormData();
  formData.append('file', file);

  const { data } = await apiClient.post<ApiEnvelope<{ imported: number }>>(
    CONTACT_ENDPOINTS.contactImport,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    }
  );
  return data.data;
};

/* ---------- Filtered AP / AR Accounts ---------- */

export const fetchFilteredAccounts = async (category: 'AP' | 'AR'): Promise<FilteredAccount[]> => {
  const { data } = await apiClient.get<ApiEnvelope<FilteredAccount[]>>(
    CONTACT_ENDPOINTS.filteredAccounts(category)
  );
  return Array.isArray(data.data) ? data.data : [];
};

/* ---------- Sync Contact ---------- */

export const syncContact = async (payload: ContactPayloadDto): Promise<Contact> => {
  const { data } = await apiClient.post<ApiEnvelope<ContactDto>>(
    CONTACT_ENDPOINTS.contactSync,
    payload
  );
  return mapContact(data.data);
};
