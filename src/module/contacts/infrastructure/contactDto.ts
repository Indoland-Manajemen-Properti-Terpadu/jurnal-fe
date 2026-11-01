import type {
  ContactAccountMapping,
  ContactAddresses,
  ContactBankAccount,
  ContactFullName,
  ContactIdentity,
  ContactPhones,
  Pagination,
} from '../domain/contact';

/** Raw API shapes for contacts. Fields use the spellings the backend has sent (`_id`, snake_case). */

export type ApiEnvelope<T> = { code: number; message: string; data: T };

export type PaginationDto = Partial<Pagination> & { pages?: number };

export type PaginatedDto<T> = { data?: T[]; pagination?: PaginationDto };

export type MoneyLimitDto = { isActive?: unknown; amount?: unknown };

export type ContactMappingAccountDto = Omit<
  ContactAccountMapping,
  'defaultPaymentTerm' | 'maxReceivable' | 'maxPayable'
> & {
  defaultPaymentTerm?: unknown;
  maxReceivable?: MoneyLimitDto | null;
  maxPayable?: MoneyLimitDto | null;
};

export type ContactDto = {
  id?: string;
  _id?: string;
  contactNumber?: string;
  contact_number?: string;
  displayName?: string;
  display_name?: string;
  fullName?: ContactFullName | null;
  identity?: ContactIdentity | null;
  phones?: ContactPhones | null;
  addresses?: ContactAddresses | null;
  emails?: string[] | null;
  contactType?: unknown;
  contactGroups?: string[] | null;
  companyName?: string | null;
  company_name?: string | null;
  npwp?: string | null;
  otherInfo?: string | null;
  other_info?: string | null;
  bankAccounts?: ContactBankAccount[] | null;
  mappingAccount?: ContactMappingAccountDto | null;
  deleted?: unknown;
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
  external_id?: string | null;
  externalId?: string | null;
};

type AddressDetailPayload = {
  no: string;
  rt: string;
  rw: string;
  zipCode: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  province: string;
};

/** Body of POST /v1/contacts and PUT /v1/contacts/:id (create adds `external_id`). */
export type ContactPayloadDto = {
  displayName: string;
  contactType: string[];
  fullName: {
    prefix: string | null;
    firstName: string | null;
    middleName: string | null;
    lastName: string | null;
  };
  identity: { type: string | null; number: string | null };
  emails: string[];
  companyName: string | null;
  phones: { mobile: string | null; telephone: string | null; fax: string | null };
  npwp: string | null;
  addresses: {
    billing: { general: string | null; detail: AddressDetailPayload };
    shipping: {
      isSameAsBilling: boolean;
      general: string | null;
      detail: AddressDetailPayload;
    };
  };
  otherInfo: string | null;
  contactGroups: string[];
  bankAccounts: ContactBankAccount[];
  mappingAccount: {
    arAccount: string | null;
    apAccount: string | null;
    defaultPaymentTerm: number;
  };
  external_id?: string;
};
