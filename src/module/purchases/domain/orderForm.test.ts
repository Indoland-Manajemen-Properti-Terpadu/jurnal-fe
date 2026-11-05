import {
  canBecomeOrder,
  hasOrderErrors,
  orderFromRequest,
  orderTotalsInput,
  toOrderInput,
  toOrderUpdateInput,
  validateOrderForm,
} from '@/module/purchases/domain/orderForm';
import { calculateTotals } from '@/module/purchases/domain/purchaseTotals';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseDocuments';

const party = { id: 'v1', name: 'Vendor', paymentTermDays: null, npwp: null };

const request = (patch: Partial<PurchaseRequest> = {}): PurchaseRequest => ({
  id: 'r1',
  number: 'PR-1',
  date: '2026-11-05',
  memo: '',
  createdById: 'u',
  createdAt: '',
  attachments: [],
  requiredDate: '2026-11-12',
  department: '',
  purpose: '',
  mode: 'DIRECT',
  status: 'APPROVED',
  items: [
    {
      id: 'i1',
      product: { id: 'p', name: 'Kertas', sku: null, unitName: 'Rim', isInventory: false },
      description: '',
      quantity: 3,
      unitName: 'Rim',
    },
  ],
  quotations: [],
  selectedQuotationId: null,
  purchaseOrderId: null,
  approval: {
    plan: [],
    entries: [],
    pending: [],
    canDecide: false,
    rejectionReason: null,
    rejectedAt: null,
  },
  ...patch,
});

describe('canBecomeOrder', () => {
  it('follows the backend rule per procurement mode', () => {
    expect(canBecomeOrder(request())).toBe(true);
    expect(canBecomeOrder(request({ status: 'PENDING_APPROVAL' }))).toBe(false);
    expect(canBecomeOrder(request({ mode: 'WITH_QUOTATION' }))).toBe(false);
    expect(canBecomeOrder(request({ mode: 'WITH_QUOTATION', status: 'VENDOR_SELECTED' }))).toBe(
      true
    );
  });
});

describe('order form', () => {
  it('prefills prices and vendor from the selected quotation', () => {
    const form = orderFromRequest(
      request({
        mode: 'WITH_QUOTATION',
        status: 'VENDOR_SELECTED',
        selectedQuotationId: 'q1',
        quotations: [
          {
            id: 'q1',
            vendor: party,
            number: '',
            date: '',
            validUntil: null,
            total: 12,
            notes: '',
            items: [{ requestItemId: 'i1', quantity: 3, unitPrice: 4 }],
          },
        ],
      }),
      '2026-11-05'
    );
    expect(form.vendorId).toBe('v1');
    expect(form.items[0].unitPrice).toBe(4);
  });

  it('needs a vendor for a direct request and a price per line', () => {
    const form = orderFromRequest(request(), '2026-11-05');
    const errors = validateOrderForm(form, { vendorFromQuotation: false });
    expect(errors.vendor).toBe('required');
    expect(errors.itemPrices.i1).toBe('required');
    expect(hasOrderErrors(errors)).toBe(true);
    expect(validateOrderForm(form, { vendorFromQuotation: true }).vendor).toBeUndefined();
  });

  it('rejects a percentage discount above 100', () => {
    const form = {
      ...orderFromRequest(request(), '2026-11-05'),
      discountType: 'percentage' as const,
      discountValue: 120 as const,
    };
    expect(validateOrderForm(form, { vendorFromQuotation: true }).discount).toBe('invalid');
  });

  it('create omits the vendor for a quotation request; update drops the request and adds quantity', () => {
    const form = { ...orderFromRequest(request(), '2026-11-05'), vendorId: 'v1' };
    form.items[0].unitPrice = 1000;
    form.items[0].taxId = 't1';
    expect('vendor' in toOrderInput(form, 'r1', true)).toBe(false);
    expect(toOrderInput(form, 'r1', false).vendor).toBe('v1');
    const update = toOrderUpdateInput(form, false);
    expect('purchaseRequest' in update).toBe(false);
    expect(update.items[0]).toEqual({ requestItem: 'i1', unitPrice: 1000, tax: 't1', quantity: 3 });
  });

  it('feeds the live totals with the tax rate of the chosen tax', () => {
    const form = orderFromRequest(request(), '2026-11-05');
    form.items[0].unitPrice = 1000;
    form.items[0].taxId = 't11';
    const totals = calculateTotals(orderTotalsInput(form, [{ id: 't11', name: 'PPN', rate: 11 }]));
    expect(totals.total).toBe(3330);
  });
});
