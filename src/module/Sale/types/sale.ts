export type SaleStatus =
  | 'DRAFT'
  | 'UNPAID'
  | 'OPEN'
  | 'PARTIAL'
  | 'PARTIALLY_PAID'
  | 'PAID'
  | 'VOID'
  | 'OVERDUE';

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
  quantity: number;
  unitPrice: number;
  tax?: {
    id: string;
    name: string;
    rate: number;
  } | null;
  taxAmount?: number;
  amount: number;
  journalTransaction?: string | null;
  journalId?: string | null;
  transactionId?: string | null;
  salesAccount?: string | null;
  accountReceivable?: string | null;
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
  startDate?: string;
  endDate?: string;
  customerId?: string;
};

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

export type SalePaymentMethod = {
  id: string;
  name: string;
  adminFee?: number;
  external_id?: string;
  isDefault?: boolean;
  defaultAccount?: any;
  feeAccount?: any;
};

export type CreateSalePaymentPayload = {
  sale: string;
  depositAccount: string;
  paymentMethod: string;
  paymentDate: string;
  tags?: string[];
  memo?: string | null;
  amount: number | string;
};

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

