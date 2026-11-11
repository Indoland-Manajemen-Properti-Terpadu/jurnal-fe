export type SaleStatus =
  | 'DRAFT'
  | 'SENT'
  | 'UNPAID'
  | 'OPEN'
  | 'PARTIAL'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'VOID'
  | 'OVERDUE';

export type SaleDisplayCode = 'DRAFT' | 'UNPAID' | 'PAID' | 'OVERDUE' | 'VOID';

/** What the badge shows: the backend's own label for the payment state. */
export type SaleDisplayStatus = { code: SaleDisplayCode; label: string };

export type DiscountType = 'percentage' | 'nominal';
export type WithholdingType = 'percentage' | 'nominal';

export type SaleCustomer = {
  id: string;
  displayName: string;
  fullName?: {
    prefix?: string | null;
    firstName?: string | null;
    middleName?: string | null;
    lastName?: string | null;
  } | null;
  contactNumber?: string;
  emails?: string[];
  phones?: {
    mobile?: string | null;
    telephone?: string | null;
  } | null;
  billingAddress?: string | null;
  identity?: {
    type?: string | null;
    number?: string | null;
  } | null;
};

export type SaleTag = {
  id: string;
  name: string;
};

export type SalePaymentTerm = {
  id: string;
  name: string;
  days?: number;
  isDefault?: boolean;
};

export type SaleItem = {
  id?: string;
  product?: {
    id: string;
    name: string;
    productCode?: string;
  } | null;
  description?: string;
  unit?: string | null;
  quantity: number;
  unitPrice: number;
  tax?: {
    id: string;
    name: string;
    rate: number;
  } | null;
  taxAmount?: number;
  amount: number;
  adjustedAmount?: number;
  paidAmount?: number;
  /** What is still owed on this line; the payment form never lets an allocation pass it. */
  outstandingAmount?: number;
  journalTransaction?: string | null;
  journalId?: string | null;
  transactionId?: string | null;
  salesAccount?: string | null;
  accountReceivable?: string | null;
  _id?: string;
};

export type SaleAttachment = {
  id: string;
  fileName?: string;
  filePath?: string;
  mimeType?: string;
  createdAt?: string;
};

export type SaleWithholdingAccount = {
  id: string;
  name: string;
  accountNumber?: string;
};

export type Sale = {
  id: string;
  site?: string;
  transactionNumber: string;
  customer: SaleCustomer | null;
  emails: string[];
  billingAddress?: string | null;
  transactionDate: string | null;
  dueDate: string | null;
  tags: SaleTag[];
  customerRefNumber?: string | null;
  paymentTerm: SalePaymentTerm | null;
  isPriceIncludeTax: boolean;
  items: SaleItem[];
  subtotal: number;
  discountType?: DiscountType | null;
  discountValue?: number;
  discountAmount?: number;
  taxAmount?: number;
  total: number;
  adjustedAmount?: number;
  lateFeeAmount?: number;
  lateFeePaidAmount?: number;
  /** Late fee still owed; a payment may allocate at most this much to the fee. */
  outstandingLateFee: number;
  withholdingType?: WithholdingType | null;
  withholdingValue?: number;
  withholdingAmount?: number;
  withholdingAccount?: SaleWithholdingAccount | null;
  finalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  attachments: SaleAttachment[];
  message?: string | null;
  memo?: string | null;
  status: SaleStatus;
  displayStatus: SaleDisplayStatus;
  /** Server decisions: the screens never recompute who may edit or delete. */
  canEdit: boolean;
  canDelete: boolean;
  /** True for an invoice that ProApps created through its own API. */
  createdByApi: boolean;
  invoiceLink?: string | null;
  journalId?: string | null;
  transactionId?: string | null;
  deleted: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type SaleListParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  /** One or several payment states; several are sent as a comma list. */
  paymentStatus?: SaleDisplayCode | SaleDisplayCode[];
  excludeDraft?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  startDate?: string;
  endDate?: string;
  customerId?: string;
};

export type ReceivablesSummary = {
  overdue: { amount: number; count: number; oldestDueDate: string | null };
  notDue: { amount: number; count: number };
  total: { amount: number; count: number };
  /** Final amount of every sent invoice, paid ones included. */
  billed: number;
  received: number;
};

export type SaleStatusCounts = Record<SaleDisplayCode | 'sent' | 'all', number>;

export type SendSaleResult = { sale: Sale; emailSent: boolean; emailError: string };

export type Pagination = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type Paginated<T> = {
  items: T[];
  pagination: Pagination;
};

/* Form Data DTO for Create Sale */
export type CreateSaleItemForm = {
  productId: string;
  description: string;
  /** Unit of the chosen product; shown, never typed. */
  unit: string;
  quantity: number;
  unitPrice: number;
  taxId?: string;
};

export type CreateSaleFormValues = {
  customer: string;
  emails: string[];
  transactionDate: string;
  dueDate: string;
  billingAddress: string;
  transactionNumber: string;
  tags: string[];
  customerRefNumber: string;
  paymentTerm: string;
  isPriceIncludeTax: boolean;
  items: CreateSaleItemForm[];
  discountType: DiscountType;
  discountValue: number;
  withholdingType: WithholdingType;
  withholdingValue: number;
  withholdingAccount: string;
  message: string;
  memo: string;
  attachments?: File[];
};

export type SaleAccountRef = string | { id?: string; name?: string } | null;

export type SalePaymentMethod = {
  id: string;
  name: string;
  adminFee?: number;
  external_id?: string;
  isDefault?: boolean;
  defaultAccount?: SaleAccountRef;
  feeAccount?: SaleAccountRef;
};

export type SalePaymentAllocationItem = { saleItem: string; amount: number };

export type CreateSalePaymentPayload = {
  sale: string;
  depositAccount: string;
  paymentMethod: string;
  paymentDate: string;
  tags?: string[];
  memo?: string | null;
  amount: number | string;
  attachments?: File[];
  /** Partial payment, manual: one entry per invoice line, `saleItem` being the line's id. */
  items?: SalePaymentAllocationItem[];
  lateFeeAmount?: number;
  /** Partial payment, automatic: the server spreads the amount in its own priority order. */
  autoAllocate?: boolean;
};

/** What the server booked for a payment just recorded. */
export type SalePaymentResult = {
  /** Part of the amount above the invoice; 0 when it matched or fell short. */
  overpaymentAmount: number;
  items: Array<{ saleItem: string | null; productName: string | null; amount: number }>;
  lateFeeAmount: number;
};

export type OverpaymentAccount = { name: string; accountNumber?: string } | null;

export type SalePaymentDetail = {
  id: string;
  site?: string;
  sale?: {
    id: string;
    externalId?: string;
    transactionNumber?: string;
    customer?: SaleCustomer;
  };
  depositAccount?: {
    id: string;
    name: string;
    accountNumber?: string;
    type?: string;
  };
  paymentMethod?: {
    id: string;
    name: string;
    adminFee?: number;
  };
  paymentDate: string | null;
  amount: number;
  transactionNumber: string;
  memo?: string | null;
  createdAt: string | null;
};
