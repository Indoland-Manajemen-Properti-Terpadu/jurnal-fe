import type { ConnectionFormValues } from '@/module/bank-connection/domain/connectionForm';

/** The backend names the signatory fields with a dot; the form has flat names. */
const FIELD_OF_SERVER: Record<string, keyof ConnectionFormValues> = {
  accountId: 'accountId',
  accountType: 'accountType',
  bankAccountNumber: 'bankAccountNumber',
  accountHolderName: 'accountHolderName',
  corporateId: 'corporateId',
  'signatory.name': 'signatoryName',
  'signatory.nationalId': 'signatoryNationalId',
  memo: 'memo',
};

/** The form fields a validation answer of the backend rejects. */
export const invalidFormFields = (
  fieldErrors: Record<string, string> | undefined
): Set<keyof ConnectionFormValues> =>
  new Set(
    Object.keys(fieldErrors ?? {})
      .map((field) => FIELD_OF_SERVER[field])
      .filter((field): field is keyof ConnectionFormValues => Boolean(field))
  );
