import type { Page } from '@/module/purchases/domain/purchaseCommon';
import type {
  GoodsReceipt,
  PayablesAging,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseReturn,
  VendorCredits,
} from '@/module/purchases/domain/purchaseDocuments';
import type { PayInput, PaymentVoucherInput } from '@/module/purchases/domain/paymentForm';
import type {
  PaymentRequest,
  PaymentRequestInput,
  PaymentRequestUpdate,
} from '@/module/purchases/domain/paymentRequest';
import type { BillSourceDoc } from '@/module/purchases/domain/billSources';
import type { ProcurementInput } from '@/module/purchases/domain/procurement';
import type { PurchaseRequest } from '@/module/purchases/domain/purchaseRequest';
import type {
  CreditApplicationInput,
  BillUpdateInput,
  GoodsReceiptInput,
  OrderDraftInput,
  PurchaseBillInput,
  PurchaseRequestInput,
  PurchaseReturnInput,
  SendOrderInput,
} from '@/module/purchases/domain/purchaseInputs';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type {
  ApiEnvelope,
  BillSourceDto,
  GoodsReceiptDto,
  ListDto,
  PayablesAgingDto,
  PaymentRequestDto,
  PaymentVoucherDto,
  PurchaseBillDto,
  PurchaseOrderDto,
  PurchaseReturnDto,
  VendorCreditsDto,
} from '@/module/purchases/infrastructure/purchaseDto';
import {
  toBillSource,
  toGoodsReceipt,
  toPayablesAging,
  toPaymentRequest,
  toPaymentVoucher,
  toPurchaseBill,
  toPurchaseOrder,
  toPurchaseReturn,
  toVendorCredits,
} from '@/module/purchases/infrastructure/purchaseDocumentMappers';
import type { PurchaseRequestDto } from '@/module/purchases/infrastructure/requestDto';
import { toPurchaseRequest } from '@/module/purchases/infrastructure/requestMappers';
import { http, type QueryValue } from '@/module/purchases/infrastructure/purchaseHttp';
import { toPage } from '@/module/purchases/infrastructure/purchaseMappers';

export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  /** One status, or several (`status[]=A&status[]=B`). */
  status?: string | string[];
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
const paymentRequests = resource<PaymentRequestDto, PaymentRequest>(
  {
    list: PURCHASE_API.paymentRequests,
    one: PURCHASE_API.paymentRequest,
    action: PURCHASE_API.paymentRequestAction,
  },
  toPaymentRequest
);
const returns = resource<PurchaseReturnDto, PurchaseReturn>(
  { list: PURCHASE_API.returns, one: PURCHASE_API.return, action: PURCHASE_API.returnAction },
  toPurchaseReturn
);

/* ---------- Purchase request (FPPBJ) ---------- */
export interface RequestListParams extends ListParams {
  mine?: boolean;
  department?: string;
}

export const listRequests = (params: RequestListParams = {}) => requests.list(params);
export const getRequest = requests.get;
export const createRequest = (input: PurchaseRequestInput) => requests.create(input);
export const updateRequest = (id: string, input: PurchaseRequestInput) =>
  requests.update(id, input);
export const submitRequest = (id: string) => requests.act(id, 'submit');
export const verifyRequest = (id: string, note?: string) =>
  requests.act(id, 'verify', note ? { note } : undefined);
export const returnRequest = (id: string, note: string) => requests.act(id, 'return', { note });
export const cancelRequest = (id: string, reason: string) => requests.act(id, 'cancel', { reason });

/* ---------- Procurement (a part of the FPPBJ) ---------- */
const procurementCall = async (call: Promise<ApiEnvelope<PurchaseRequestDto>>) =>
  toPurchaseRequest((await call).data);

export const saveProcurement = (id: string, input: ProcurementInput) =>
  procurementCall(
    http.put<ApiEnvelope<PurchaseRequestDto>>(PURCHASE_API.requestProcurement(id), input)
  );
export const submitProcurement = (id: string) =>
  procurementCall(
    http.post<ApiEnvelope<PurchaseRequestDto>>(PURCHASE_API.requestProcurementAction(id, 'submit'))
  );
export const approveProcurement = (id: string, note?: string) =>
  procurementCall(
    http.post<ApiEnvelope<PurchaseRequestDto>>(
      PURCHASE_API.requestProcurementAction(id, 'approve'),
      note ? { note } : undefined
    )
  );
export const rejectProcurement = (id: string, reason: string) =>
  procurementCall(
    http.post<ApiEnvelope<PurchaseRequestDto>>(
      PURCHASE_API.requestProcurementAction(id, 'reject'),
      { reason }
    )
  );
/** Backup for an approved procurement that has no order: creates the draft PO / SPK. */
export const createOrdersFromProcurement = (id: string) =>
  procurementCall(
    http.post<ApiEnvelope<PurchaseRequestDto>>(PURCHASE_API.requestProcurementAction(id, 'orders'))
  );

/* ---------- Purchase order (PO / SPK) ---------- */
export const listOrders = (params: ListParams = {}) => orders.list(params);
export const getOrder = orders.get;
/** Only the draft fields change; the prices follow the procurement. */
export const updateOrder = (id: string, input: OrderDraftInput) => orders.update(id, input);
export const sendOrder = (id: string, input: SendOrderInput) => orders.act(id, 'send', input);
export const closeOrder = (id: string, note: string) => orders.act(id, 'close', { note });
export const voidOrder = (id: string, reason: string) => orders.act(id, 'void', { reason });

