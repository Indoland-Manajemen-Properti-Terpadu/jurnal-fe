import type {
  Paginated,
  Product,
  ProductCategory,
  ProductUnit,
  Tax,
} from '@/module/products/domain/product';
import type { PaginatedDto, ProductCategoryDto, ProductDto, TaxDto, UnitDto } from './productDto';

export const mapCategory = (dto: ProductCategoryDto): ProductCategory => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  categoryCode: dto.categoryCode,
  isActive: dto.isActive,
  createdAt: dto.createdAt,
});

export const mapUnit = (dto: UnitDto): ProductUnit => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  createdAt: dto.createdAt,
});

export const mapTax = (dto: TaxDto): Tax => ({ id: dto.id, name: dto.name, rate: dto.rate });

const extractId = (val: unknown): string | null => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  if (typeof val === 'object' && 'id' in val) return String((val as { id: unknown }).id);
  if (typeof val === 'object' && '_id' in val) return String((val as { _id: unknown })._id);
  return null;
};

export const mapProduct = (dto: ProductDto): Product => {
  const categoryRaw = dto.productCategory || dto.category;
  return {
    id: dto.id || dto._id || '',
    name: dto.name || '',
    sku: dto.sku || dto.SKU || '',
    image: dto.image ?? null,
    externalCode: dto.external_code ?? dto.externalCode ?? null,
    category: categoryRaw
      ? {
          id: categoryRaw.id || categoryRaw._id || '',
          name: categoryRaw.name || '',
        }
      : null,
    buyingInfo: {
      isPurchased: dto.buyingInfo?.isPurchased ?? false,
      unitPrice: dto.buyingInfo?.unitPrice ?? null,
      purchaseAccount: extractId(dto.buyingInfo?.purchaseAccount),
      purchaseTax: extractId(dto.buyingInfo?.purchaseTax),
    },
    sellingInfo: {
      isSold: dto.sellingInfo?.isSold ?? false,
      unitPrice: dto.sellingInfo?.unitPrice ?? null,
      salesAccount: extractId(dto.sellingInfo?.salesAccount),
      accountReceivable: extractId(dto.sellingInfo?.accountReceivable),
      salesTax: extractId(dto.sellingInfo?.salesTax),
    },
    inventoryInfo: {
      isTracked: dto.inventoryInfo?.isTracked ?? false,
      inventoryAccount: extractId(dto.inventoryInfo?.inventoryAccount),
      minStock: dto.inventoryInfo?.minStock ?? 0,
    },
    createdAt: dto.createdAt || dto.created_at || '',
    updatedAt: dto.updatedAt || dto.updated_at || '',
  };
};

export const mapPaginated = <D, T>(dto: PaginatedDto<D>, map: (d: D) => T): Paginated<T> => ({
  items: (dto.data ?? []).map(map),
  pagination: dto.pagination,
});
