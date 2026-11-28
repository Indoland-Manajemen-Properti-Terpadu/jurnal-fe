import { describe, expect, it } from 'vitest';
import { validateReminderEmail } from './reminderEmail';

describe('validateReminderEmail', () => {
  it('rejects the example addresses bundled with demo data', () => {
    expect(validateReminderEmail('demo2@example.test')).toBe('example');
    expect(validateReminderEmail('user@example.com')).toBe('example');
  });

  it('accepts a syntactically valid non-example address', () => {
    expect(validateReminderEmail('person@company.co.id')).toBeNull();
  });

  it('requires an address and rejects malformed input', () => {
    expect(validateReminderEmail('')).toBe('missing');
    expect(validateReminderEmail('not-an-email')).toBe('invalid');
  });
});
