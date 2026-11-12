export type AccountType = 'INDIVIDUAL' | 'CORPORATE';

export interface ConnectionFormValues {
  accountId: string;
  accountType: AccountType;
  bankAccountNumber: string;
  accountHolderName: string;
  corporateId: string;
  signatoryName: string;
  signatoryNationalId: string;
  memo: string;
}

export type FieldError = 'required' | 'digitsOnly' | 'nikLength';
export type FormErrors = Partial<Record<keyof ConnectionFormValues, FieldError>>;

export const MEMO_MAX_LENGTH = 50;
const NATIONAL_ID_LENGTH = 16;

export const emptyConnectionForm = (): ConnectionFormValues => ({
  accountId: '',
  accountType: 'CORPORATE',
  bankAccountNumber: '',
  accountHolderName: '',
  corporateId: '',
  signatoryName: '',
  signatoryNationalId: '',
  memo: '',
});

/** Spaces and dashes people type inside a number are not part of it. */
const compactNumber = (value: string): string => value.replace(/[\s-]/g, '');

export const validateConnectionForm = (values: ConnectionFormValues): FormErrors => {
  const errors: FormErrors = {};
  const empty = (value: string) => value.trim().length === 0;

  if (empty(values.accountId)) errors.accountId = 'required';

  const number = compactNumber(values.bankAccountNumber);
  if (number.length === 0) errors.bankAccountNumber = 'required';
  else if (!/^\d+$/.test(number)) errors.bankAccountNumber = 'digitsOnly';

  if (empty(values.accountHolderName)) errors.accountHolderName = 'required';
  if (values.accountType === 'CORPORATE' && empty(values.corporateId)) {
    errors.corporateId = 'required';
  }
  if (empty(values.signatoryName)) errors.signatoryName = 'required';

  const nationalId = values.signatoryNationalId.trim();
  if (nationalId.length === 0) errors.signatoryNationalId = 'required';
  else if (!new RegExp(`^\\d{${NATIONAL_ID_LENGTH}}$`).test(nationalId)) {
    errors.signatoryNationalId = 'nikLength';
  }

  return errors;
};

export interface ConnectionBody {
  providerId: string;
  accountId: string;
  accountType: AccountType;
  bankAccountNumber: string;
  accountHolderName: string;
  corporateId?: string;
  signatory: { name: string; nationalId: string };
  memo?: string;
}

/** The request body of `POST /v1/bank-connections` and `PATCH /v1/bank-connections/:id`. */
export const toConnectionBody = (
  providerId: string,
  values: ConnectionFormValues
): ConnectionBody => {
  const memo = values.memo.trim();
  return {
    providerId,
    accountId: values.accountId,
    accountType: values.accountType,
    bankAccountNumber: compactNumber(values.bankAccountNumber),
    accountHolderName: values.accountHolderName.trim(),
    ...(values.accountType === 'CORPORATE' ? { corporateId: values.corporateId.trim() } : {}),
    signatory: { name: values.signatoryName.trim(), nationalId: values.signatoryNationalId.trim() },
    ...(memo ? { memo } : {}),
  };
};

/** Shows only the last four digits of an account number. */
export const maskAccountNumber = (value?: string): string => {
  if (!value) return '';
  return `••••${value.length > 4 ? value.slice(-4) : ''}`;
};

export interface DraftBody {
  providerId: string;
  accountId: string;
  accountType: AccountType;
  bankAccountNumber?: string;
  accountHolderName?: string;
  corporateId?: string;
  signatory?: { name?: string; nationalId?: string };
  memo?: string;
}

/** The body of a draft: only the fields that were filled in, so a half-finished form can be saved. */
export const toDraftBody = (providerId: string, values: ConnectionFormValues): DraftBody => {
  const filled = (value: string) => value.trim() || undefined;
  const number = compactNumber(values.bankAccountNumber) || undefined;
  const signatory = {
    ...(filled(values.signatoryName) ? { name: filled(values.signatoryName) } : {}),
    ...(filled(values.signatoryNationalId)
      ? { nationalId: filled(values.signatoryNationalId) }
      : {}),
  };
  return {
    providerId,
    accountId: values.accountId,
    accountType: values.accountType,
    ...(number ? { bankAccountNumber: number } : {}),
    ...(filled(values.accountHolderName)
      ? { accountHolderName: filled(values.accountHolderName) }
      : {}),
    ...(values.accountType === 'CORPORATE' && filled(values.corporateId)
      ? { corporateId: filled(values.corporateId) }
      : {}),
    ...(Object.keys(signatory).length > 0 ? { signatory } : {}),
    ...(filled(values.memo) ? { memo: filled(values.memo) } : {}),
  };
};
