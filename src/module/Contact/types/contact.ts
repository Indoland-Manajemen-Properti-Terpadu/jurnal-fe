export type ContactType = 'Pelanggan' | 'Supplier' | 'Karyawan' | 'Unit' | 'Lainnya';

export type ContactFullName = {
  prefix?: string | null;
  firstName?: string | null;
  middleName?: string | null;
  lastName?: string | null;
};

export type ContactIdentity = {
  type?: string | null;
  number?: string | null;
};

export type ContactPhones = {
  mobile?: string | null;
  telephone?: string | null;
  fax?: string | null;
};

export type ContactAddressDetail = {
  no?: string | null;
  rt?: string | null;
  rw?: string | null;
  zipCode?: string | null;
  kelurahan?: string | null;
  kecamatan?: string | null;
  city?: string | null;
  province?: string | null;
};

export type ContactAddress = {
  general?: string | null;
  detail?: ContactAddressDetail | null;
};

export type ContactAddresses = {
  billing?: ContactAddress;
  shipping?: ContactAddress & { isSameAsBilling?: boolean };
};

export type ContactBankAccount = {
  bankName: string;
  branch?: string | null;
  accountHolder: string;
  accountNumber: string;
};

export type ContactAccountMapping = {
  arAccount?: string | { id?: string; name?: string; accountNumber?: string; type?: string } | null;
  apAccount?: string | { id?: string; name?: string; accountNumber?: string; type?: string } | null;
  defaultPaymentTerm?: number | null;
  maxReceivable?: {
    isActive: boolean;
    amount: number;
  };
  maxPayable?: {
    isActive: boolean;
    amount: number;
  };
};

export type Contact = {
  id: string;
  contactNumber: string;
  displayName: string;
  fullName?: ContactFullName | null;
  identity?: ContactIdentity | null;
  phones?: ContactPhones | null;
  addresses?: ContactAddresses | null;
  emails: string[];
  contactType: ContactType[];
  contactGroups?: string[];
  companyName?: string | null;
  npwp?: string | null;
  otherInfo?: string | null;
  bankAccounts: ContactBankAccount[];
  mappingAccount?: ContactAccountMapping | null;
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
  external_id?: string | null;
};

export type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

export type ContactListParams = {
  page: number;
  limit: number;
  search?: string;
  contactType?: string;
};

export type ContactFormValues = {
  displayName: string;
  contactType: ContactType[];
  fullName: {
    prefix: string;
    firstName: string;
    middleName: string;
    lastName: string;
  };
  identity: {
    type: string;
    number: string;
  };
  emails: string[];
  companyName: string;
  phones: {
    mobile: string;
    telephone: string;
    fax: string;
  };
  npwp: string;
  addresses: {
    billing: {
      general: string;
      detail: {
        no: string;
        rt: string;
        rw: string;
        zipCode: string;
        kelurahan: string;
        kecamatan: string;
        city: string;
        province: string;
      };
    };
    shipping: {
      isSameAsBilling: boolean;
      general: string;
      detail: {
        no: string;
        rt: string;
        rw: string;
        zipCode: string;
        kelurahan: string;
        kecamatan: string;
        city: string;
        province: string;
      };
    };
  };
  otherInfo: string;
  bankAccounts: Array<{
    bankName: string;
    branch: string;
    accountHolder: string;
    accountNumber: string;
  }>;
  mappingAccount: {
    arAccount: string | null;
    apAccount: string | null;
    defaultPaymentTerm: number;
  };
  external_id?: string;
};

export type AccountOption = {
  id: string;
  label: string;
  category: string;
  accountNumber?: string;
  name?: string;
};

export type PaymentTerm = {
  id: string;
  name: string;
  days: number;
  isDefault: boolean;
};

