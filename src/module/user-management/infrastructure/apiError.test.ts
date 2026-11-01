import { AxiosError, type AxiosResponse } from 'axios';
import { isDefinitiveRefusal, toUserManagementError } from './apiError';

const failure = (status: number, message?: string) => {
  const error = new AxiosError('failed');
  error.response = { status, data: message ? { message } : {} } as AxiosResponse;
  return error;
};

describe('toUserManagementError', () => {
  it('maps the documented statuses', () => {
    expect(toUserManagementError(failure(403)).kind).toBe('forbidden');
    expect(toUserManagementError(failure(404)).kind).toBe('notFound');
    expect(toUserManagementError(failure(409)).kind).toBe('conflict');
    expect(toUserManagementError(failure(400, 'Cannot disable the last Super Admin')).kind).toBe(
      'invalid'
    );
    expect(toUserManagementError(failure(500)).kind).toBe('unknown');
  });

  it('recognises a taken email', () => {
    expect(toUserManagementError(failure(400, 'Email already taken')).kind).toBe('duplicateEmail');
  });

  it('reports a missing response as a network problem', () => {
    expect(toUserManagementError(new AxiosError('offline')).kind).toBe('network');
  });

  it('treats anything else as unknown', () => {
    expect(toUserManagementError(new Error('x')).kind).toBe('unknown');
  });
});

describe('isDefinitiveRefusal', () => {
  it('is true for a refusal or a missing record and false for a server fault or no response', () => {
    expect(isDefinitiveRefusal(failure(403))).toBe(true);
    expect(isDefinitiveRefusal(failure(404))).toBe(true);
    expect(isDefinitiveRefusal(failure(500))).toBe(false);
    expect(isDefinitiveRefusal(new AxiosError('offline'))).toBe(false);
    expect(isDefinitiveRefusal(new Error('x'))).toBe(false);
  });
});
