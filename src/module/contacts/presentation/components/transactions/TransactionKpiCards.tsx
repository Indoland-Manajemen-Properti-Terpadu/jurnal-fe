import { Card, Group, SimpleGrid, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconClock, IconReceipt2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SalesTotals } from '@/module/contacts/domain/contactTransactions';
import { formatIDR } from './formatAmount';

type Props = { totals: SalesTotals; count: number };

export function TransactionKpiCards({ totals, count }: Readonly<Props>) {
  const { t } = useTranslation('contacts');
  const hasRemaining = totals.remainingSum > 0;

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
      {/* Total Transaksi */}
      <Card withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
            {t('transactions.kpi.totalTitle')}
          </Text>
          <ThemeIcon size={32} radius="md" variant="light" color="primary">
            <IconReceipt2 size={18} />
          </ThemeIcon>
        </Group>
        <Text
          size="xl"
          fw={800}
          c="primary.9"
          mt="xs"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatIDR(totals.finalSum)}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {t('transactions.kpi.totalNote')}
        </Text>
      </Card>

      {/* Total Pembayaran Diterima */}
      <Card withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
            {t('transactions.kpi.paidTitle')}
          </Text>
          <ThemeIcon size={32} radius="md" variant="light" color="teal">
            <IconCheck size={18} />
          </ThemeIcon>
        </Group>
        <Text size="xl" fw={800} c="teal.8" mt="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
          {formatIDR(totals.paidSum)}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {t('transactions.kpi.paidNote')}
        </Text>
      </Card>

      {/* Sisa Piutang */}
      <Card withBorder radius="md" p="md" bg={hasRemaining ? 'orange.0' : 'gray.0'}>
        <Group justify="space-between" align="center">
          <Text
            size="xs"
            fw={700}
            c={hasRemaining ? 'orange.9' : 'dimmed'}
            tt="uppercase"
            lts={0.4}
          >
            {t('transactions.kpi.remainingTitle')}
          </Text>
          <ThemeIcon
            size={32}
            radius="md"
            variant="filled"
            color={hasRemaining ? 'orange' : 'teal'}
          >
            {hasRemaining ? <IconClock size={18} /> : <IconCheck size={18} />}
          </ThemeIcon>
        </Group>
        <Text
          size="xl"
          fw={800}
          c={hasRemaining ? 'orange.9' : 'teal.8'}
          mt="xs"
          style={{ fontVariantNumeric: 'tabular-nums' }}
        >
          {formatIDR(totals.remainingSum)}
        </Text>
        <Text size="xs" c={hasRemaining ? 'orange.7' : 'teal.7'} mt={2}>
          {hasRemaining
            ? t('transactions.kpi.remainingPending')
            : t('transactions.kpi.remainingSettled')}
        </Text>
      </Card>

      {/* Jumlah Faktur */}
      <Card withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
            {t('transactions.kpi.countTitle')}
          </Text>
          <ThemeIcon size={32} radius="md" variant="light" color="indigo">
            <IconReceipt2 size={18} />
          </ThemeIcon>
        </Group>
        <Text size="xl" fw={800} c="dark.8" mt="xs">
          {t('transactions.kpi.countValue', { count })}
        </Text>
        <Text size="xs" c="dimmed" mt={2}>
          {t('transactions.kpi.countNote')}
        </Text>
      </Card>
    </SimpleGrid>
  );
}
