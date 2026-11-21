import type {
  NamedRef,
  PartyRef,
  PaymentMethodRef,
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

export const listPaymentTerms = async (): Promise<{ id: string; name: string; days: number }[]> => {
  const { data } = await http.get<
    ApiEnvelope<{ data: { id: string; name: string; days: number }[] }>
  >(PURCHASE_API.paymentTerms);
  return data.data;
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
