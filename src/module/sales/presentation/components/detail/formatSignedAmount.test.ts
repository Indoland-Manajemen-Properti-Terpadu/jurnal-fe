import { describe, expect, it } from 'vitest';
import { formatSignedAmount } from './formatSignedAmount';

const money = (value: number) => `Rp ${value}`;

describe('formatSignedAmount', () => {
  it('prefixes a positive adjustment with a plus', () => {
    expect(formatSignedAmount(250.75, money)).toBe('+Rp 250.75');
  });

  it('shows a negative adjustment as a minus sign and the absolute value', () => {
    expect(formatSignedAmount(-250.75, money)).toBe('−Rp 250.75');
  });
});
