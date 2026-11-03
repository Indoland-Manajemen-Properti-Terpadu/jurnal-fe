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
