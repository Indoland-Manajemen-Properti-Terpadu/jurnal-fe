import { describe, expect, it } from 'vitest';
import { mapReceivablesSummary, mapSaleDto, mapStatusCounts } from './saleMapper';

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

describe('mapSaleDto rounding at the input boundary', () => {
  it('rounds money half up to the cent, symmetric for negative adjustments', () => {
    const sale = mapSaleDto({
      ...baseDto,
      subtotal: 1500.505,
      adjustedAmount: -250.755,
      items: [{ id: 'i', quantity: 1.5, unitPrice: 1.005, amount: 1.505, adjustedAmount: 10.005 }],
    });

    expect(sale.subtotal).toBe(1500.51);
    expect(sale.adjustedAmount).toBe(-250.76);
    expect(sale.items[0]).toMatchObject({
      quantity: 1.5,
      unitPrice: 1.01,
      amount: 1.51,
      adjustedAmount: 10.01,
    });
  });

  it('does not round quantity, tax rate or discount percentage', () => {
    const sale = mapSaleDto({
      ...baseDto,
      discountType: 'percentage',
      discountValue: 12.345,
      items: [{ id: 'i', quantity: 2.125, unitPrice: 10, tax: { id: 't', name: 'PPN', rate: 11 } }],
    });

    expect(sale.discountValue).toBe(12.345);
    expect(sale.items[0].quantity).toBe(2.125);
    expect(sale.items[0].tax?.rate).toBe(11);
  });
});

describe('mapSaleDto server flags and display status', () => {
  it('takes the badge, edit and delete decisions from the server', () => {
    const sale = mapSaleDto({
      ...baseDto,
      status: 'SENT',
      displayStatus: { code: 'OVERDUE', label: 'Jatuh Tempo' },
      canEdit: false,
      canDelete: false,
      createdByApi: true,
    });

    expect(sale.displayStatus).toEqual({ code: 'OVERDUE', label: 'Jatuh Tempo' });
    expect(sale).toMatchObject({ canEdit: false, canDelete: false, createdByApi: true });
  });

  it('falls back to the plain status when the server sends no display status', () => {
    expect(mapSaleDto({ ...baseDto, status: 'DRAFT' }).displayStatus.code).toBe('DRAFT');
    expect(mapSaleDto({ ...baseDto, status: 'PAID' }).displayStatus.code).toBe('PAID');
    expect(mapSaleDto({ ...baseDto, status: 'VOID' }).displayStatus.code).toBe('VOID');
    expect(mapSaleDto({ ...baseDto, status: 'PARTIAL_PAID' }).displayStatus.code).toBe('UNPAID');
  });

  it('defaults the permissions to closed when the server sends none', () => {
    expect(mapSaleDto(baseDto)).toMatchObject({ canEdit: false, canDelete: false });
  });

  it('reads the unit name of an item product', () => {
    const sale = mapSaleDto({
      ...baseDto,
      items: [{ ...baseDto.items[0], unit: 'Jam' }],
    });
    expect(sale.items[0].unit).toBe('Jam');
  });
});

describe('summary and counts mappers', () => {
  it('maps the receivables summary and keeps a null oldest due date', () => {
    expect(
      mapReceivablesSummary({
        overdue: { amount: 300.005, count: 3, oldestDueDate: null },
        notDue: { amount: 100, count: 1 },
        total: { amount: 400, count: 4 },
        billed: 400,
        received: 100,
      })
    ).toEqual({
      overdue: { amount: 300.01, count: 3, oldestDueDate: null },
      notDue: { amount: 100, count: 1 },
      total: { amount: 400, count: 4 },
      billed: 400,
      received: 100,
    });
  });

  it('turns a missing summary into zeros', () => {
    expect(mapReceivablesSummary(undefined).billed).toBe(0);
    expect(mapReceivablesSummary(undefined).overdue.oldestDueDate).toBeNull();
  });

  it('maps status counts with zero defaults', () => {
    expect(mapStatusCounts({ DRAFT: 2, sent: 5, all: 7 })).toEqual({
      DRAFT: 2,
      UNPAID: 0,
      PAID: 0,
      OVERDUE: 0,
      VOID: 0,
      sent: 5,
      all: 7,
    });
  });
});
