import type { Contact, ContactType } from './contact';

const dateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

export const formatDate = (iso?: string | null): string => {
  if (!iso) return '—';
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
};

export const formatContactName = (contact: Contact): string => {
  const f = contact.fullName;
  if (!f) return contact.displayName;
  const parts = [f.prefix, f.firstName, f.middleName, f.lastName].filter(Boolean);
  return parts.length > 0 ? parts.join(' ') : contact.displayName;
};

export const getContactTypeBadgeConfig = (
  type: ContactType | string
): { color: string; label: string } => {
  switch (type) {
    case 'Pelanggan':
      return { color: 'teal', label: 'Pelanggan' };
    case 'Supplier':
      return { color: 'blue', label: 'Supplier' };
    case 'Karyawan':
      return { color: 'indigo', label: 'Karyawan' };
    case 'Unit':
      return { color: 'cyan', label: 'Unit' };
    case 'Lainnya':
    default:
      return { color: 'gray', label: type || 'Lainnya' };
  }
};

export const formatPaymentTerm = (days?: number | null): string => {
  if (days === null || days === undefined) return '—';
  if (days === 0) return 'Cash on Delivery (COD)';
  return `Net ${days} Hari`;
};

export const resolveAccountName = (acc: unknown, accountMap: Map<string, string>): string => {
  if (!acc) return '—';
  if (typeof acc === 'string') return accountMap.get(acc) ?? acc;
  if (typeof acc === 'object') {
    const obj = acc as { name?: string; accountNumber?: string; id?: string };
    if (obj.name) {
      return obj.accountNumber ? `${obj.accountNumber} · ${obj.name}` : obj.name;
    }
    if (obj.id) return accountMap.get(obj.id) ?? obj.id;
  }
  return '—';
};
