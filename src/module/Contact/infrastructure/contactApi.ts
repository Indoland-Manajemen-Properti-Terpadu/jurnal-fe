import axios from 'axios';
import apiClient from '@/services/apiClient';
import { getJournalAccounts } from '@/module/GeneralJournal/JournalAccount/services/AccountJournal.service';
import type {
  AccountOption,
  Contact,
  ContactFormValues,
  ContactListParams,
  Paginated,
  Pagination,
  PaymentTerm,
} from '../types/contact';

export const CONTACT_ENDPOINTS = {
  contacts: '/v1/contacts',
  contactDetail: (id: string) => `/v1/contacts/${id}`,
  contactArchive: (id: string) => `/v1/contacts/${id}/archive`,
  paymentTerms: '/v1/payment-terms',
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
        typeof mappingRaw.defaultPaymentTerm === 'number'
          ? mappingRaw.defaultPaymentTerm
          : null,
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

export const fetchContacts = async (
  params: ContactListParams
): Promise<Paginated<Contact>> => {
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
  const { data } = await apiClient.get<ApiEnvelope<unknown>>(
    CONTACT_ENDPOINTS.contactDetail(id)
  );
  return mapContact(data.data);
};

export const createContact = async (
  values: ContactFormValues
): Promise<Contact> => {
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
    bankAccounts: values.bankAccounts.filter(
      (b) => b.bankName.trim() && b.accountNumber.trim()
    ),
    mappingAccount: {
      arAccount: extractId(values.mappingAccount.arAccount),
      apAccount: extractId(values.mappingAccount.apAccount),
      defaultPaymentTerm: Number(values.mappingAccount.defaultPaymentTerm) || 0,
    },
    ...(values.external_id ? { external_id: values.external_id.trim() } : {}),
  };

  const { data } = await apiClient.post<ApiEnvelope<unknown>>(
    CONTACT_ENDPOINTS.contacts,
    payload
  );
  return mapContact(data.data);
};

export const updateContact = async (
  id: string,
  values: ContactFormValues
): Promise<Contact> => {
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
    bankAccounts: values.bankAccounts.filter(
      (b) => b.bankName.trim() && b.accountNumber.trim()
    ),
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

