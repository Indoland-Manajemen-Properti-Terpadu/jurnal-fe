import { describe, expect, it } from 'vitest';
import {
  emptyConnectionForm,
  maskAccountNumber,
  toConnectionBody,
  toDraftBody,
  validateConnectionForm,
  type ConnectionFormValues,
} from '@/module/bank-connection/domain/connectionForm';

const valid = (): ConnectionFormValues => ({
  ...emptyConnectionForm(),
  accountId: 'acc-1',
  accountType: 'CORPORATE',
  bankAccountNumber: '1234567890',
  accountHolderName: 'PT Maju Bersama',
  corporateId: 'CID-835780',
  signatoryName: 'Budi Santoso',
  signatoryNationalId: '3171234567890001',
});

describe('validateConnectionForm', () => {
  it('accepts a complete corporate form', () => {
    expect(validateConnectionForm(valid())).toEqual({});
  });

  it('names every empty required field of the default corporate form', () => {
    expect(validateConnectionForm(emptyConnectionForm())).toEqual({
      accountId: 'required',
      bankAccountNumber: 'required',
      accountHolderName: 'required',
      corporateId: 'required',
      signatoryName: 'required',
      signatoryNationalId: 'required',
    });
  });

  it('asks for the corporate id only for a corporate account', () => {
    expect(validateConnectionForm({ ...valid(), corporateId: '' })).toEqual({
      corporateId: 'required',
    });
    expect(
      validateConnectionForm({ ...valid(), accountType: 'INDIVIDUAL', corporateId: '' })
    ).toEqual({});
  });

  it('wants digits only in the account number, ignoring spaces and dashes', () => {
    expect(validateConnectionForm({ ...valid(), bankAccountNumber: '12AB' })).toEqual({
      bankAccountNumber: 'digitsOnly',
    });
    expect(validateConnectionForm({ ...valid(), bankAccountNumber: '123 456-7890' })).toEqual({});
  });

  it('wants exactly sixteen digits in the national id', () => {
    expect(validateConnectionForm({ ...valid(), signatoryNationalId: '12345' })).toEqual({
      signatoryNationalId: 'nikLength',
    });
    expect(validateConnectionForm({ ...valid(), signatoryNationalId: '31712345678900AB' })).toEqual(
      {
        signatoryNationalId: 'nikLength',
      }
    );
  });

  it('treats a blank-looking value as empty', () => {
    expect(validateConnectionForm({ ...valid(), accountHolderName: '   ' })).toEqual({
      accountHolderName: 'required',
    });
  });
});

describe('toConnectionBody', () => {
  it('sends trimmed values, digits only for the numbers, and the signatory as one object', () => {
    expect(
      toConnectionBody('prov-1', {
        ...valid(),
        bankAccountNumber: '123 456-7890',
        accountHolderName: '  PT Maju Bersama ',
        memo: ' uji ',
      })
    ).toEqual({
      providerId: 'prov-1',
      accountId: 'acc-1',
      accountType: 'CORPORATE',
      bankAccountNumber: '1234567890',
      accountHolderName: 'PT Maju Bersama',
      corporateId: 'CID-835780',
      signatory: { name: 'Budi Santoso', nationalId: '3171234567890001' },
      memo: 'uji',
    });
  });

  it('leaves out the corporate id of an individual account and an empty memo', () => {
    const body = toConnectionBody('prov-1', { ...valid(), accountType: 'INDIVIDUAL' });
    expect(body).not.toHaveProperty('corporateId');
    expect(body).not.toHaveProperty('memo');
  });
});

describe('maskAccountNumber', () => {
  it('shows only the last four digits', () => {
    expect(maskAccountNumber('1234567890')).toBe('••••7890');
    expect(maskAccountNumber('123')).toBe('••••');
    expect(maskAccountNumber(undefined)).toBe('');
  });
});

describe('toDraftBody', () => {
  it('sends only what has been filled in, so a half-finished form can be saved', () => {
    expect(
      toDraftBody('prov-1', {
        ...emptyConnectionForm(),
        accountId: 'acc-1',
        bankAccountNumber: '123 456',
        signatoryName: ' Budi ',
      })
    ).toEqual({
      providerId: 'prov-1',
      accountId: 'acc-1',
      accountType: 'CORPORATE',
      bankAccountNumber: '123456',
      signatory: { name: 'Budi' },
    });
  });

  it('leaves out the signatory when neither name nor id is filled', () => {
    expect(toDraftBody('p', { ...emptyConnectionForm(), accountId: 'a' })).toEqual({
      providerId: 'p',
      accountId: 'a',
      accountType: 'CORPORATE',
    });
  });
});
