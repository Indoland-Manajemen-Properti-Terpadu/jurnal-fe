import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { sourceLines } from '@/module/purchases/presentation/components/orders/reorderFormState';

it('uses the server selection rule, including a bill-only one-time service', () => {
  const order = {
    items: [
      { id: 'product', quantity: 5, unitPrice: 100, reorderSelectable: true, billOnly: false },
      { id: 'term', quantity: 1, unitPrice: 20, reorderSelectable: false, billOnly: false },
      {
        id: 'one-time-service',
        quantity: 1,
        unitPrice: 10,
        reorderSelectable: true,
        billOnly: true,
      },
    ],
  } as PurchaseOrder;

  expect(sourceLines(order)).toEqual([
    { id: 'product', checked: true, quantity: 5, unitPrice: 100 },
    { id: 'term', checked: false, quantity: 1, unitPrice: 20 },
    { id: 'one-time-service', checked: true, quantity: 1, unitPrice: 10 },
  ]);
});
