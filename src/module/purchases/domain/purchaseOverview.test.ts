import type {
  PaymentVoucher,
  PurchaseOrder,
  PurchaseRequest,
} from '@/module/purchases/domain/purchaseDocuments';
import {
  countDecisions,
  orderFollowUpItems,
  paymentReleaseItems,
  requestItems,
  sortWorkItems,
  type WorkItem,
} from '@/module/purchases/domain/purchaseOverview';

const approval = (canDecide: boolean) => ({
  plan: [],
  entries: [],
  pending: [],
  canDecide,
  rejectionReason: null,
  rejectedAt: null,
});

const request = (id: string, canDecide: boolean) =>
  ({
    id,
    number: id,
    date: '2026-11-01',
    status: 'PENDING_APPROVAL',
    approval: approval(canDecide),
  }) as unknown as PurchaseRequest;

const order = (id: string, status: string, received: number, billed: number) =>
  ({
    id,
    number: id,
    date: '2026-11-01',
    status,
    finalAmount: 100,
    vendor: { name: 'V' },
    items: [{ quantity: 10, receivedQty: received, billedQty: billed }],
  }) as unknown as PurchaseOrder;

describe('purchaseOverview', () => {
  it('lists only requests the user can decide on', () => {
    expect(requestItems([request('a', true), request('b', false)]).map((i) => i.id)).toEqual(['a']);
  });

  it('asks to receive an approved order and to bill one that has unbilled goods', () => {
    const items = orderFollowUpItems([
      order('fresh', 'APPROVED', 0, 0),
      order('arrived', 'PARTIAL_RECEIVED', 4, 0),
      order('done', 'RECEIVED', 10, 10),
    ]);
    expect(items.map((i) => [i.id, i.reason])).toEqual([
      ['fresh', 'receiveOrder'],
      ['arrived', 'billOrder'],
    ]);
  });

  it('offers only approved vouchers for payment', () => {
    const vouchers = [
      {
        id: 'p1',
        number: 'p1',
        date: '2026-11-01',
        status: 'APPROVED',
        totalAmount: 5,
        vendor: { name: 'V' },
        approval: approval(false),
      },
      {
        id: 'p2',
        number: 'p2',
        date: '2026-11-01',
        status: 'DRAFT',
        totalAmount: 5,
        vendor: { name: 'V' },
        approval: approval(false),
      },
    ] as unknown as PaymentVoucher[];
    expect(paymentReleaseItems(vouchers).map((i) => i.id)).toEqual(['p1']);
  });

  it('puts decisions first and counts them', () => {
    const base = { docKind: 'order', vendorName: '', amount: null } as const;
    const items: WorkItem[] = [
      { ...base, key: '1', reason: 'billOrder', id: '1', number: '1', date: '2026-10-01' },
      { ...base, key: '2', reason: 'approveOrder', id: '2', number: '2', date: '2026-11-01' },
      { ...base, key: '3', reason: 'approveOrder', id: '3', number: '3', date: '2026-10-15' },
    ];
    expect(sortWorkItems(items).map((i) => i.id)).toEqual(['3', '2', '1']);
    expect(countDecisions(items)).toBe(2);
  });
});
