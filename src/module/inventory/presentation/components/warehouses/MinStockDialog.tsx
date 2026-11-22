import { useEffect, useState } from 'react';
import { Button, NumberInput } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { WarehouseStockItem } from '@/module/inventory/domain/warehouse';

type Props = {
  item: WarehouseStockItem | null;
  warehouseName: string;
  saving: boolean;
  onSave: (minQty: number) => void;
  onClose: () => void;
};

/** One field: the minimum a product should keep in this warehouse. Empty or 0 means not monitored. */
export function MinStockDialog({ item, warehouseName, saving, onSave, onClose }: Readonly<Props>) {
  const { t } = useTranslation('warehouses');
  const [value, setValue] = useState<number | string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValue(item ? item.minQty : '');
    setError(null);
  }, [item]);

  const save = () => {
    const minQty = value === '' ? 0 : Number(value);
    if (Number.isNaN(minQty) || minQty < 0) {
      setError(t('minStock.negative'));
      return;
    }
    setError(null);
    onSave(minQty);
  };

  return (
    <ModalFrame
      opened={item !== null}
      onClose={saving ? () => undefined : onClose}
      title={t('minStock.title', { product: item?.name ?? '' })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={saving}>
            {t('minStock.cancel')}
          </Button>
          <Button onClick={save} loading={saving}>
            {t('minStock.save')}
          </Button>
        </>
      }
    >
      <NumberInput
        label={t('minStock.field', { warehouse: warehouseName })}
        description={t('minStock.hint')}
        rightSection={item?.unit}
        rightSectionWidth={56}
        value={value}
        onChange={setValue}
        error={error}
        decimalScale={2}
        data-autofocus
      />
    </ModalFrame>
  );
}
