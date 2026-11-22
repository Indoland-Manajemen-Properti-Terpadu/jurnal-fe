import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
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
export const useStockRights = (): { card: MenuRights; transfer: MenuRights } => ({
  card: useMenuRights(STOCK_CARD_MENU),
  transfer: useMenuRights(TRANSFER_MENU),
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
