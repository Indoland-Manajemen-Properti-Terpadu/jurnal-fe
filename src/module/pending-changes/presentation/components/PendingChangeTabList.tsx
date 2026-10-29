import { Tabs } from '@mantine/core';
import { IconAlertCircle, IconReceipt2, IconShieldCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PENDING_CHANGE_TYPES } from '../../domain/pendingChange';

type PendingChangeTabListProps = {
  total: number;
  fineCount: number;
  paymentCount: number;
};

export default function PendingChangeTabList({
  total,
  fineCount,
  paymentCount,
}: PendingChangeTabListProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Tabs.List mb="md">
      <Tabs.Tab value="all" leftSection={<IconShieldCheck size={16} />}>
        {t('tabAll')} ({total})
      </Tabs.Tab>
      <Tabs.Tab value={PENDING_CHANGE_TYPES.fine} leftSection={<IconAlertCircle size={16} />}>
        {t('tabFine')} ({fineCount})
      </Tabs.Tab>
      <Tabs.Tab value={PENDING_CHANGE_TYPES.salePayment} leftSection={<IconReceipt2 size={16} />}>
        {t('tabPayment')} ({paymentCount})
      </Tabs.Tab>
    </Tabs.List>
  );
}
