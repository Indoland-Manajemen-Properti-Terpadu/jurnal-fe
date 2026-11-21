import type {
  Attachment,
  DocumentBase,
  NamedRef,
  ProductRef,
  UserInfo,
} from '@/module/purchases/domain/purchaseCommon';

export type PurchaseRequestStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'VERIFIED'
  | 'RETURNED'
  | 'IN_PROCUREMENT'
  | 'COMPLETED'
  | 'CANCELLED';

export type RequestItemKind = 'GOODS' | 'SERVICE';

export type ProcurementRoute = 'BIDDING' | 'SINGLE';

export interface RequestItem {
  id: string;
  kind: RequestItemKind;
  product: ProductRef | null;
  description: string;
  specification: string;
  quantity: number;
  unit: NamedRef | null;
}

/** An FPPBJ: the requester's purchase request, verified by Accounting before procurement. */
export interface PurchaseRequest extends DocumentBase {
  status: PurchaseRequestStatus;
  /** The server's Indonesian label of the status; screens show it as the status text. */
  statusLabel: string;
  requiredDate: string | null;
  department: NamedRef | null;
  purpose: string;
  iom: { number: string; date: string | null; attachments: Attachment[] };
  requester: UserInfo | null;
  verifiedBy: UserInfo | null;
  returnedBy: UserInfo | null;
  /** Why Accounting sent it back; kept after the requester resubmits. */
  returnNote: string;
  cancelReason: string;
  items: RequestItem[];
  /** The signed-in user created this request. */
  isOwner: boolean;
  /** Chosen at procurement; null until then. */
  route: ProcurementRoute | null;
}
