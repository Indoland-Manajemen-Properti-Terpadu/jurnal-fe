import type { Page } from '@/module/purchases/domain/purchaseCommon';
import type {
  GoodsReceipt,
  PayablesAging,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseReturn,
  VendorCredits,
} from '@/module/purchases/domain/purchaseDocuments';
import type {
  CreditApplicationInput,
  GoodsReceiptInput,
  PaymentVoucherInput,
  PurchaseBillInput,
  PurchaseOrderInput,
  PurchaseRequestInput,
  PurchaseReturnInput,
  QuotationInput,
} from '@/module/purchases/domain/purchaseInputs';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type {
  ApiEnvelope,
  GoodsReceiptDto,
  ListDto,
  PayablesAgingDto,
  PaymentVoucherDto,
  PurchaseBillDto,
  PurchaseOrderDto,
  PurchaseRequestDto,
  PurchaseReturnDto,
  VendorCreditsDto,
} from '@/module/purchases/infrastructure/purchaseDto';
import {
  toGoodsReceipt,
  toPayablesAging,
  toPaymentVoucher,
  toPurchaseBill,
  toPurchaseOrder,
  toPurchaseRequest,
  toPurchaseReturn,
  toVendorCredits,
} from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import { http, type QueryValue } from '@/module/purchases/infrastructure/purchaseHttp';
import { toPage } from '@/module/purchases/infrastructure/purchaseMappers';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  vendor?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: QueryValue;
}

/** Wraps one document type: list, detail and the shared create / update / action calls. */
const resource = <Dto, Doc>(
  endpoints: {
    list: string;
    one: (id: string) => string;
    action: (id: string, a: string) => string;
  },
  map: (dto: Dto) => Doc
) => {
  const one = async (call: Promise<ApiEnvelope<Dto>>) => map((await call).data);
  return {
    list: async (params: ListParams = {}): Promise<Page<Doc>> =>
      toPage((await http.get<ApiEnvelope<ListDto<Dto>>>(endpoints.list, params)).data, map),
    get: (id: string) => one(http.get<ApiEnvelope<Dto>>(endpoints.one(id))),
    create: (body: unknown) => one(http.post<ApiEnvelope<Dto>>(endpoints.list, body)),
    update: (id: string, body: unknown) => one(http.put<ApiEnvelope<Dto>>(endpoints.one(id), body)),
    act: (id: string, action: string, body?: unknown) =>
      one(http.post<ApiEnvelope<Dto>>(endpoints.action(id, action), body)),
  };
};

const requests = resource<PurchaseRequestDto, PurchaseRequest>(
  { list: PURCHASE_API.requests, one: PURCHASE_API.request, action: PURCHASE_API.requestAction },
  toPurchaseRequest
);
const orders = resource<PurchaseOrderDto, PurchaseOrder>(
  { list: PURCHASE_API.orders, one: PURCHASE_API.order, action: PURCHASE_API.orderAction },
  toPurchaseOrder
);
const receipts = resource<GoodsReceiptDto, GoodsReceipt>(
  {
    list: PURCHASE_API.receipts,
    one: PURCHASE_API.receipt,
    action: (id, action) => `${PURCHASE_API.receipt(id)}/${action}`,
  },
  toGoodsReceipt
);
const bills = resource<PurchaseBillDto, PurchaseBill>(
  { list: PURCHASE_API.bills, one: PURCHASE_API.bill, action: PURCHASE_API.billAction },
  toPurchaseBill
);
const payments = resource<PaymentVoucherDto, PaymentVoucher>(
  { list: PURCHASE_API.payments, one: PURCHASE_API.payment, action: PURCHASE_API.paymentAction },
  toPaymentVoucher
);
const returns = resource<PurchaseReturnDto, PurchaseReturn>(
  { list: PURCHASE_API.returns, one: PURCHASE_API.return, action: PURCHASE_API.returnAction },
  toPurchaseReturn
);

/* ---------- Purchase request ---------- */
export const listRequests = requests.list;
export const getRequest = requests.get;
export const createRequest = (input: PurchaseRequestInput) => requests.create(input);
export const updateRequest = (id: string, input: PurchaseRequestInput) =>
  requests.update(id, input);
export const submitRequest = (id: string) => requests.act(id, 'submit');
export const approveRequest = (id: string, note?: string) =>
  requests.act(id, 'approve', note ? { note } : undefined);
export const rejectRequest = (id: string, reason: string) => requests.act(id, 'reject', { reason });
export const cancelRequest = (id: string, reason: string) => requests.act(id, 'cancel', { reason });
export const saveQuotations = async (id: string, quotations: QuotationInput[]) =>
  toPurchaseRequest(
    (
      await http.put<ApiEnvelope<PurchaseRequestDto>>(PURCHASE_API.requestQuotations(id), {
        quotations,
      })
    ).data
  );
