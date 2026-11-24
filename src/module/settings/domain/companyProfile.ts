/** The menu that guards the company profile (read to open the page, update to change it). */
export const COMPANY_MENU = 'JP-SETT-COMPANY';

/** Longest text the service takes per field. */
export const COMPANY_LIMITS = {
  name: 150,
  address: 300,
  city: 100,
  postalCode: 10,
  npwp: 30,
  phone: 50,
  email: 150,
  website: 150,
} as const;

/** The logo the service takes: PNG, JPG or WEBP up to 1 MB (SVG is refused). */
export const LOGO_RULES = {
  maxBytes: 1024 * 1024,
  types: ['image/png', 'image/jpeg', 'image/webp'],
} as const;

export interface CompanyLogo {
  id: string;
  fileName: string;
  /** Path on the API host, such as `uploads/logo.png`. */
  filePath: string;
  mimeType: string;
}

export interface CompanyProfile {
  name: string;
  address: string;
  city: string;
  postalCode: string;
  npwp: string;
  phone: string;
  email: string;
  website: string;
  logo: CompanyLogo | null;
  updatedAt: string | null;
}

/** What the person edits; the logo has its own upload and is not part of it. */
export type CompanyForm = Omit<CompanyProfile, 'logo' | 'updatedAt'>;

export const TEXT_FIELDS = [
  'name',
  'npwp',
  'phone',
  'email',
  'website',
  'address',
  'city',
  'postalCode',
] as const satisfies readonly (keyof CompanyForm)[];

export type CompanyFieldError = 'required' | 'tooLong' | 'invalidEmail';
export type CompanyFormErrors = Partial<Record<keyof CompanyForm, CompanyFieldError>>;

export const toCompanyForm = (profile: CompanyProfile): CompanyForm => ({
  name: profile.name,
  address: profile.address,
  city: profile.city,
  postalCode: profile.postalCode,
  npwp: profile.npwp,
  phone: profile.phone,
  email: profile.email,
  website: profile.website,
});

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** The company name is the one field that cannot be blank: it names the logo box and the invoice sentence. */
export const validateCompanyForm = (form: CompanyForm): CompanyFormErrors => {
  const errors: CompanyFormErrors = {};
  TEXT_FIELDS.forEach((key) => {
    if (form[key].trim().length > COMPANY_LIMITS[key]) errors[key] = 'tooLong';
  });
  if (!form.name.trim()) errors.name = 'required';
  const email = form.email.trim();
  if (email && !errors.email && !EMAIL.test(email)) errors.email = 'invalidEmail';
  return errors;
};

export const hasCompanyErrors = (errors: CompanyFormErrors): boolean =>
  Object.keys(errors).length > 0;

/** Whether what is typed differs from what is saved, ignoring spaces around the text. */
export const isCompanyFormChanged = (form: CompanyForm, saved: CompanyForm): boolean =>
  TEXT_FIELDS.some((key) => form[key].trim() !== saved[key].trim());

/** Every field is sent, trimmed, so clearing one really clears it (a blank line is simply not printed). */
export const toCompanyBody = (form: CompanyForm): CompanyForm => ({
  name: form.name.trim(),
  address: form.address.trim(),
  city: form.city.trim(),
  postalCode: form.postalCode.trim(),
  npwp: form.npwp.trim(),
  phone: form.phone.trim(),
  email: form.email.trim(),
  website: form.website.trim(),
});

export type LogoProblem = 'type' | 'size';

/** Refuses a logo before it is sent, with the reason the person can act on. */
export const checkLogoFile = (file: { type: string; size: number }): LogoProblem | null => {
  if (!(LOGO_RULES.types as readonly string[]).includes(file.type)) return 'type';
  if (file.size > LOGO_RULES.maxBytes) return 'size';
  return null;
};

/** Up to two capital letters for the box printed when there is no logo, as the document does. */
export const companyInitials = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => /[\p{L}\p{N}]/u.test(word));
  if (words.length === 0) return '?';
  const letters =
    words.length === 1 ? [...words[0]].slice(0, 2) : words.slice(0, 2).map((w) => [...w][0]);
  return letters.join('').toUpperCase();
};

/** "alamat, kota kode pos" as the document header prints it; blank parts are left out. */
export const addressLine = (form: Pick<CompanyForm, 'address' | 'city' | 'postalCode'>): string => {
  const cityAndCode = [form.city.trim(), form.postalCode.trim()].filter(Boolean).join(' ');
  return [form.address.trim(), cityAndCode].filter(Boolean).join(', ');
};

/** "NPWP … - Telp …" as the document header prints it; blank parts are left out. */
export const taxPhoneLine = (
  form: Pick<CompanyForm, 'npwp' | 'phone'>,
  labels: { npwp: string; phone: string }
): string =>
  [
    form.npwp.trim() ? `${labels.npwp} ${form.npwp.trim()}` : '',
    form.phone.trim() ? `${labels.phone} ${form.phone.trim()}` : '',
  ]
    .filter(Boolean)
    .join(' - ');
