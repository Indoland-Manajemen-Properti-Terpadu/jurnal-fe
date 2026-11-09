export const purchasesHub = {
  title: 'Purchases',
  subtitle: 'Manage purchasing from request and order to goods receipt, vendor bill and payment.',
  refresh: 'Refresh data',
  createRequest: 'New Purchase Request',
  createAdvance: 'New Advance Payment',
  noAccessTitle: 'You do not have access to Purchases yet',
  noAccessDescription: 'Contact your administrator to get access to the purchasing menus.',
  tabs: {
    overview: 'Overview',
    requests: 'Requests',
    orders: 'Orders',
    receipts: 'Receipts',
    bills: 'Bills',
    payments: 'Payments',
    returns: 'Returns',
  },
  pages: {
    requests: {
      title: 'Purchase Requests',
      description:
        'Ask for goods or services. Once approved, a request becomes an order to the vendor.',
    },
    orders: {
      title: 'Purchase Orders',
      description: 'Orders to vendors, created from approved purchase requests.',
    },
    receipts: {
      title: 'Goods Receipts',
      description: 'Record the goods or services that have arrived from a vendor.',
    },
    bills: {
      title: 'Vendor Bills',
      description: 'Bills from vendors. Verify each one before it is paid.',
    },
    payments: {
      title: 'Purchase Payments',
      description: 'Payment vouchers for vendor bills and advances to vendors.',
    },
    returns: {
      title: 'Purchase Returns',
      description: 'Goods sent back to the vendor against a verified bill.',
    },
  },
  overview: {
    outstanding: 'Accounts payable outstanding',
    outstandingHint: 'across {count} unpaid bills',
    overdue: 'Past due',
    decisions: 'Waiting for your decision',
    decisionsHint: 'Documents you can approve or reject now',
    readyToPay: 'Ready to pay',
    readyToPayHint: 'Approved vouchers waiting for payment',
    pipelineTitle: 'Purchasing flow',
    pipelineSubtitle: 'From request to payment. Click a stage to open its list.',
    agingTitle: 'Payables age',
    aging: {
      current: 'Not yet due',
      days1to30: '1–30 days',
      days31to60: '31–60 days',
      days61to90: '61–90 days',
      over90: 'Over 90 days',
    },
    overdueShare: '{percent}% of total payables',
    showAll: 'Show all ({count})',
    seeReport: 'Open payables report',
    agingSubtitle: 'Remaining payables by days past due',
    decisionType: {
      approveRequest: 'Requests',
      approveOrder: 'Orders',
      approvePayment: 'Payments',
    },
    workTitle: 'Needs action',
    workSubtitle: 'Order: approval decisions, payments, verification, then order follow-up.',
    emptyTitle: 'All caught up',
    emptyDescription: 'No documents are waiting for your action right now.',
    reason: {
      approveRequest: 'Request waiting for your approval',
      approveOrder: 'Order waiting for your approval',
      approvePayment: 'Payment waiting for your approval',
      payVoucher: 'Voucher approved, ready to pay',
      verifyBill: 'Draft bill, needs verification',
      receiveOrder: 'Order approved, waiting for goods',
      billOrder: 'Goods received, not billed yet',
    },
  },
  requests: {
    search: 'Search number, purpose or department',
    mode: 'Procurement',
    items: 'Items',
    modes: {
      DIRECT: 'Direct',
      WITH_QUOTATION: 'With quotations',
    },
    emptyTitle: 'No purchase requests yet',
    emptyDescription:
      'Purchasing starts with a request. Once approved, the request becomes an order to a vendor.',
  },
  orders: {
    search: 'Search order number or vendor',
    expected: 'Expected on',
    payable: 'Payable to vendor',
    emptyTitle: 'No purchase orders yet',
    emptyDescription:
      'Orders are created from an approved purchase request. Open that request and choose Create Order.',
  },
  receipts: {
    search: 'Search receipt number or vendor',
    deliveryNote: 'Delivery note',
    quantity: 'Quantity received',
    emptyTitle: 'No goods receipts yet',
    emptyDescription:
      'Receipts are recorded from an approved order when the goods or services arrive.',
  },
  bills: {
    search: 'Search bill number, vendor invoice or vendor',
    dueDate: 'Due date',
    payable: 'Payable',
    remaining: 'Remaining',
    overdueOnly: 'Past due only',
    emptyTitle: 'No vendor bills yet',
    emptyDescription:
      'Bills are created from orders whose goods have been received, then verified before payment.',
  },
  payments: {
    search: 'Search voucher number, reference or vendor',
    allTypes: 'All types',
    typeFilter: 'Payment type filter',
    types: {
      BILL: 'Bill',
      ADVANCE: 'Advance',
    },
    emptyTitle: 'No payment vouchers yet',
    emptyDescription:
      'Vouchers are created from verified bills. You can also record an advance payment to a vendor.',
  },
  returns: {
    search: 'Search return number or vendor',
    reason: 'Reason',
    value: 'Return value',
    emptyTitle: 'No purchase returns yet',
    emptyDescription: 'Returns are created from a verified bill when goods go back to the vendor.',
  },
};
