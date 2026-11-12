import type { ReactNode } from 'react';
import { Box, Divider, Grid, Group, Paper, Progress, Stack, Text } from '@mantine/core';
import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { imprestEquation } from '@/module/petty-cash/domain/pettyCashView';
import { AmountRows } from '@/module/petty-cash/presentation/components/DetailKit';
import { PettyCashStatusBadge } from '@/module/petty-cash/presentation/components/PettyCashStatusBadge';
import { FundLedgerLink } from '@/module/petty-cash/presentation/components/FundLedgerLink';
import { PocketBalances } from '@/module/petty-cash/presentation/components/PocketBalances';

const money = (amount: number) => formatCurrency(amount, false);

function Meta({ label, children }: Readonly<{ label: string; children: ReactNode }>) {
  return (
    <Stack gap={0}>
      <Text size="xs" c="dimmed">
        {label}
      </Text>
      <Text size="sm" fw={500} c="dark.8" component="div">
        {children}
      </Text>
    </Stack>
  );
}

/**
 * One card for the chosen fund: who holds it and which account backs it, what can still be spent,
 * the imprest equation, where the cash sits, and the rules the backend enforces. Every figure is
 * the server's; `isBalanced` decides whether the equation is shown as holding.
 */
export function FundOverview({
  fund,
  switcher,
}: Readonly<{ fund: PettyCashFund; switcher?: ReactNode }>) {
  const { t } = useTranslation('pettyCash');
  const { balance, settings } = fund;
  const ratio = Math.min(Math.max(balance.availableCashRatio, 0), 100);
  const rows = imprestEquation(balance).map((row) => ({
    label: t(`balance.${row.key}`),
    value: money(row.amount),
  }));

  return (
    <Paper withBorder radius="lg" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Group
        px={{ base: 'md', sm: 'lg' }}
        py="md"
        justify="space-between"
        align="flex-end"
        gap="lg"
        wrap="wrap"
        style={{ borderBottom: '1px solid var(--mantine-color-gray-2)' }}
      >
        {switcher ?? (
          <Text fw={700} fz={17} c="dark.9">
            {fund.code} · {fund.name}
          </Text>
        )}
        <Group gap="xl" wrap="wrap">
          <Meta label={t('workspace.custodian')}>{fund.custodian.name}</Meta>
          <Meta label={t('workspace.account')}>
            {fund.account.accountNumber} · {fund.account.name}
          </Meta>
          <Meta label={t('workspace.lastCount')}>
            {fund.lastCountAt ? dateFormatV1(fund.lastCountAt) : t('workspace.neverCounted')}
          </Meta>
          <PettyCashStatusBadge kind="fund" status={fund.status} />
        </Group>
        <FundLedgerLink fund={fund} />
      </Group>

      <Grid gutter={{ base: 'lg', md: 48 }} p={{ base: 'md', sm: 'lg' }}>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Stack gap={6}>
            <Text size="sm" c="dimmed">
              {t('balance.available')}
            </Text>
            <Text fz={{ base: 30, sm: 36 }} fw={700} lh={1.1} c="dark.9">
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
                size={6}
                aria-label={t('balance.remaining', { percent: Math.round(ratio) })}
              />
              <Text size="xs" c="dimmed" mt={6}>
                {t('balance.remaining', { percent: Math.round(ratio) })}
              </Text>
            </Box>
            {balance.needsReplenishment && (
              <Group gap={6} wrap="nowrap" mt={4}>
                <IconAlertTriangle size={14} color="var(--mantine-color-orange-7)" />
                <Text size="xs" c="orange.8" fw={600}>
                  {t('balance.needsReplenishment', {
                    amount: money(balance.replenishmentAmount),
                  })}
                </Text>
              </Group>
            )}
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Stack gap="sm">
            <Text size="sm" fw={600} c="dark.8">
              {t('balance.equationTitle')}
            </Text>
            <AmountRows
              rows={[
                ...rows,
                { label: t('balance.ceiling'), value: money(fund.pagu), total: true },
              ]}
            />
            <Group gap={6} wrap="nowrap" align="flex-start">
              {balance.isBalanced ? (
                <IconCircleCheck size={15} color="var(--mantine-color-teal-7)" />
              ) : (
                <IconAlertTriangle size={15} color="var(--mantine-color-orange-7)" />
              )}
              <Text
                size="xs"
                c={balance.isBalanced ? 'dimmed' : 'orange.8'}
                fw={balance.isBalanced ? 400 : 600}
              >
                {balance.isBalanced
                  ? `${t('balance.balanced')}. ${t('balance.equationHint')}`
                  : `${t('balance.unbalanced')}. ${t('balance.unbalancedHint')}`}
              </Text>
            </Group>
          </Stack>
        </Grid.Col>
      </Grid>

      {fund.pockets.length > 0 && (
        <Box px={{ base: 'md', sm: 'lg' }} pb="lg">
          <Divider mb="lg" />
          <PocketBalances fund={fund} />
        </Box>
      )}

      <Group
        px={{ base: 'md', sm: 'lg' }}
        py="sm"
        gap="xl"
        bg="gray.0"
        style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
      >
        <Text size="xs" c="dimmed">
          {t('workspace.voucherApproval')}{' '}
          <Text span fw={600} c="dark.7">
            {money(settings.voucherApprovalThreshold)}
          </Text>
        </Text>
        <Text size="xs" c="dimmed">
          {t('workspace.attachmentRequired')}{' '}
          <Text span fw={600} c="dark.7">
            {money(settings.attachmentRequiredThreshold)}
          </Text>
        </Text>
      </Group>
    </Paper>
  );
}
