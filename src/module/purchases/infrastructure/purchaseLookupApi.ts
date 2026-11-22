import type {
  NamedRef,
  PartyRef,
  PaymentMethodRef,
  PaymentTermOption,
  ProductRef,
  TaxRef,
} from '@/module/purchases/domain/purchaseCommon';
import type { PurchaseAccessProfile } from '@/module/purchases/domain/purchaseAccess';
import { PURCHASE_API } from '@/module/purchases/infrastructure/purchaseEndpoints';
import type {
  ApiEnvelope,
  ContactListDto,
  ListDto,
  MyPermissionsDto,
  PartyDto,
  PaymentMethodDto,
  ProductDto,
  TaxDto,
} from '@/module/purchases/infrastructure/purchaseDto';
import { http } from '@/module/purchases/infrastructure/purchaseHttp';
import {
  toParty,
  toPaymentMethod,
  toProduct,
  toTax,
} from '@/module/purchases/infrastructure/purchaseMappers';

const PICKER_LIMIT = 50;

/** Suppliers matching a search; the picker queries as the user types. */
export const searchSuppliers = async (search?: string): Promise<PartyRef[]> => {
  const { data } = await http.get<ApiEnvelope<ContactListDto<PartyDto>>>(PURCHASE_API.contacts, {
    contactType: 'Supplier',
    search,
    limit: PICKER_LIMIT,
    page: 1,
  });
  return data.data.map(toParty);
};

type PurchasableProductDto = ProductDto & { buyingInfo?: { isPurchased?: boolean } };

/** Products flagged as purchasable. */
export const searchPurchasableProducts = async (search?: string): Promise<ProductRef[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: PurchasableProductDto[] }>>(
    PURCHASE_API.products,
    { search, limit: 100, page: 1 }
  );
  return data.data
    .filter((product) => product.buyingInfo?.isPurchased)
    .map((product) => toProduct(product))
    .filter((product): product is ProductRef => product !== null);
};

export const listTaxes = async (): Promise<TaxRef[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: TaxDto[] }>>(PURCHASE_API.taxes);
  return data.data.map((tax) => toTax(tax) as TaxRef);
};

export const listPaymentMethods = async (): Promise<PaymentMethodRef[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: PaymentMethodDto[] }>>(
    PURCHASE_API.paymentMethods
  );
  return data.data.map((method) => toPaymentMethod(method) as PaymentMethodRef);
};

interface PaymentTermDto {
  id: string;
  name: string;
  days?: number | null;
  advanceType?: PaymentTermOption['advanceType'] | null;
  billingSplit?: PaymentTermOption['billingSplit'] | null;
  hasDueTerm?: boolean | null;
  hasRetention?: boolean | null;
  defaultAdvancePercent?: number | null;
  defaultInstallments?: number | null;
  defaultPeriods?: number | null;
  defaultDueDays?: number | null;
  defaultRetentionPercent?: number | null;
  defaultMaintenanceMonths?: number | null;
  summary?: { paymentLabel?: string; billingLabel?: string; dueLabel?: string } | null;
  isActive?: boolean | null;
}

/** Active payment terms for the quote and the bill (the service allows 100 per page). */
export const listPaymentTerms = async (): Promise<PaymentTermOption[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: PaymentTermDto[] }>>(
    PURCHASE_API.paymentTerms,
    { isActive: true, limit: 100 }
  );
  return data.data.map((term) => ({
    id: term.id,
    name: term.name,
    days: term.days ?? 0,
    advanceType: term.advanceType ?? 'none',
    billingSplit: term.billingSplit ?? 'single',
    hasDueTerm: Boolean(term.hasDueTerm),
    hasRetention: Boolean(term.hasRetention),
    defaultAdvancePercent: term.defaultAdvancePercent ?? null,
    defaultInstallments: term.defaultInstallments ?? null,
    defaultPeriods: term.defaultPeriods ?? null,
    defaultDueDays: term.defaultDueDays ?? null,
    defaultRetentionPercent: term.defaultRetentionPercent ?? null,
    defaultMaintenanceMonths: term.defaultMaintenanceMonths ?? null,
    paymentLabel: term.summary?.paymentLabel ?? '',
    billingLabel: term.summary?.billingLabel ?? '',
    dueLabel: term.summary?.dueLabel ?? '',
    isActive: term.isActive !== false,
  }));
};

export const getAccessProfile = async (): Promise<PurchaseAccessProfile> => {
  const body = await http.get<MyPermissionsDto>(PURCHASE_API.myPermissions);
  const rights: PurchaseAccessProfile['rights'] = {};
  body.permissions.forEach((item) => {
    rights[item.menuId] = {
      create: Boolean(item.create),
      read: Boolean(item.read),
      update: Boolean(item.update),
      delete: Boolean(item.delete),
    };
  });
  return { isSuperAdmin: body.role === 'superadmin', rights };
};

interface NamedDto {
  id: string;
  name: string;
}

/** Active departments of the site, for the department choice of a request. */
export const listDepartments = async (): Promise<NamedRef[]> => {
  const { data } = await http.get<ApiEnvelope<ListDto<NamedDto>>>(PURCHASE_API.departments, {
    isActive: true,
    limit: 200,
  });
  return data.results.map(({ id, name }) => ({ id, name }));
};

/** Units of measure, for the lines of a request. The service allows at most 100 per page. */
export const listUnits = async (): Promise<NamedRef[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: NamedDto[] }>>(PURCHASE_API.units, {
    limit: 100,
  });
  return data.data.map(({ id, name }) => ({ id, name }));
};

/** Active warehouses, for the delivery warehouse of an order (the service allows 100 per page). */
export const listWarehouses = async (): Promise<NamedRef[]> => {
  const { data } = await http.get<ApiEnvelope<ListDto<NamedDto>>>(PURCHASE_API.warehouses, {
    isActive: true,
    limit: 100,
  });
  return data.results.map(({ id, name }) => ({ id, name }));
};

/** Transaction tags a bill can carry (the service allows 100 per page). */
export const listTags = async (): Promise<NamedRef[]> => {
  const { data } = await http.get<ApiEnvelope<{ data: NamedDto[] }>>(PURCHASE_API.tags, {
    limit: 100,
  });
  return data.data.map(({ id, name }) => ({ id, name }));
};
