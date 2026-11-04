import { pettyCash as en } from '@/i18n/locales/en/pettyCash';
import { pettyCash as id } from '@/i18n/locales/id/pettyCash';
import { PettyCashError } from '@/module/petty-cash/infrastructure/pettyCashErrors';
import {
  describePettyCashError,
  KNOWN_ERROR_CODES,
} from '@/module/petty-cash/presentation/hooks/pettyCashErrorMessage';

const t = (key: string) => `t:${key}`;

describe('describePettyCashError', () => {
  const insufficient = new PettyCashError({
    kind: 'domain',
    code: 'PETTY_CASH_INSUFFICIENT_BALANCE',
    serverMessage: 'Nominal melebihi kas tersedia (Rp3.589.000)',
  });

  it('shows the specific Indonesian server message to Indonesian readers', () => {
    expect(describePettyCashError(insufficient, 'id', t)).toBe(
      'Nominal melebihi kas tersedia (Rp3.589.000)'
    );
  });

  it('suggests a transfer when the shortage names a pocket', () => {
    const short = new PettyCashError({
      kind: 'domain',
      code: 'PETTY_CASH_INSUFFICIENT_BALANCE',
      serverMessage: 'Saldo kantong BCA tidak cukup',
      details: { pocket: 'BCA-KK' },
    });
    expect(describePettyCashError(short, 'id', t)).toBe(
      'Saldo kantong BCA tidak cukup t:errors.pocketTransferHint'
    );
    expect(describePettyCashError(insufficient, 'id', t)).not.toContain('pocketTransferHint');
  });

  it('translates a known code for English readers', () => {
    expect(describePettyCashError(insufficient, 'en', t)).toBe(
      't:errors.codes.PETTY_CASH_INSUFFICIENT_BALANCE'
    );
  });

  it('falls back to a generic refusal for an unknown code in English', () => {
    const unknown = new PettyCashError({ kind: 'domain', code: 'SOMETHING_NEW' });
    expect(describePettyCashError(unknown, 'en', t)).toBe('t:errors.rejected');
  });

  it('never shows Joi text, only a translated hint', () => {
    const validation = new PettyCashError({
      kind: 'validation',
      serverMessage: '"date" is required',
    });
    expect(describePettyCashError(validation, 'id', t)).toBe('t:errors.validation');
  });

  it.each([
    ['forbidden', 't:errors.forbidden'],
    ['unauthorized', 't:errors.unauthorized'],
    ['network', 't:errors.network'],
    ['unknown', 't:errors.generic'],
  ] as const)('maps %s to its sentence', (kind, expected) => {
    expect(describePettyCashError(new PettyCashError({ kind }), 'id', t)).toBe(expected);
  });

  it('has a sentence for every known code in both languages', () => {
    KNOWN_ERROR_CODES.forEach((code) => {
      expect(id.errors.codes[code]).toBeTruthy();
      expect(en.errors.codes[code]).toBeTruthy();
    });
  });
});
