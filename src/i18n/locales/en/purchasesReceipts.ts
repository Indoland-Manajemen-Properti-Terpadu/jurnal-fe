export const purchasesReceipts = {
  form: {
    titleCreate: 'Record Goods Receipt',
    subtitle: 'Records the goods or services already received for order {number}',
    infoTitle: 'Receipt Details',
    infoSubtitle: 'Date received and the vendor delivery note number',
    fromOrder: 'From purchase order',
    dateRequired: 'The receipt date is required',
    dateBeforeOrder: 'The receipt date cannot be before the order date',
    deliveryNote: 'Delivery note number',
    deliveryNotePlaceholder: 'Example: SJ-0012',
    linesTitle: 'Items Received',
    linesSubtitle:
      'Enter the quantity received this time. Leave 0 for items that have not arrived.',
    receiveAll: 'Receive All Remaining',
    col: {
      item: 'Item / Service',
      ordered: 'Ordered',
      received: 'Already Received',
      remaining: 'Remaining',
      now: 'Received Now',
    },
    quantityAria: 'Quantity received for {item}',
    overQuantity: 'At most {max}',
    noQuantity: 'Enter a received quantity for at least one item.',
    noOrderTitle: 'No order selected',
    noOrderDescription:
      'A receipt is recorded from an approved purchase order. Open the order and choose Record Receipt.',
    notReadyTitle: 'This order cannot receive goods yet',
    notReadyDescription:
      'A receipt can only be recorded for an approved order that still has items remaining.',
    summaryTitle: 'Summary',
    summaryLines: '{count} item lines will be recorded as received.',
    summaryNone: 'No quantities entered yet.',
    impactTitle: 'Accounting impact',
    impactBody:
      'Received goods are recognised right away as an expense or inventory, with the offsetting entry in Unbilled Payables. The journal is created automatically. When the vendor bill is verified, Unbilled Payables moves into Accounts Payable.',
    submit: 'Record Receipt',
  },
  detail: {
    subtitle: 'Goods receipt from {vendor}',
    infoTitle: 'Receipt Details',
    order: 'Purchase order',
    viewOrder: 'View order',
    receivedOn: 'Date received',
    journalNote: 'This receipt has been journaled as an unbilled payable.',
    linesTitle: 'Items Received',
    col: {
      item: 'Item / Service',
      quantity: 'Received',
      accrual: 'Value Recognised',
    },
    totalAccrual: 'Total value recognised',
    void: 'Void Receipt',
    voidTitle: 'Void receipt',
    voidDescription:
      'The receipt journal is reversed and the received quantity on the order goes down. A receipt that has already been billed cannot be voided.',
  },
};
