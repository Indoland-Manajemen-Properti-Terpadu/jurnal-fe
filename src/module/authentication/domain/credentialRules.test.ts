import { MIN_PASSWORD_LENGTH, validateEmail, validatePassword } from './credentialRules';

describe('validateEmail', () => {
  it.each(['a@b.co', 'nama.belakang@indoland.id', 'x+tag@mail.example.org'])(
    'accepts %s',
    (email) => {
      expect(validateEmail(email)).toBeNull();
    }
  );

  it.each(['', 'plain', 'a@b', '@b.co', 'a b@c.de', 'a@b .co'])('rejects "%s"', (email) => {
    expect(validateEmail(email)).toBe('validation.emailInvalid');
  });
});

describe('validatePassword', () => {
  it('needs at least six characters', () => {
    expect(MIN_PASSWORD_LENGTH).toBe(6);
    expect(validatePassword('12345')).toBe('validation.passwordMin');
    expect(validatePassword('123456')).toBeNull();
  });
});
