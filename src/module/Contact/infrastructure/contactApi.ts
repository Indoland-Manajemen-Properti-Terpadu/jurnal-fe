import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { getJournalAccounts } from '@/module/chart-of-accounts';
import type {
  AccountOption,
  Contact,
  ContactFormValues,
  ContactGroup,
  ContactListParams,
  FilteredAccount,
  Paginated,
  Pagination,
  PaymentTerm,
} from '../types/contact';
import type { Sale } from '@/module/Sale/types/sale';
import { mapSaleDto } from '@/module/Sale/infrastructure/saleApi';

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

type ApiEnvelope<T> = { code: number; message: string; data: T };
type PaginatedDto<T> = { data: T[]; pagination: Pagination };

const extractId = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) return String((val as { id: unknown }).id);
  if (typeof val === 'object' && '_id' in val) return String((val as { _id: unknown })._id);
  return null;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const mapContact = (dto: any): Contact => {
  const mappingRaw = dto.mappingAccount ?? {};
  return {
    id: dto.id || dto._id || '',
    contactNumber: dto.contactNumber || dto.contact_number || '',
    displayName: dto.displayName || dto.display_name || 'Tanpa Nama',
    fullName: dto.fullName ?? null,
    identity: dto.identity ?? null,
    phones: dto.phones ?? null,
    addresses: dto.addresses ?? null,
    emails: Array.isArray(dto.emails) ? dto.emails : [],
    contactType: Array.isArray(dto.contactType) ? dto.contactType : [],
    contactGroups: Array.isArray(dto.contactGroups) ? dto.contactGroups : [],
    companyName: dto.companyName ?? dto.company_name ?? null,
    npwp: dto.npwp ?? null,
    otherInfo: dto.otherInfo ?? dto.other_info ?? null,
    bankAccounts: Array.isArray(dto.bankAccounts) ? dto.bankAccounts : [],
    mappingAccount: {
      arAccount: mappingRaw.arAccount ?? null,
      apAccount: mappingRaw.apAccount ?? null,
      defaultPaymentTerm:
        typeof mappingRaw.defaultPaymentTerm === 'number' ? mappingRaw.defaultPaymentTerm : null,
      maxReceivable: mappingRaw.maxReceivable ?? undefined,
      maxPayable: mappingRaw.maxPayable ?? undefined,
    },
    deleted: Boolean(dto.deleted),
    createdAt: dto.createdAt || dto.created_at || '',
    updatedAt: dto.updatedAt || dto.updated_at || '',
    external_id: dto.external_id ?? dto.externalId ?? null,
  };
};

export const getApiErrorMessage = (error: unknown, fallback: string): string => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: unknown } | undefined)?.message;
    if (typeof message === 'string' && message.trim()) return message;
  }
  return fallback;
};

/* ---------- API Functions ---------- */

export const fetchContacts = async (params: ContactListParams): Promise<Paginated<Contact>> => {
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<unknown>>>(
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
  const pagination: Pagination = {
    total: rawData?.pagination?.total ?? items.length,
    page: rawData?.pagination?.page ?? params.page,
    limit: rawData?.pagination?.limit ?? params.limit,
    totalPages:
      rawData?.pagination?.totalPages ??
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rawData?.pagination as any)?.pages ??
      Math.max(1, Math.ceil((rawData?.pagination?.total ?? items.length) / params.limit)),
  };

  return { items, pagination };
};

export const fetchContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(CONTACT_ENDPOINTS.contactDetail(id));
  return mapContact(data.data);
};

