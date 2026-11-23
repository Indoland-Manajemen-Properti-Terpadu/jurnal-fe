import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { fetchCategories } from '@/module/products';
import { describeApiError } from '@/lib/http/apiError';
import { TRANSFER_MENU } from '@/module/inventory/domain/stockTransfer';
import {
  fetchMenuRights,
  NO_RIGHTS,
  type MenuRights,
} from '@/module/inventory/infrastructure/inventoryRightsApi';
import {
  fetchBalances,
  fetchMovements,
  fetchProductStock,
  fetchStockCard,
  type BalanceParams,
  type CardParams,
  type MovementParams,
} from '@/module/inventory/infrastructure/stockApi';
import {
  getTransfer,
  listTransfers,
  type TransferListParams,
} from '@/module/inventory/infrastructure/transferApi';
import {
  inventoryKeys,
  useInventoryScope,
} from '@/module/inventory/presentation/hooks/inventoryKeys';

const STABLE_MS = 60_000;

/** Menu id of the stock card, balances and movements; the service answers 403 without it. */
export const STOCK_CARD_MENU = 'JP-STOCK-CARD';

/**
 * Menu id of the money values of stock. Without it the service leaves every rupiah field out of its
 * answers and refuses the export (403), so the export button is not offered.
 */
export const STOCK_VALUE_MENU = 'JP-STOCK-VAL';

export const useBalances = (params: BalanceParams = {}, enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.balances(scope, params),
    queryFn: () => fetchBalances(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useMovements = (params: MovementParams = {}, enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.movements(scope, params),
    queryFn: () => fetchMovements(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

/** The product categories of the site, for the category filter of balances and history. */
export const useCategoryOptions = () => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.categories(scope),
    queryFn: () => fetchCategories(1, 100),
    staleTime: STABLE_MS,
  });
};

/** One product's stock in every warehouse, for the product detail page. */
export const useProductStock = (productId: string | undefined, enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.productStock(scope, productId ?? ''),
    queryFn: () => fetchProductStock(productId ?? ''),
    enabled: enabled && Boolean(productId),
    staleTime: STABLE_MS,
  });
};

export const useStockCard = (params: CardParams) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.card(scope, params),
    queryFn: () => fetchStockCard(params),
    enabled: Boolean(params.product),
    placeholderData: keepPreviousData,
  });
};

export const useTransfers = (params: TransferListParams = {}, enabled = true) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.transfers(scope, params),
    queryFn: () => listTransfers(params),
    placeholderData: keepPreviousData,
    enabled,
  });
};

export const useTransfer = (id: string | undefined) => {
  const scope = useInventoryScope();
  return useQuery({
    queryKey: inventoryKeys.transfer(scope, id ?? ''),
    queryFn: () => getTransfer(id ?? ''),
    enabled: Boolean(id),
  });
};

const useMenuRights = (menu: string): MenuRights => {
  const scope = useInventoryScope();
  const { data } = useQuery({
    queryKey: inventoryKeys.rights(scope, menu),
    queryFn: () => fetchMenuRights(menu),
    staleTime: STABLE_MS,
  });
  return data ?? NO_RIGHTS;
};

/** What the signed-in person may do with stock figures and with transfers; nothing until known. */
export const useStockRights = (): {
  card: MenuRights;
  transfer: MenuRights;
  value: MenuRights;
} => ({
  card: useMenuRights(STOCK_CARD_MENU),
  transfer: useMenuRights(TRANSFER_MENU),
  value: useMenuRights(STOCK_VALUE_MENU),
});

/** A safe sentence for a failed stock call (the server's Indonesian refusal for Indonesian readers). */
export const useStockErrorMessage = () => {
  const { t, currentLanguage } = useTranslation('stockMovements');
  return (error: unknown) =>
    describeApiError(error, currentLanguage, {
      rejected: t('errors.rejected'),
      forbidden: t('errors.forbidden'),
      validation: t('errors.validation'),
      unauthorized: t('errors.unauthorized'),
      notFound: t('errors.notFound'),
      network: t('errors.network'),
      generic: t('errors.generic'),
    });
};
