import { Anchor, Group, Progress, Text } from '@mantine/core';
import { IconClipboardCheck } from '@tabler/icons-react';
import { generatePath, Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { warehouseName, type StockOpname } from '@/module/inventory/domain/stockOpname';
import { InfoGrid } from '@/module/inventory/presentation/components/shared/InfoGrid';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import { routes } from '@/router/routes';
import { dateFormatV1 } from '@/utils/formatDate';

/** Warehouse, date, scope, people and progress of one count, as bordered cells. */
export function OpnameInfoCard({ opname }: Readonly<{ opname: StockOpname }>) {
  const { t } = useTranslation('stockTake');
  const { scope, summary } = opname;
  const scopeText =
    scope.type === 'manual'
      ? t('detail.scopeManual', { count: scope.productIds.length })
      : scope.type === 'category'
        ? t('detail.scopeCategory', { count: scope.categoryIds.length })
        : t('detail.scopeAll');
  const total = summary.total || opname.lines.length;
  const counted = summary.total
    ? summary.counted
    : opname.lines.filter((line) => line.countedQty !== null).length;
  const percent = total === 0 ? 0 : Math.round((counted / total) * 100);

  return (
    <SectionCard
      icon={IconClipboardCheck}
      title={t('detail.infoTitle')}
      subtitle={t('detail.infoSubtitle')}
      flush
      fill
    >
      <InfoGrid
        columns={3}
        items={[
          {
            label: t('detail.warehouse'),
            value: opname.warehouse.id ? (
              <Anchor
                component={Link}
                to={generatePath(routes.inventory.warehouseDetail, { id: opname.warehouse.id })}
                fw={700}
              >
                {opname.warehouse.name}
              </Anchor>
            ) : (
              warehouseName(opname.warehouse, t('warehouseMissing'))
            ),
            sub: opname.warehouse.code,
          },
          { label: t('detail.date'), value: dateFormatV1(opname.date, 'D MMM YYYY') },
          { label: t('detail.scope'), value: scopeText },
          {
            label: t('detail.counter'),
            value: opname.counterName ?? t('detail.noCounter'),
            muted: !opname.counterName,
          },
          {
            label: t('detail.createdBy'),
            value: opname.createdByName,
            sub: opname.createdAt ? dateFormatV1(opname.createdAt, 'D MMM YYYY, HH:mm') : undefined,
          },
          {
            label: t('detail.productsCounted'),
            value: (
              <Group gap="sm" wrap="nowrap">
                <Text fw={700}>{t('detail.countedOf', { counted, total })}</Text>
                <Progress
                  value={percent}
                  size="sm"
                  radius="xl"
                  style={{ flex: 1, minWidth: 60 }}
                  color={percent === 100 ? 'green' : 'primary'}
                  aria-label={t('detail.progress')}
                />
              </Group>
            ),
          },
          ...(opname.notes ? [{ label: t('detail.notes'), value: opname.notes, full: true }] : []),
        ]}
      />
    </SectionCard>
  );
}