export const createContact = async (values: ContactFormValues): Promise<Contact> => {
  const payload = {
    displayName: values.displayName.trim(),
    contactType: values.contactType,
    fullName: {
      prefix: values.fullName.prefix?.trim() || null,
      firstName: values.fullName.firstName?.trim() || null,
      middleName: values.fullName.middleName?.trim() || null,
      lastName: values.fullName.lastName?.trim() || null,
    },
    identity: {
      type: values.identity.type || null,
      number: values.identity.number?.trim() || null,
    },
    emails: values.emails.filter((e) => Boolean(e.trim())),
    companyName: values.companyName?.trim() || null,
    phones: {
      mobile: values.phones.mobile?.trim() || null,
      telephone: values.phones.telephone?.trim() || null,
      fax: values.phones.fax?.trim() || null,
    },
    npwp: values.npwp?.trim() || null,
    addresses: {
      billing: {
        general: values.addresses.billing.general?.trim() || null,
        detail: values.addresses.billing.detail,
      },
      shipping: {
        isSameAsBilling: values.addresses.shipping.isSameAsBilling,
        general: values.addresses.shipping.isSameAsBilling
          ? values.addresses.billing.general?.trim() || null
          : values.addresses.shipping.general?.trim() || null,
        detail: values.addresses.shipping.isSameAsBilling
          ? values.addresses.billing.detail
          : values.addresses.shipping.detail,
      },
    },
    otherInfo: values.otherInfo?.trim() || null,
    contactGroups: values.contactGroups || [],
    bankAccounts: values.bankAccounts.filter((b) => b.bankName.trim() && b.accountNumber.trim()),
    mappingAccount: {
      arAccount: extractId(values.mappingAccount.arAccount),
      apAccount: extractId(values.mappingAccount.apAccount),
      defaultPaymentTerm: Number(values.mappingAccount.defaultPaymentTerm) || 0,
    },
    ...(values.external_id ? { external_id: values.external_id.trim() } : {}),
  };

  const { data } = await apiClient.post<ApiEnvelope<unknown>>(CONTACT_ENDPOINTS.contacts, payload);
  return mapContact(data.data);
};

export const updateContact = async (id: string, values: ContactFormValues): Promise<Contact> => {
  const payload = {
    displayName: values.displayName.trim(),
    contactType: values.contactType,
    fullName: {
      prefix: values.fullName.prefix?.trim() || null,
      firstName: values.fullName.firstName?.trim() || null,
      middleName: values.fullName.middleName?.trim() || null,
      lastName: values.fullName.lastName?.trim() || null,
    },
    identity: {
      type: values.identity.type || null,
      number: values.identity.number?.trim() || null,
    },
    emails: values.emails.filter((e) => Boolean(e.trim())),
    companyName: values.companyName?.trim() || null,
    phones: {
      mobile: values.phones.mobile?.trim() || null,
      telephone: values.phones.telephone?.trim() || null,
      fax: values.phones.fax?.trim() || null,
    },
    npwp: values.npwp?.trim() || null,
    addresses: {
      billing: {
        general: values.addresses.billing.general?.trim() || null,
        detail: values.addresses.billing.detail,
      },
      shipping: {
        isSameAsBilling: values.addresses.shipping.isSameAsBilling,
        general: values.addresses.shipping.isSameAsBilling
          ? values.addresses.billing.general?.trim() || null
          : values.addresses.shipping.general?.trim() || null,
        detail: values.addresses.shipping.isSameAsBilling
          ? values.addresses.billing.detail
          : values.addresses.shipping.detail,
      },
    },
    otherInfo: values.otherInfo?.trim() || null,
    contactGroups: values.contactGroups || [],
    bankAccounts: values.bankAccounts.filter((b) => b.bankName.trim() && b.accountNumber.trim()),
    mappingAccount: {
      arAccount: extractId(values.mappingAccount.arAccount),
      apAccount: extractId(values.mappingAccount.apAccount),
      defaultPaymentTerm: Number(values.mappingAccount.defaultPaymentTerm) || 0,
    },
  };

  const { data } = await apiClient.put<ApiEnvelope<unknown>>(
    CONTACT_ENDPOINTS.contactDetail(id),
    payload
  );
  return mapContact(data.data);
};

export const archiveContact = async (id: string): Promise<Contact> => {
  const { data } = await apiClient.patch<ApiEnvelope<unknown>>(
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
    category: acc.category?.name ?? acc.type ?? 'Akun Lainnya',
    accountNumber: acc.accountNumber,
    name: acc.name,
  }));
};

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
    { id: 'cod', name: 'Cash on Delivery (COD)', days: 0, isDefault: true },
    { id: 'net15', name: 'Net 15 Hari', days: 15, isDefault: false },
    { id: 'net30', name: 'Net 30 Hari', days: 30, isDefault: true },
    { id: 'net60', name: 'Net 60 Hari', days: 60, isDefault: false },
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
  const { data } = await apiClient.get<ApiEnvelope<PaginatedDto<any>>>(
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

export const downloadContactTemplate = async (
  filename = 'contacts-template.xlsx'
): Promise<void> => {
  const response = await apiClient.get(CONTACT_ENDPOINTS.contactTemplate, {
    responseType: 'blob',
  });
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

export const syncContact = async (payload: unknown): Promise<Contact> => {
  const { data } = await apiClient.post<ApiEnvelope<unknown>>(
    CONTACT_ENDPOINTS.contactSync,
    payload
  );
  return mapContact(data.data);
};