export const selectQuotation = (id: string, quotationId: string) =>
  requests.act(id, 'select-quotation', { quotationId });

/* ---------- Purchase order ---------- */
export const listOrders = orders.list;
export const getOrder = orders.get;
export const createOrder = (input: PurchaseOrderInput) => orders.create(input);
export const submitOrder = (id: string) => orders.act(id, 'submit');
export const approveOrder = (id: string, note?: string) =>
  orders.act(id, 'approve', note ? { note } : undefined);
export const rejectOrder = (id: string, reason: string) => orders.act(id, 'reject', { reason });
export const closeOrder = (id: string) => orders.act(id, 'close');
export const voidOrder = (id: string, reason: string) => orders.act(id, 'void', { reason });

/* ---------- Goods receipt ---------- */
export const listReceipts = receipts.list;
export const getReceipt = receipts.get;
export const createReceipt = (input: GoodsReceiptInput) => receipts.create(input);
export const voidReceipt = (id: string, reason: string) => receipts.act(id, 'void', { reason });

/* ---------- Bill ---------- */
export const listBills = bills.list;
export const getBill = bills.get;
export const createBill = (input: PurchaseBillInput) => bills.create(input);
export const verifyBill = (id: string, acknowledgeVariance: boolean) =>
  bills.act(id, 'verify', { acknowledgeVariance });
export const voidBill = (id: string, reason: string) => bills.act(id, 'void', { reason });
export const applyCredit = (billId: string, input: CreditApplicationInput) =>
  http.post<unknown>(PURCHASE_API.billCreditApplications(billId), input);
export const voidCreditApplication = (billId: string, applicationId: string, reason: string) =>
  http.post<unknown>(PURCHASE_API.billCreditApplicationVoid(billId, applicationId), { reason });
export const getVendorCredits = async (vendor: string): Promise<VendorCredits> =>
  toVendorCredits(
    (await http.get<ApiEnvelope<VendorCreditsDto>>(PURCHASE_API.vendorCredits, { vendor })).data
  );
export const getPayablesAging = async (params: {
  asOf?: string;
  vendor?: string;
}): Promise<PayablesAging> =>
  toPayablesAging(
    (await http.get<ApiEnvelope<PayablesAgingDto>>(PURCHASE_API.payablesBySupplier, params)).data
  );

/* ---------- Payment voucher ---------- */
export const listPayments = payments.list;
export const getPayment = payments.get;
export const createPayment = (input: PaymentVoucherInput) => payments.create(input);
export const submitPayment = (id: string) => payments.act(id, 'submit');
export const approvePayment = (id: string, note?: string) =>
  payments.act(id, 'approve', note ? { note } : undefined);
export const rejectPayment = (id: string, reason: string) => payments.act(id, 'reject', { reason });
export const payVoucher = (id: string) => payments.act(id, 'pay');
export const voidPayment = (id: string, reason: string) => payments.act(id, 'void', { reason });

/* ---------- Return ---------- */
export const listReturns = returns.list;
export const getReturn = returns.get;
export const createReturn = (input: PurchaseReturnInput) => returns.create(input);
export const postReturn = (id: string) => returns.act(id, 'post');
export const voidReturn = (id: string, reason: string) => returns.act(id, 'void', { reason });

/* ---------- Files ---------- */
export type AttachmentTarget = 'request' | 'order' | 'receipt' | 'bill' | 'payment' | 'return';

const ATTACHMENT_URL: Record<AttachmentTarget, (id: string) => string> = {
  request: PURCHASE_API.requestAttachments,
  order: PURCHASE_API.orderAttachments,
  receipt: PURCHASE_API.receiptAttachments,
  bill: PURCHASE_API.billAttachments,
  payment: PURCHASE_API.paymentAttachments,
  return: PURCHASE_API.returnAttachments,
};

/** The backend takes up to 5 files of 5 MB each, in the multipart field `attachments`. */
export const uploadAttachments = async (target: AttachmentTarget, id: string, files: File[]) => {
  const form = new FormData();
  files.forEach((file) => form.append('attachments', file));
  await http.upload<unknown>(ATTACHMENT_URL[target](id), form);
};

export const downloadOrderPdf = (id: string) => http.blob(PURCHASE_API.orderPrint(id));
export const downloadPaymentPdf = (id: string) => http.blob(PURCHASE_API.paymentPrint(id));
export const downloadPayablesExcel = (params: { asOf?: string; vendor?: string }) =>
  http.blob(PURCHASE_API.payablesExport, params);
