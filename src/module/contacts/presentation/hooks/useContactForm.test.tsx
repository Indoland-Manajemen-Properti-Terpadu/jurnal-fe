import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useContactForm } from './useContactForm';

describe('useContactForm email validation', () => {
  it('requires an email and rejects invalid formats', () => {
    const { result } = renderHook(() => useContactForm(true));

    act(() => result.current.setFieldValue('emails', ['not-an-email']));
    let hasInvalidEmailError = false;
    act(() => {
      hasInvalidEmailError = result.current.validateField('emails').hasError;
    });

    expect(hasInvalidEmailError).toBe(true);
    expect(result.current.errors.emails).toBeTruthy();

    act(() => result.current.setFieldValue('emails', ['']));
    let hasBlankEmailError = false;
    act(() => {
      hasBlankEmailError = result.current.validateField('emails').hasError;
    });

    expect(hasBlankEmailError).toBe(true);

    act(() => result.current.setFieldValue('emails', ['user@example.com']));
    let hasValidEmailError = true;
    act(() => {
      hasValidEmailError = result.current.validateField('emails').hasError;
    });

    expect(hasValidEmailError).toBe(false);
  });
});

describe('useContactForm numeric validation', () => {
  it('flags bad identity, NPWP, phones, postal code and bank rows on submit', () => {
    const { result } = renderHook(() => useContactForm(true));

    act(() => {
      result.current.setValues({
        displayName: 'PT Maju',
        emails: ['a@b.co'],
        identity: { type: 'KTP', number: '123' },
        npwp: '12',
        phones: { mobile: '08', telephone: '02', fax: '' },
        addresses: {
          billing: {
            general: '',
            detail: { ...result.current.values.addresses.billing.detail, zipCode: '12' },
          },
          shipping: result.current.values.addresses.shipping,
        },
        bankAccounts: [{ bankName: '', branch: '', accountHolder: '', accountNumber: '123' }],
      });
    });
    let errors: Record<string, unknown> = {};
    act(() => {
      errors = result.current.validate().errors;
    });

    expect(Object.keys(errors).sort()).toEqual(
      [
        'addresses.billing.detail.zipCode',
        'bankAccounts.0.accountNumber',
        'bankAccounts.0.bankName',
        'identity.number',
        'npwp',
        'phones.mobile',
        'phones.telephone',
      ].sort()
    );
  });

  it('passes with all optional fields empty', () => {
    const { result } = renderHook(() => useContactForm(true));
    act(() => result.current.setFieldValue('displayName', 'PT Maju'));
    act(() => result.current.setFieldValue('emails', ['a@b.co']));
    let hasErrors = true;
    act(() => {
      hasErrors = result.current.validate().hasErrors;
    });
    expect(hasErrors).toBe(false);
  });
});
