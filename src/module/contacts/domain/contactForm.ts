import type { Contact, ContactFormValues } from './contact';
import { extractAccountId } from './contactAccount';

const emptyAddressDetail = () => ({
  no: '',
  rt: '',
  rw: '',
  zipCode: '',
  kelurahan: '',
  kecamatan: '',
  city: '',
  province: '',
});

const emptyLimit = () => ({ isActive: false, amount: 0 });

export const DEFAULT_PAYMENT_TERM_DAYS = 30;

export const PREFIX_KEYS = [
  'Bapak',
  'Ibu',
  'Sdr',
  'Sdri',
  'Mr',
  'Mrs',
  'Ms',
  'Dr',
  'Prof',
] as const;

export const IDENTITY_TYPE_KEYS = ['KTP', 'SIM', 'Passport'] as const;

export const emptyContactForm = (): ContactFormValues => ({
  displayName: '',
  contactType: ['Pelanggan'],
  contactGroups: [],
  fullName: { prefix: '', firstName: '', middleName: '', lastName: '' },
  identity: { type: 'KTP', number: '' },
  emails: [''],
  companyName: '',
  phones: { mobile: '', telephone: '', fax: '' },
  npwp: '',
  addresses: {
    billing: { general: '', detail: emptyAddressDetail() },
    shipping: { isSameAsBilling: true, general: '', detail: emptyAddressDetail() },
  },
  otherInfo: '',
  bankAccounts: [],
  mappingAccount: {
    arAccount: null,
    apAccount: null,
    defaultPaymentTerm: DEFAULT_PAYMENT_TERM_DAYS,
    maxReceivable: emptyLimit(),
    maxPayable: emptyLimit(),
  },
});

const addressDetailValues = (
  detail: NonNullable<NonNullable<Contact['addresses']>['billing']>['detail']
) => ({
  no: detail?.no ?? '',
  rt: detail?.rt ?? '',
  rw: detail?.rw ?? '',
  zipCode: detail?.zipCode ?? '',
  kelurahan: detail?.kelurahan ?? '',
  kecamatan: detail?.kecamatan ?? '',
  city: detail?.city ?? '',
  province: detail?.province ?? '',
});

/** Form values for editing an existing contact; missing fields fall back to the empty form's. */
export const contactToFormValues = (contact: Contact): ContactFormValues => ({
  displayName: contact.displayName ?? '',
  contactType: contact.contactType.length > 0 ? contact.contactType : ['Pelanggan'],
  contactGroups: contact.contactGroups ?? [],
  fullName: {
    prefix: contact.fullName?.prefix ?? '',
    firstName: contact.fullName?.firstName ?? '',
    middleName: contact.fullName?.middleName ?? '',
    lastName: contact.fullName?.lastName ?? '',
  },
  identity: {
    type: contact.identity?.type ?? 'KTP',
    number: contact.identity?.number ?? '',
  },
  emails: contact.emails.length > 0 ? contact.emails : [''],
  companyName: contact.companyName ?? '',
  phones: {
    mobile: contact.phones?.mobile ?? '',
    telephone: contact.phones?.telephone ?? '',
    fax: contact.phones?.fax ?? '',
  },
  npwp: contact.npwp ?? '',
  addresses: {
    billing: {
      general: contact.addresses?.billing?.general ?? '',
      detail: addressDetailValues(contact.addresses?.billing?.detail),
    },
    shipping: {
      isSameAsBilling: contact.addresses?.shipping?.isSameAsBilling ?? true,
      general: contact.addresses?.shipping?.general ?? '',
      detail: addressDetailValues(contact.addresses?.shipping?.detail),
    },
  },
  otherInfo: contact.otherInfo ?? '',
  bankAccounts: contact.bankAccounts.map((bank) => ({
    bankName: bank.bankName ?? '',
    branch: bank.branch ?? '',
    accountHolder: bank.accountHolder ?? '',
    accountNumber: bank.accountNumber ?? '',
  })),
  mappingAccount: {
    arAccount: extractAccountId(contact.mappingAccount?.arAccount),
    apAccount: extractAccountId(contact.mappingAccount?.apAccount),
    defaultPaymentTerm:
      typeof contact.mappingAccount?.defaultPaymentTerm === 'number'
        ? contact.mappingAccount.defaultPaymentTerm
        : DEFAULT_PAYMENT_TERM_DAYS,
    maxReceivable: contact.mappingAccount?.maxReceivable ?? emptyLimit(),
    maxPayable: contact.mappingAccount?.maxPayable ?? emptyLimit(),
  },
});
