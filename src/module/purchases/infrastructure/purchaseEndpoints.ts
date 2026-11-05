const PR = '/v1/purchase-requests';
const PO = '/v1/purchase-orders';
const GR = '/v1/goods-receipts';
const BILL = '/v1/purchase-bills';
const PAY = '/v1/purchase-payments';
const RET = '/v1/purchase-returns';

export const PURCHASE_API = {
  requests: PR,
  request: (id: string) => `${PR}/${id}`,
  requestAction: (id: string, action: string) => `${PR}/${id}/${action}`,
  requestQuotations: (id: string) => `${PR}/${id}/quotations`,
  requestAttachments: (id: string) => `${PR}/${id}/attachments`,

  orders: PO,
  order: (id: string) => `${PO}/${id}`,
  orderAction: (id: string, action: string) => `${PO}/${id}/${action}`,
  orderPrint: (id: string) => `${PO}/${id}/print`,
  orderAttachments: (id: string) => `${PO}/${id}/attachments`,

  receipts: GR,
  receipt: (id: string) => `${GR}/${id}`,
  receiptVoid: (id: string) => `${GR}/${id}/void`,
  receiptAttachments: (id: string) => `${GR}/${id}/attachments`,

  bills: BILL,
  bill: (id: string) => `${BILL}/${id}`,
  billAction: (id: string, action: string) => `${BILL}/${id}/${action}`,
  billAttachments: (id: string) => `${BILL}/${id}/attachments`,
  billCreditApplications: (id: string) => `${BILL}/${id}/credit-applications`,
  billCreditApplicationVoid: (id: string, applicationId: string) =>
    `${BILL}/${id}/credit-applications/${applicationId}/void`,
  vendorCredits: `${BILL}/vendor-credits`,
  payablesBySupplier: `${BILL}/payables/by-supplier`,
  payablesExport: `${BILL}/payables/by-supplier/export`,

  payments: PAY,
  payment: (id: string) => `${PAY}/${id}`,
  paymentAction: (id: string, action: string) => `${PAY}/${id}/${action}`,
  paymentPrint: (id: string) => `${PAY}/${id}/print`,
  paymentAttachments: (id: string) => `${PAY}/${id}/attachments`,

  returns: RET,
  return: (id: string) => `${RET}/${id}`,
  returnAction: (id: string, action: string) => `${RET}/${id}/${action}`,
  returnAttachments: (id: string) => `${RET}/${id}/attachments`,

  contacts: '/v1/contacts',
  products: '/v1/products',
  taxes: '/v1/taxes',
  paymentMethods: '/v1/payment-methods',
  paymentTerms: '/v1/payment-terms',
  myPermissions: '/v1/users/me/permissions',
  generalSettings: '/v1/settings/general-settings',
} as const;
