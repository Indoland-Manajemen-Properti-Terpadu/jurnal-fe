import type { ReactNode } from 'react';
import { Alert, Badge, Box, Divider, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { imprestEquation } from '@/module/petty-cash/domain/pettyCashView';

interface Props {
  fund: PettyCashFund;
}

const money = (amount: number) => formatCurrency(amount, false);

function Row({
  label,
  value,
  strong,
}: Readonly<{ label: string; value: ReactNode; strong?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

/**
 * Imprest position of one fund: what can still be spent, and the equation the fund must always
 * satisfy (cash + vouchers + advances = ceiling). Every figure is the server's; nothing is
 * recomputed here, and `isBalanced` decides whether the equation is shown as holding.
 */
export function ImprestBalancePanel({ fund }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const { balance } = fund;
  const ratio = Math.min(Math.max(balance.availableCashRatio, 0), 100);

  return (
    <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} bg="white">
      <Group align="flex-start" justify="space-between" gap="xl" wrap="wrap">
        <Stack gap={6} style={{ flex: '1 1 280px' }}>
          <Text size="sm" c="dimmed" fw={600}>
            {t('balance.available')}
          </Text>
          <Text fz={{ base: 30, sm: 38 }} fw={700} lh={1.1} c="dark.9">
            {money(balance.availableCash)}
          </Text>
          <Text size="xs" c="dimmed">
            {t('balance.availableHint')}
          </Text>
          <Box mt="sm">
            <Progress
              value={ratio}
              color={balance.needsReplenishment ? 'orange' : 'primary'}
              radius="xl"
              size={7}
              aria-label={t('balance.remaining', { percent: Math.round(ratio) })}
            />
            <Text size="xs" c="dimmed" mt={6}>
              {t('balance.remaining', { percent: Math.round(ratio) })}
            </Text>
          </Box>
        </Stack>

        <Stack gap="xs" style={{ flex: '1 1 320px' }}>
          <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.4}>
            {t('balance.equationTitle')}
          </Text>
          {imprestEquation(balance).map((row) => (
            <Row key={row.key} label={t(`balance.${row.key}`)} value={money(row.amount)} />
          ))}
          <Divider />
          <Row label={t('balance.ceiling')} value={money(fund.pagu)} strong />
          <Badge
            variant="light"
            color={balance.isBalanced ? 'teal' : 'orange'}
            radius="sm"
            tt="none"
            leftSection={
              balance.isBalanced ? <IconCircleCheck size={13} /> : <IconAlertTriangle size={13} />
            }
            style={{ alignSelf: 'flex-start' }}
          >
            {balance.isBalanced ? t('balance.balanced') : t('balance.unbalanced')}
          </Badge>
          {!balance.isBalanced && (
            <Text size="xs" c="orange.8" fw={600}>
              {t('balance.unbalancedHint')}
            </Text>
          )}
          <Text size="xs" c="dimmed">
            {t('balance.equationHint')}
          </Text>
        </Stack>
      </Group>

      {balance.needsReplenishment && (
        <Alert
          mt="lg"
          radius="md"
          variant="light"
          color="orange"
          icon={<IconAlertTriangle size={16} />}
        >
          {t('balance.needsReplenishment', { amount: money(balance.replenishmentAmount) })}
        </Alert>
      )}
    </Paper>
  );
}
