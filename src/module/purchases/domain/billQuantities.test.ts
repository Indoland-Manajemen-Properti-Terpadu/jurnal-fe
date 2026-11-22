import {
  billItemsFor,
  estimateBill,
  rowKey,
  type BillSourceDoc,
  type BillSourceLine,
} from '@/module/purchases/domain/billSources';

const line = (
  id: string,
  open: number,
  price: number,
  receiptItemId = `r-${id}`
): BillSourceLine => ({
  purchaseOrderItemId: id,
  receiptItemId,
  description: `Item ${id}`,
  openQty: open,
  unitPrice: price,
  taxRate: 0,
  schedule: null,
});

const receipt = (lines: BillSourceLine[], orderLines: BillSourceLine[] = []): BillSourceDoc =>
  ({
    id: 'gr1',
    number: 'FPB/1',
    orderId: 'po1',
    orderNumber: 'PO/1',
    isPriceIncludeTax: false,
    lines,
    orderLines,
  }) as unknown as BillSourceDoc;

describe('bill quantities', () => {
  const doc = receipt([line('a', 20, 52000), line('b', 80, 3000)]);

  it('bills everything still open when no quantity was changed', () => {
    const estimate = estimateBill([doc]);

    expect(estimate.rows.map((row) => row.qty)).toEqual([20, 80]);
    expect(estimate.subtotal).toBe(20 * 52000 + 80 * 3000);
  });

  it('takes the quantity the person typed and reprices the bill', () => {
    const estimate = estimateBill([doc], { [rowKey(doc.id, 'a')]: 10 });

    expect(estimate.rows[0]).toMatchObject({ qty: 10, max: 20 });
    expect(estimate.subtotal).toBe(10 * 52000 + 80 * 3000);
  });

  it('never bills more than is open or less than nothing', () => {
    const estimate = estimateBill([doc], {
      [rowKey(doc.id, 'a')]: 99,
      [rowKey(doc.id, 'b')]: -5,
    });

    expect(estimate.rows.map((row) => row.qty)).toEqual([20, 0]);
  });

  it('sends no items while every line is billed in full', () => {
    expect(billItemsFor('RECEIPT', [doc], {})).toBeNull();
  });

  it('sends the receipt lines with their quantity once one is partial, leaving out a zero line', () => {
    const items = billItemsFor('RECEIPT', [doc], {
      [rowKey(doc.id, 'a')]: 10,
      [rowKey(doc.id, 'b')]: 0,
    });

    expect(items).toEqual([{ goodsReceipt: 'gr1', goodsReceiptItem: 'r-a', quantity: 10 }]);
  });

  it('names the order and its item when the bill is made from an order', () => {
    const order = { ...receipt([line('a', 5, 100)]), id: 'po1' };

    expect(billItemsFor('ORDER', [order], { [rowKey('po1', 'a')]: 2 })).toEqual([
      { purchaseOrder: 'po1', purchaseOrderItem: 'a', quantity: 2 },
    ]);
  });
});
