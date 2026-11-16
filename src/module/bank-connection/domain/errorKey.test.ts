import { describe, expect, it } from 'vitest';
import { connectionErrorKey } from '@/module/bank-connection/domain/errorKey';

describe('connectionErrorKey', () => {
  it('names the sentence of a known business code', () => {
    expect(connectionErrorKey({ kind: 'conflict', code: 'ACCOUNT_ALREADY_CONNECTED' })).toBe(
      'errors.ACCOUNT_ALREADY_CONNECTED'
    );
    expect(connectionErrorKey({ kind: 'refused', code: 'ACCOUNT_HOLDER_MISMATCH' })).toBe(
      'errors.ACCOUNT_HOLDER_MISMATCH'
    );
  });

  it('falls back to the kind when the code is unknown or missing', () => {
    expect(connectionErrorKey({ kind: 'network' })).toBe('errors.network');
    expect(connectionErrorKey({ kind: 'forbidden', code: 'SOMETHING' })).toBe('errors.forbidden');
    expect(connectionErrorKey({ kind: 'rateLimited' })).toBe('errors.rateLimited');
  });

  it('never shows a raw code or the server text: everything else is the generic sentence', () => {
    expect(connectionErrorKey({ kind: 'unknown', code: 'ODD_CODE' })).toBe('errors.generic');
    expect(connectionErrorKey({ kind: 'validation' })).toBe('errors.generic');
  });
});
