import { Anchor, Badge, Group, Stack, Text } from '@mantine/core';
import { IconPackage } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { OrderRef } from '@/module/purchases/domain/procurement';
import { detailPath } from '@/module/purchases/presentation/components/hub/documentPaths';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

/** The PO / SPK the approved procurement created, one per winning vendor. */
export const OrdersCard = ({ orders }: Readonly<{ orders: OrderRef[] }>) => {
  const { t } = useTranslation('purchases');
  if (orders.length === 0) return null;
  return (
    <SectionCard
      icon={IconPackage}
      title={t('procurement.orders.title')}
      subtitle={t('procurement.orders.subtitle')}
    >
      <Stack gap="xs">
        {orders.map((order) => (
          <Group key={order.id} justify="space-between" wrap="nowrap">
            <Group gap="xs">
              <Anchor component={Link} to={detailPath('order', order.id)} size="sm" fw={600}>
                {order.number}
              </Anchor>
              <Badge size="xs" variant="light" color="gray" radius="sm">
                {t(order.isService ? 'procurement.orders.service' : 'procurement.orders.goods')}
              </Badge>
              <Badge size="xs" variant="light" radius="sm">
                {t(`status.${order.status}`)}
              </Badge>
            </Group>
            <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatAmount(order.total)}
            </Text>
          </Group>
        ))}
      </Stack>
    </SectionCard>
  );
};
