import type { PaymentVoucher, PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import {
  countDecisions,
  orderFollowUpItems,
  orderSendItems,
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

const request = (id: string, status: string) =>
  ({
    id,
    number: id,
    date: '2026-11-01',
    status,
  }) as unknown as PurchaseRequest;

const order = (
  id: string,
  status: string,
  received: number,
  billed: number,
  withReceipt = true,
  billedAmount = 0
) =>
  ({
    id,
    number: id,
    date: '2026-11-01',
    status,
    finalAmount: 100,
    payableAmount: 100,
    billedAmount,
    withReceipt,
    vendor: { name: 'V' },
    items: [{ quantity: 10, receivedQty: received, billedQty: billed }],
  }) as unknown as PurchaseOrder;

describe('purchaseOverview', () => {
  it('lists only submitted requests, which wait for Accounting to verify them', () => {
    const docs = ['DRAFT', 'SUBMITTED', 'VERIFIED', 'RETURNED', 'CANCELLED'].map((status) =>
      request(status, status)
    );

    expect(requestItems(docs).map((item) => item.id)).toEqual(['SUBMITTED']);
    expect(requestItems(docs)[0].reason).toBe('verifyRequest');
  });

  it('asks to receive a sent order that takes a receipt, and to bill one that takes none', () => {
    const items = orderFollowUpItems([
      order('fresh', 'SENT', 0, 0),
      order('partial', 'PARTIAL_RECEIVED', 4, 0),
      order('direct', 'SENT', 0, 0, false),
      order('billed', 'SENT', 0, 10, false, 100),
      order('done', 'RECEIVED', 10, 10),
      order('draft', 'DRAFT', 0, 0),
    ]);
    expect(items.map((i) => [i.id, i.reason])).toEqual([
      ['fresh', 'receiveOrder'],
      ['partial', 'receiveOrder'],
      ['direct', 'billOrder'],
    ]);
  });

  it('lists drafted orders as waiting to be sent', () => {
    expect(
      orderSendItems([order('d', 'DRAFT', 0, 0), order('s', 'SENT', 0, 0)]).map((i) => i.id)
    ).toEqual(['d']);
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
      { ...base, key: '2', reason: 'sendOrder', id: '2', number: '2', date: '2026-11-01' },
      { ...base, key: '3', reason: 'sendOrder', id: '3', number: '3', date: '2026-10-15' },
    ];
    expect(sortWorkItems(items).map((i) => i.id)).toEqual(['3', '2', '1']);
    expect(countDecisions(items)).toBe(2);
  });
});
