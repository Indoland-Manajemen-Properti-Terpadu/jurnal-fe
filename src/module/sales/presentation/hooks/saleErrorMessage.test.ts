import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { ClassifiedSaleError } from '../../infrastructure/saleErrors';
import { describeSaleError } from './saleErrorMessage';

const classify = vi.fn<[unknown], ClassifiedSaleError>();
vi.mock('../../infrastructure/saleErrors', () => ({
  classifySaleError: (error: unknown) => classify(error),
}));

const t = (key: string) => `[${key}]`;
const BUSINESS = 'Akun kas kecil KK-ENG tidak boleh dipakai di jurnal manual.';

describe('describeSaleError', () => {
  beforeEach(() => {
    classify.mockReset();
  });

  it('shows an Indonesian business message as written to Indonesian readers', () => {
    classify.mockReturnValue({ kind: 'domain', serverMessage: BUSINESS });
    expect(describeSaleError(new Error('x'), 'id', t)).toBe(BUSINESS);
  });

  it('gives English readers a generic sentence', () => {
    classify.mockReturnValue({ kind: 'domain', serverMessage: BUSINESS });
    expect(describeSaleError(new Error('x'), 'en', t)).toBe('[errors.rejected]');
  });

  it('never shows validation text or unknown failures', () => {
    classify.mockReturnValue({ kind: 'validation' });
    expect(describeSaleError(new Error('x'), 'id', t)).toBe('[errors.validation]');
    classify.mockReturnValue({ kind: 'unknown' });
    expect(describeSaleError(new Error('x'), 'id', t)).toBe('[errors.generic]');
  });

  it('hides the generic forbidden text from the server', () => {
    classify.mockReturnValue({ kind: 'forbidden', serverMessage: 'Forbidden Access Role' });
    expect(describeSaleError(new Error('x'), 'id', t)).toBe('[errors.forbidden]');
  });
});
