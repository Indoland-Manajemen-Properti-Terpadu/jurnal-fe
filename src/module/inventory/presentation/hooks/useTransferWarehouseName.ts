import { useTranslation } from '@/i18n';
import type { TransferWarehouse } from '@/module/inventory/domain/stockTransfer';

/** How a transfer names a warehouse: its name, "(dihapus)" after it when deleted, or a note when it is gone. */
export const useTransferWarehouseName = () => {
  const { t } = useTranslation('stockMovements');
  return (warehouse: TransferWarehouse): string => {
    if (!warehouse.name) return t('warehouseMissing');
    return warehouse.deleted ? t('warehouseDeleted', { name: warehouse.name }) : warehouse.name;
  };
};
