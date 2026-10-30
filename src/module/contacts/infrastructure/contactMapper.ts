import type {
  Contact,
  ContactAccountMapping,
  ContactFormValues,
  ContactType,
  Pagination,
} from '../domain/contact';
import { extractAccountId } from '../domain/contactAccount';
import { roundToCents } from '@/module/sales/domain/saleMoney';
import type {
  ContactDto,
  ContactMappingAccountDto,
  ContactPayloadDto,
  MoneyLimitDto,
  PaginationDto,
} from './contactDto';

/** Credit limits are money: rounded half up to the cent where they enter the app. */
const toMoneyLimit = (
  limit: MoneyLimitDto | null | undefined
): ContactAccountMapping['maxReceivable'] => {
  if (!limit) return undefined;
  const amount =
    typeof limit.amount === 'number' && Number.isFinite(limit.amount) ? limit.amount : 0;
  return { isActive: Boolean(limit.isActive), amount: roundToCents(amount) };
};

const mapMappingAccount = (raw: ContactMappingAccountDto | null | undefined) => {
  const mapping = raw ?? {};
  return {
    arAccount: mapping.arAccount ?? null,
    apAccount: mapping.apAccount ?? null,
    defaultPaymentTerm:
      typeof mapping.defaultPaymentTerm === 'number' ? mapping.defaultPaymentTerm : null,
    maxReceivable: toMoneyLimit(mapping.maxReceivable),
    maxPayable: toMoneyLimit(mapping.maxPayable),
  };
};

export const mapContact = (dto: ContactDto): Contact => ({
  id: dto.id || dto._id || '',
  contactNumber: dto.contactNumber || dto.contact_number || '',
  displayName: dto.displayName || dto.display_name || 'Tanpa Nama',
  fullName: dto.fullName ?? null,
  identity: dto.identity ?? null,
  phones: dto.phones ?? null,
  addresses: dto.addresses ?? null,
  emails: Array.isArray(dto.emails) ? dto.emails : [],
  contactType: Array.isArray(dto.contactType) ? (dto.contactType as ContactType[]) : [],
  contactGroups: Array.isArray(dto.contactGroups) ? dto.contactGroups : [],
  companyName: dto.companyName ?? dto.company_name ?? null,
  npwp: dto.npwp ?? null,
  otherInfo: dto.otherInfo ?? dto.other_info ?? null,
  bankAccounts: Array.isArray(dto.bankAccounts) ? dto.bankAccounts : [],
  mappingAccount: mapMappingAccount(dto.mappingAccount),
  deleted: Boolean(dto.deleted),
  createdAt: dto.createdAt || dto.created_at || '',
  updatedAt: dto.updatedAt || dto.updated_at || '',
  external_id: dto.external_id ?? dto.externalId ?? null,
});

export const mapPagination = (
  raw: PaginationDto | undefined,
  itemCount: number,
  params: { page: number; limit: number }
): Pagination => ({
  total: raw?.total ?? itemCount,
  page: raw?.page ?? params.page,
  limit: raw?.limit ?? params.limit,
  totalPages:
    raw?.totalPages ??
    raw?.pages ??
    Math.max(1, Math.ceil((raw?.total ?? itemCount) / params.limit)),
});

const trimmedOrNull = (value: string | null | undefined): string | null => value?.trim() || null;

export const buildContactPayload = (
  values: ContactFormValues,
  options: { includeExternalId?: boolean } = {}
): ContactPayloadDto => {
  const { billing, shipping } = values.addresses;
  const sameAsBilling = shipping.isSameAsBilling;

  return {
    displayName: values.displayName.trim(),
    contactType: values.contactType,
    fullName: {
      prefix: trimmedOrNull(values.fullName.prefix),
      firstName: trimmedOrNull(values.fullName.firstName),
      middleName: trimmedOrNull(values.fullName.middleName),
      lastName: trimmedOrNull(values.fullName.lastName),
    },
    identity: {
      type: values.identity.type || null,
      number: trimmedOrNull(values.identity.number),
    },
    emails: values.emails.filter((email) => Boolean(email.trim())),
    companyName: trimmedOrNull(values.companyName),
    phones: {
      mobile: trimmedOrNull(values.phones.mobile),
      telephone: trimmedOrNull(values.phones.telephone),
      fax: trimmedOrNull(values.phones.fax),
    },
    npwp: trimmedOrNull(values.npwp),
    addresses: {
      billing: {
        general: trimmedOrNull(billing.general),
        detail: billing.detail,
      },
      shipping: {
        isSameAsBilling: sameAsBilling,
        general: sameAsBilling ? trimmedOrNull(billing.general) : trimmedOrNull(shipping.general),
        detail: sameAsBilling ? billing.detail : shipping.detail,
      },
    },
    otherInfo: trimmedOrNull(values.otherInfo),
    contactGroups: values.contactGroups || [],
    bankAccounts: values.bankAccounts.filter(
      (bank) => bank.bankName.trim() && bank.accountNumber.trim()
    ),
    mappingAccount: {
      arAccount: extractAccountId(values.mappingAccount.arAccount),
      apAccount: extractAccountId(values.mappingAccount.apAccount),
      defaultPaymentTerm: Number(values.mappingAccount.defaultPaymentTerm) || 0,
    },
    ...(options.includeExternalId && values.external_id
      ? { external_id: values.external_id.trim() }
      : {}),
  };
};
