import { toGoodsReceipt } from './purchaseDocumentMappers';
import type { GoodsReceiptDto } from './purchaseDto';
import { receiptActions } from '../domain/purchaseActions';

/** Trimmed from the live service (2026-11-21): a service receipt waiting for approval. */
const bapp = {
  id: 'r1',
  transactionNumber: 'BAPP/2026/11/0001',
  transactionDate: '2026-11-21T00:00:00.000Z',
  createdBy: 'u1',
  createdAt: '2026-11-21T07:00:00.000Z',
  kind: 'SERVICE',
  documentLabel: 'BAPP',
  status: 'PENDING_APPROVAL',
  statusLabel: 'Menunggu approval',
  vendor: { id: 'v1', displayName: 'PT Geruite' },
  purchaseOrder: 'po1',
  purchaseOrderRef: { id: 'po1', transactionNumber: 'SPK/2026/11/0001' },
  amount: 24975000,
  canDecide: true,
  approvalStage: 0,
  pendingApprovers: [
    {
      level: 0,
      name: 'Chief Finance',
      mode: 'ANY',
      roles: [{ id: 'r', name: 'Chief Finance', approved: false }],
    },
  ],
  items: [
    {
      _id: 'i1',
      purchaseOrderItem: 'poi1',
      description: 'Termin 1 dari 3',
      receivedQty: 1,
      accrualAmount: 24975000,
    },
  ],
  billRefs: [{ id: 'b1', transactionNumber: 'FKT/2026/11/0001', status: 'DRAFT' }],
} as unknown as GoodsReceiptDto;

describe('toGoodsReceipt', () => {
  const receipt = toGoodsReceipt(bapp);

  it('reads the kind, the label, the order and the value', () => {
    expect(receipt).toMatchObject({
      kind: 'SERVICE',
      documentLabel: 'BAPP',
      status: 'PENDING_APPROVAL',
      statusLabel: 'Menunggu approval',
      purchaseOrderId: 'po1',
      purchaseOrderNumber: 'SPK/2026/11/0001',
      amount: 24975000,
      warehouse: null,
    });
    expect(receipt.items[0]).toMatchObject({
      receivedQty: 1,
      rejectedQty: 0,
      accrualAmount: 24975000,
    });
    expect(receipt.billRefs).toEqual([{ id: 'b1', number: 'FKT/2026/11/0001', status: 'DRAFT' }]);
  });

  it('carries who may decide next', () => {
    expect(receipt.approval.canDecide).toBe(true);
    expect(receipt.approval.pending[0].name).toBe('Chief Finance');
  });

  it('defaults a goods receipt to an FPB with its warehouse and rejected quantity', () => {
    const fpb = toGoodsReceipt({
      ...bapp,
      kind: undefined,
      documentLabel: undefined,
      status: 'POSTED',
      warehouse: { id: 'w1', name: 'Gudang Utama' },
      items: [{ ...bapp.items[0], rejectedQty: 1 }],
    } as unknown as GoodsReceiptDto);

    expect(fpb).toMatchObject({ kind: 'GOODS', documentLabel: 'FPB', warehouse: { id: 'w1' } });
    expect(fpb.items[0].rejectedQty).toBe(1);
  });
});

describe('receiptActions', () => {
  const doc = (status: string, canDecide = false) =>
    toGoodsReceipt({ ...bapp, status, canDecide } as unknown as GoodsReceiptDto);

  it('voids a confirmed receipt, resubmits a rejected BAPP and lets an approver decide a pending one', () => {
    expect(receiptActions(doc('POSTED'))).toEqual({ void: true, resubmit: false, decide: false });
    expect(receiptActions(doc('REJECTED'))).toEqual({ void: false, resubmit: true, decide: false });
    expect(receiptActions(doc('PENDING_APPROVAL', true))).toEqual({
      void: false,
      resubmit: false,
      decide: true,
    });
    expect(receiptActions(doc('PENDING_APPROVAL', false)).decide).toBe(false);
    expect(receiptActions(doc('VOID'))).toEqual({ void: false, resubmit: false, decide: false });
  });
});
