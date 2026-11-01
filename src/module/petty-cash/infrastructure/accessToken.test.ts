import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import { readUserIdFromToken } from '@/module/petty-cash/infrastructure/accessToken';

const base64Url = (value: unknown) =>
  btoa(JSON.stringify(value)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const tokenWith = (claims: unknown) =>
  `${base64Url({ alg: 'HS256' })}.${base64Url(claims)}.signature`;

describe('readUserIdFromToken', () => {
  it('reads the user id from the sub claim', () => {
    expect(
      readUserIdFromToken(tokenWith({ sub: '6ae5c628a5fe03e546a00253', type: 'access' }))
    ).toBe('6ae5c628a5fe03e546a00253');
  });

  it('decodes base64url payloads that need padding and url-safe characters', () => {
    const sub = 'a?b>c~'.repeat(3);
    expect(readUserIdFromToken(tokenWith({ sub }))).toBe(sub);
  });

  it.each([
    ['no token', null],
    ['an empty token', ''],
    ['a token without a payload', 'abc'],
    ['a payload that is not JSON', `a.${btoa('not json')}.c`],
    ['a payload without sub', tokenWith({ type: 'access' })],
    ['a sub that is not text', tokenWith({ sub: 42 })],
    ['an empty sub', tokenWith({ sub: '' })],
  ])('rejects %s as unauthorized', (_label, token) => {
    expect(() => readUserIdFromToken(token)).toThrow(PettyCashError);
    try {
      readUserIdFromToken(token);
    } catch (error) {
      expect((error as PettyCashError).kind).toBe('unauthorized');
    }
  });
});
