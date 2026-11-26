export interface ReorderLineInput {
  sourceItemId: string;
  quantity: number;
  unitPrice: number;
}

export interface ReorderInput {
  items: ReorderLineInput[];
  note?: string;
}

export interface ReorderSource {
  id: string;
  number: string;
  date: string;
  vendorName: string;
  itemNames: string[];
  total: number;
  canReorder: boolean;
  reorderBlockReason: string | null;
}

export interface ReorderPreview {
  sourceTotal: number;
  total: number;
  precision: number;
  priceIncreased: boolean;
  totalIncreased: boolean;
  requiresReason: boolean;
  activeReorders: { id: string; number: string }[];
  approvalPlan: { name: string; mode: 'ANY' | 'ALL'; roles: { role: string; name: string }[] }[];
  approvalConfigurationError: string | null;
  items: { sourceItemId: string; previousUnitPrice: number; unitPrice: number; amount: number }[];
}
