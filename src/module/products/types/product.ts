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

export type ProductCategory = {
  id: string;
  name: string;
  description: string | null;
  categoryCode: string;
  isActive: boolean;
  createdAt: string;
};

export type ProductUnit = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
};

export type Tax = {
  id: string;
  name: string;
  rate: number;
};

export type AccountOption = {
  id: string;
  label: string;
};

export type BuyingInfo = {
  isPurchased: boolean;
  unitPrice: number | null;
  purchaseAccount: string | null;
  purchaseTax: string | null;
};

export type SellingInfo = {
  isSold: boolean;
  unitPrice: number | null;
  salesAccount: string | null;
  salesTax: string | null;
};

export type InventoryInfo = {
  isTracked: boolean;
  inventoryAccount: string | null;
  minStock: number;
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  image: string | null;
  externalCode: string | null;
  category: Pick<ProductCategory, 'id' | 'name'> | null;
  buyingInfo: BuyingInfo;
  sellingInfo: SellingInfo;
  inventoryInfo: InventoryInfo;
  createdAt: string;
  updatedAt: string;
};

export type ProductListParams = {
  page: number;
  limit: number;
  search?: string;
};

export type ProductFormValues = {
  name: string;
  sku: string;
  productCategory: string | null;
  image: File | null;
  buyingInfo: BuyingInfo;
  sellingInfo: SellingInfo;
  inventoryInfo: InventoryInfo;
};

export type MasterDataInput = {
  name: string;
  description: string | null;
};
