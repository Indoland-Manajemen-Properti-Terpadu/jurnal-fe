import { describe, expect, it } from 'vitest';
import { readTokenSubject } from '@/module/bank-connection/domain/tokenSubject';

const token = (payload: object) => `h.${btoa(JSON.stringify(payload)).replace(/=+$/, '')}.s`;

describe('readTokenSubject', () => {
  it('reads the user id the access token names', () => {
    expect(readTokenSubject(token({ sub: 'user-1' }))).toBe('user-1');
  });

  it('answers "anonymous" for a missing, malformed or subject-less token', () => {
    expect(readTokenSubject(null)).toBe('anonymous');
    expect(readTokenSubject('not-a-token')).toBe('anonymous');
    expect(readTokenSubject(token({ name: 'x' }))).toBe('anonymous');
    expect(readTokenSubject('h.%%%.s')).toBe('anonymous');
  });
});
