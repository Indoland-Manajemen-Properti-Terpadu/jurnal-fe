import { describe, expect, it } from 'vitest';
import { mapSaleDto } from './saleApi';

const baseDto = {
  id: 's-1',
  transactionNumber: 'INV-001',
  subtotal: 1500.5,
  total: 1665.56,
  finalAmount: 1665.56,
  paidAmount: 100,
  remainingAmount: 1565.56,
  items: [{ id: 'i-1', quantity: 2.5, unitPrice: 600.2, amount: 1500.5 }],
};

describe('mapSaleDto money (characterization)', () => {
  it('keeps decimal amounts as sent', () => {
    const sale = mapSaleDto(baseDto);

    expect(sale.subtotal).toBe(1500.5);
    expect(sale.total).toBe(1665.56);
    expect(sale.remainingAmount).toBe(1565.56);
    expect(sale.items[0]).toMatchObject({ quantity: 2.5, unitPrice: 600.2, amount: 1500.5 });
  });

  it('keeps the sign of a positive and a negative adjusted amount', () => {
    const positive = mapSaleDto({ ...baseDto, adjustedAmount: 250.75 });
    const negative = mapSaleDto({
      ...baseDto,
      adjustedAmount: -250.75,
      items: [{ ...baseDto.items[0], adjustedAmount: -10.5 }],
    });

    expect(positive.adjustedAmount).toBe(250.75);
    expect(negative.adjustedAmount).toBe(-250.75);
    expect(negative.items[0].adjustedAmount).toBe(-10.5);
  });

  it('leaves the adjusted amount undefined when absent and keeps zero', () => {
    expect(mapSaleDto(baseDto).adjustedAmount).toBeUndefined();
    expect(mapSaleDto({ ...baseDto, adjustedAmount: null }).adjustedAmount).toBeUndefined();
    expect(mapSaleDto({ ...baseDto, adjustedAmount: 0 }).adjustedAmount).toBe(0);
  });

  it('turns non-numeric amounts into 0 and falls back to total for the final amount', () => {
    const sale = mapSaleDto({
      ...baseDto,
      finalAmount: undefined,
      paidAmount: '100',
      subtotal: NaN,
    });

    expect(sale.finalAmount).toBe(1665.56);
    expect(sale.paidAmount).toBe(0);
    expect(sale.subtotal).toBe(0);
  });

  it('returns an empty draft sale for a missing dto', () => {
    const sale = mapSaleDto(null);

    expect(sale).toMatchObject({ id: '', status: 'DRAFT', total: 0, items: [], customer: null });
  });
});
