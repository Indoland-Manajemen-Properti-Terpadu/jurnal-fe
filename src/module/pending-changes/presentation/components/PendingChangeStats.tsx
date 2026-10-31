import type { ReactNode } from 'react';
import { Group, Paper, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconAlertCircle, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

type StatCardProps = {
  label: string;
  value: string;
  caption: string;
  valueColor: string;
  icon: ReactNode;
  iconColor: string;
};

function StatCard({ label, value, caption, valueColor, icon, iconColor }: StatCardProps) {
  return (
    <Paper
      withBorder
      radius="md"
      p="md"
      bg="white"
      style={{ transition: 'transform 150ms ease, box-shadow 150ms ease' }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
            {label}
          </Text>
          <Text fz="var(--jurnal-text-2xl)" fw={800} c={valueColor} mt={4} lh={1.1}>
            {value}
          </Text>
          <Text size="xs" c="dimmed" mt={4}>
            {caption}
          </Text>
        </div>
        <ThemeIcon size={40} radius="md" variant="light" color={iconColor}>
          {icon}
        </ThemeIcon>
      </Group>
    </Paper>
  );
}

type PendingChangeStatsProps = {
  totalPending: number;
  fineCount: number;
  paymentCount: number;
};

export default function PendingChangeStats({
  totalPending,
  fineCount,
  paymentCount,
}: PendingChangeStatsProps) {
  const { t, currentLanguage } = useTranslation('pendingChanges');
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';

  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <StatCard
        label={t('totalPending')}
        value={totalPending.toLocaleString(locale)}
        caption={totalPending > 0 ? t('needAccountantApproval') : t('allSynced')}
        valueColor={totalPending > 0 ? 'orange.8' : 'dark.8'}
        icon={<IconClock size={20} />}
        iconColor={totalPending > 0 ? 'orange' : 'teal'}
      />
      <StatCard
        label={t('lateFeeFine')}
        value={fineCount.toLocaleString(locale)}
        caption={t('lateFeeDesc')}
        valueColor="dark.8"
        icon={<IconAlertCircle size={20} />}
        iconColor="red"
      />
      <StatCard
        label={t('incomingPayment')}
        value={paymentCount.toLocaleString(locale)}
        caption={t('incomingPaymentDesc')}
        valueColor="dark.8"
        icon={<IconReceipt2 size={20} />}
        iconColor="teal"
      />
    </SimpleGrid>
  );
}
