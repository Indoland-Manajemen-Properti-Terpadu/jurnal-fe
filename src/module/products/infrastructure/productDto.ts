import type {
  BuyingInfo,
  InventoryInfo,
  Pagination,
  SellingInfo,
} from '@/module/products/domain/product';

export type ApiEnvelope<T> = { code: number; message: string; data: T };
export type PaginatedDto<T> = { data: T[]; pagination: Pagination };

export type ProductCategoryDto = {
  id: string;
  name: string;
  description: string | null;
  categoryCode: string;
  isActive: boolean;
  createdAt: string;
};

/** Category as embedded in a product; older payloads use `_id` and may omit the name. */
export type EmbeddedCategoryDto = { id?: string; _id?: string; name?: string };

/** The API returns ids or embedded objects for account and tax references. */
export type ReferenceDto = string | { id?: string; _id?: string } | null | undefined;

export type ProductDto = {
  id?: string;
  _id?: string;
  name?: string;
  sku?: string;
  SKU?: string;
  image?: string | null;
  external_code?: string | null;
  externalCode?: string | null;
  productCategory?: EmbeddedCategoryDto | null;
  category?: EmbeddedCategoryDto | null;
  buyingInfo?: Partial<Omit<BuyingInfo, 'purchaseAccount' | 'purchaseTax'>> & {
    purchaseAccount?: ReferenceDto;
    purchaseTax?: ReferenceDto;
  };
  sellingInfo?: Partial<Omit<SellingInfo, 'salesAccount' | 'accountReceivable' | 'salesTax'>> & {
    salesAccount?: ReferenceDto;
    accountReceivable?: ReferenceDto;
    salesTax?: ReferenceDto;
  };
  inventoryInfo?: Partial<Omit<InventoryInfo, 'inventoryAccount'>> & {
    inventoryAccount?: ReferenceDto;
  };
  createdAt?: string;
  created_at?: string;
  updatedAt?: string;
  updated_at?: string;
};

export type UnitDto = { id: string; name: string; description: string | null; createdAt: string };
export type TaxDto = { id: string; name: string; rate: number };
