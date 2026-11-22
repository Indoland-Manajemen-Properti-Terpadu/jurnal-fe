import { Anchor } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { Warehouse } from '@/module/inventory/domain/warehouse';
import { InfoGrid } from '@/module/inventory/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { stockTakeDetailPath } from '@/module/inventory/presentation/components/shared/stockLinks';
import { dateFormatV1 } from '@/utils/formatDate';

/** Where the warehouse is, who looks after it, and its last and running stock counts. */
export function WarehouseInfoCard({ warehouse }: Readonly<{ warehouse: Warehouse }>) {
  const { t } = useTranslation('warehouses');
  const blank = t('detail.info.blank');
  const none = t('detail.info.none');
  const cityPostal = [warehouse.city, warehouse.postalCode].filter(Boolean).join(' ');
  const { lastOpname, runningOpname } = warehouse;

  return (
    <SectionCard
      icon={IconInfoCircle}
      title={t('detail.info.title')}
      subtitle={t('detail.info.subtitle')}
      flush
    >
      <InfoGrid
        columns={3}
        items={[
          {
            label: t('detail.info.address'),
            value: warehouse.address || blank,
            muted: !warehouse.address,
          },
          { label: t('detail.info.cityPostal'), value: cityPostal || blank, muted: !cityPostal },
          {
            label: t('detail.info.pic'),
            value: warehouse.picUser?.name ?? t('table.unassigned'),
            muted: !warehouse.picUser,
          },
          {
            label: t('detail.info.phone'),
            value: warehouse.phone || blank,
            muted: !warehouse.phone,
          },
          {
            label: t('detail.info.created'),
            value: warehouse.createdBy?.name ?? blank,
            muted: !warehouse.createdBy,
            sub: warehouse.createdAt ? dateFormatV1(warehouse.createdAt, 'D MMM YYYY') : undefined,
          },
          {
            label: t('detail.info.lastOpname'),
            value: lastOpname ? (
              <Anchor component={Link} to={stockTakeDetailPath(lastOpname.id)} fw={700}>
                {lastOpname.number}
              </Anchor>
            ) : (
              none
            ),
            muted: !lastOpname,
            sub: lastOpname ? dateFormatV1(lastOpname.date, 'D MMM YYYY') : undefined,
          },
          {
            label: t('detail.info.runningOpname'),
            value: runningOpname ? (
              <Anchor component={Link} to={stockTakeDetailPath(runningOpname.id)} fw={700}>
                {runningOpname.number}
              </Anchor>
            ) : (
              none
            ),
            muted: !runningOpname,
          },
          {
            label: t('detail.info.notes'),
            value: warehouse.notes || blank,
            muted: !warehouse.notes,
          },
        ]}
      />
    </SectionCard>
  );
}