/* ---------- Goods and service receipt (FPB / BAPP) ---------- */
export interface ReceiptListParams extends ListParams {
  kind?: 'GOODS' | 'SERVICE';
  billable?: boolean;
  purchaseOrder?: string;
}

export const listReceipts = (params: ReceiptListParams = {}) => receipts.list(params);
export const getReceipt = receipts.get;
export const createReceipt = (input: GoodsReceiptInput) => receipts.create(input);
export const approveReceipt = (id: string, note?: string) =>
  receipts.act(id, 'approve', note ? { note } : undefined);
export const rejectReceipt = (id: string, reason: string) => receipts.act(id, 'reject', { reason });
export const resubmitReceipt = (id: string) => receipts.act(id, 'resubmit');
export const voidReceipt = (id: string, reason: string) => receipts.act(id, 'void', { reason });

/* ---------- Bill ---------- */
export const getBill = bills.get;
export const createBill = (input: PurchaseBillInput) => bills.create(input);
export const updateBill = (id: string, input: BillUpdateInput) => bills.update(id, input);
export interface BillListParams extends ListParams {
  displayStatus?: string | string[];
  source?: string;
}
export const listBills = (params: BillListParams = {}) => bills.list(params);
/** Receipts or orders ready to be billed, optionally of one vendor. */
export const listBillSources = async (
  source: 'RECEIPT' | 'ORDER',
  vendor?: string
): Promise<BillSourceDoc[]> =>
  (
    await http.get<ApiEnvelope<BillSourceDto[]>>(PURCHASE_API.billSources, { source, vendor })
  ).data.map(toBillSource);
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

/* ---------- Payment Request ---------- */
export interface PaymentRequestListParams extends ListParams {
  kind?: 'DP' | 'SETTLEMENT';
  /** Approved and not yet in a voucher. */
  ready?: boolean;
}

export const listPaymentRequests = (params: PaymentRequestListParams = {}) =>
  paymentRequests.list(params);
export const getPaymentRequest = paymentRequests.get;
export const createPaymentRequest = (input: PaymentRequestInput) => paymentRequests.create(input);
export const updatePaymentRequest = (id: string, input: PaymentRequestUpdate) =>
  paymentRequests.update(id, input);
export const submitPaymentRequest = (id: string) => paymentRequests.act(id, 'submit');
export const approvePaymentRequest = (id: string, note?: string) =>
  paymentRequests.act(id, 'approve', note ? { note } : undefined);
export const rejectPaymentRequest = (id: string, reason: string) =>
  paymentRequests.act(id, 'reject', { reason });
export const cancelPaymentRequest = (id: string, reason: string) =>
  paymentRequests.act(id, 'cancel', { reason });

/* ---------- Payment voucher ---------- */
export const listPayments = payments.list;
export const getPayment = payments.get;
export const createPayment = (input: PaymentVoucherInput) => payments.create(input);
export const payVoucher = (id: string, input: PayInput) => payments.act(id, 'pay', input);
export const voidPayment = (id: string, reason: string) => payments.act(id, 'void', { reason });

/* ---------- Return ---------- */
export const listReturns = returns.list;
export const getReturn = returns.get;
export const createReturn = (input: PurchaseReturnInput) => returns.create(input);
export const postReturn = (id: string) => returns.act(id, 'post');
export const voidReturn = (id: string, reason: string) => returns.act(id, 'void', { reason });

/* ---------- Files ---------- */
export type AttachmentTarget = 'request' | 'order' | 'receipt' | 'bill' | 'payment' | 'return';

/** Where on an FPPBJ the file belongs: the request itself, or its IOM memo. */
export type RequestFileTarget = 'request' | 'iom' | 'quote';

const ATTACHMENT_URL: Record<AttachmentTarget, (id: string) => string> = {
  request: PURCHASE_API.requestAttachments,
  order: PURCHASE_API.orderAttachments,
  receipt: PURCHASE_API.receiptAttachments,
  bill: PURCHASE_API.billAttachments,
  payment: PURCHASE_API.paymentAttachments,
  return: PURCHASE_API.returnAttachments,
};

/** The backend takes up to 5 files of 5 MB each, in the multipart field `attachments`. */
export const uploadAttachments = async (
  target: AttachmentTarget,
  id: string,
  files: File[],
  requestFile?: RequestFileTarget,
  quoteId?: string
) => {
  const form = new FormData();
  if (target === 'request') form.append('target', requestFile ?? 'request');
  if (quoteId) form.append('quoteId', quoteId);
  files.forEach((file) => form.append('attachments', file));
  await http.upload<unknown>(ATTACHMENT_URL[target](id), form);
};

export const downloadOrderPdf = (id: string) => http.blob(PURCHASE_API.orderPrint(id));
export const downloadPaymentPdf = (id: string) => http.blob(PURCHASE_API.paymentPrint(id));
export const downloadPayablesExcel = (params: { asOf?: string; vendor?: string }) =>
  http.blob(PURCHASE_API.payablesExport, params);
