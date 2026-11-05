import { describe, expect, it } from 'vitest';
import { sendNotices } from './saleNotices';

describe('sendNotices', () => {
  it('says the invoice was issued, and adds the email warning when the email did not go out', () => {
    expect(sendNotices({ emailRequested: true, emailSent: false, resend: false })).toEqual([
      { level: 'success', key: 'sent' },
      { level: 'warning', key: 'emailNotSent' },
    ]);
  });

  it('only says issued when the email was delivered or not asked for', () => {
    expect(sendNotices({ emailRequested: true, emailSent: true, resend: false })).toEqual([
      { level: 'success', key: 'sent' },
    ]);
    expect(sendNotices({ emailRequested: false, emailSent: false, resend: false })).toEqual([
      { level: 'success', key: 'sent' },
    ]);
  });

  it('does not claim a resend worked when the email failed', () => {
    expect(sendNotices({ emailRequested: true, emailSent: false, resend: true })).toEqual([
      { level: 'warning', key: 'emailNotSent' },
    ]);
    expect(sendNotices({ emailRequested: true, emailSent: true, resend: true })).toEqual([
      { level: 'success', key: 'resent' },
    ]);
  });
});
