export const plannedModules = {
  common: {
    title: 'This module is being prepared',
    subtitle:
      'This menu is already in the navigation, but its features are not open yet. This is the planned scope.',
    featuresTitle: 'Planned scope',
    backToDashboard: 'Back to Overview',
  },
  prototype: {
    title: 'Sample view',
    body: 'This page is still a sample view. The figures shown do not come from your books and are not saved.',
  },
  modules: {
    expenses: {
      title: 'Expenses',
      description: "Record and manage the company's operating expenses.",
      features: {
        one: 'Record daily expenses with account and tax',
        two: 'Attach proof of payment',
        three: 'Approval before posting',
        four: 'Expense reports by category and period',
      },
    },
    budgeting: {
      title: 'Budgeting',
      description: 'Set budgets by account and period, then compare them with actuals.',
      features: {
        one: 'Budgets by account and period',
        two: 'Budget versus actual comparison',
        three: 'Budget revisions with change history',
        four: 'Alerts when actuals approach the limit',
      },
    },
    production: {
      title: 'Production',
      description: 'Manage production orders from raw materials to finished goods.',
      features: {
        one: 'Material list for each finished product',
        two: 'Production orders and their status',
        three: 'Raw material usage and output',
        four: 'Production cost per order',
      },
    },
    fulfillment: {
      title: 'Fulfillment',
      description: 'Follow order fulfillment until the goods reach the customer.',
      features: {
        one: 'Orders ready to ship',
        two: 'Deliveries and delivery notes',
        three: 'Delivery status per order',
        four: 'Partial fulfillment and remaining quantities',
      },
    },
    warehouses: {
      title: 'Warehouses',
      description: 'Manage where goods are stored and the stock at each location.',
      features: {
        one: 'List of warehouses and storage locations',
        two: 'Stock per warehouse',
        three: 'Default warehouse for transactions',
        four: 'Move goods between warehouses',
      },
    },
    stockMovements: {
      title: 'Stock Movements',
      description: 'See every item that comes in, goes out, or moves.',
      features: {
        one: 'History of goods in and out',
        two: 'Source document of every movement',
        three: 'Stock balance by product and warehouse',
        four: 'Inventory value and its journal',
      },
    },
    stockTake: {
      title: 'Stock Count',
      description: 'Count physical stock and match it to the books.',
      features: {
        one: 'Physical stock count per warehouse',
        two: 'Difference against the records',
        three: 'Stock adjustment with an automatic journal',
        four: 'Count report',
      },
    },
    salesQuotations: {
      title: 'Quotations',
      description: 'Prepare price quotations for customers before an order is placed.',
      features: {
        one: 'Quotations with an expiry date',
        two: 'Turn a quotation into an order or invoice',
        three: 'Quotation status: sent, accepted, declined',
        four: 'Quotation history per customer',
      },
    },
    salesOrders: {
      title: 'Sales Orders',
      description: 'Record customer orders before goods are delivered and billed.',
      features: {
        one: 'Customer orders',
        two: 'Turn an order into an invoice',
        three: 'Track goods not yet delivered',
        four: 'Order status from draft to done',
      },
    },
    salesPayments: {
      title: 'Payments Received',
      description: 'Record money received from customers and apply it to invoices.',
      features: {
        one: 'Payments received per customer',
        two: 'Apply to one or more invoices',
        three: 'Customer advances',
        four: 'Payment receipts',
      },
    },
    salesReturns: {
      title: 'Sales Returns',
      description: 'Record goods returned by customers and adjust their bills.',
      features: {
        one: 'Returns against issued invoices',
        two: 'Credit notes for customers',
        three: 'Goods back into stock',
        four: 'Automatic reduction of receivables',
      },
    },
    receivables: {
      title: 'Receivables',
      description: 'Follow unpaid customer invoices and how old they are.',
      features: {
        one: 'Receivables per customer',
        two: 'Aging from not yet due to over 90 days',
        three: 'Overdue invoices',
        four: 'Export the receivables report',
      },
    },
    sites: {
      title: 'Manage Sites',
      description: 'Manage the companies or locations that use this app.',
      features: {
        one: 'List of sites and their status',
        two: 'Add and edit sites',
        three: 'Set users per site',
        four: 'Settings specific to each site',
      },
    },
    accountingPeriods: {
      title: 'Accounting Periods',
      description: 'Open and lock accounting periods so closed figures do not change.',
      features: {
        one: 'List of periods and their status',
        two: 'Lock a finished period',
        three: 'Reopen a period with a reason',
        four: 'History of opening and locking',
      },
    },
    approvalFlow: {
      title: 'Approval Flow',
      description: 'Decide who approves each approval step.',
      features: {
        one: 'Sequential approval levels',
        two: 'The role that approves at each level',
        three: 'Separation of duties between creator and approver',
        four: 'Applies to purchasing and other documents',
      },
    },
  },
};

export default plannedModules;
