import { describe, expect, it } from 'vitest';
import { invalidFormFields } from '@/module/bank-connection/domain/serverFields';

describe('invalidFormFields', () => {
  it('maps the field names the backend uses to the fields of the form', () => {
    expect(
      invalidFormFields({
        bankAccountNumber: 'bad',
        'signatory.name': 'bad',
        'signatory.nationalId': 'bad',
        accountHolderName: 'bad',
      })
    ).toEqual(
      new Set(['bankAccountNumber', 'signatoryName', 'signatoryNationalId', 'accountHolderName'])
    );
  });

  it('ignores a field the form does not have, and an absent answer', () => {
    expect(invalidFormFields({ somethingElse: 'x' })).toEqual(new Set());
    expect(invalidFormFields(undefined)).toEqual(new Set());
  });
});
