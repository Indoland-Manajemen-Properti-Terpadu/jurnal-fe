import { toPasswordChangeError } from './passwordError';

const refused = (status: number, message?: string) => ({
  isAxiosError: true,
  response: { status, data: message ? { message } : {} },
});

describe('toPasswordChangeError', () => {
  it('tells a wrong current password from a repeated one', () => {
    expect(toPasswordChangeError(refused(400, 'Current password is incorrect'))).toBe(
      'currentIncorrect'
    );
    expect(
      toPasswordChangeError(
        refused(400, 'New password must be different from the current password')
      )
    ).toBe('sameAsCurrent');
  });

  it('treats any other rejected input as invalid', () => {
    expect(toPasswordChangeError(refused(400, 'password must be at least 8 characters'))).toBe(
      'invalid'
    );
  });

  it('separates a lost connection and unexpected failures', () => {
    expect(toPasswordChangeError({ isAxiosError: true })).toBe('network');
    expect(toPasswordChangeError(refused(500))).toBe('unknown');
    expect(toPasswordChangeError(new Error('x'))).toBe('unknown');
  });
});
