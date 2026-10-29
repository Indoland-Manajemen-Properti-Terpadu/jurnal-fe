import { Box, Group, Paper, SimpleGrid, Skeleton, Stack, Text } from '@mantine/core';
import { formatCurrency } from '@/utils/FormatCurrency';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import classes from './StatsBankCashGrid.module.css';

export const isBankAccount = (account: JournalAccounts): boolean => {
  const name = (account.name || '').toLowerCase();
  const categoryName = (account.category?.name || '').toLowerCase();
  return (
    categoryName.includes('bank') ||
    name.includes('bank') ||
    name.includes('bca') ||
    name.includes('mandiri') ||
    name.includes('bri') ||
    name.includes('bni') ||
    name.includes('cimb') ||
    name.includes('permata') ||
    name.includes('danamon') ||
    name.includes('bsi') ||
    name.includes('giro') ||
    name.includes('rekening')
  );
};

export function summarizeBankCashAccounts(accounts: JournalAccounts[]) {
  const managedAccounts = (accounts || []).filter((account) => account.isBankAndCash);
  const bankAccounts = managedAccounts.filter(isBankAccount);
  const cashAccounts = managedAccounts.filter((account) => !isBankAccount(account));
  const totalBankBalance = bankAccounts.reduce(
    (total, account) => total + (Number(account.amount) || 0),
    0
  );
  const totalCashBalance = cashAccounts.reduce(
    (total, account) => total + (Number(account.amount) || 0),
    0
  );

  return {
    totalLiquidity: totalBankBalance + totalCashBalance,
    totalBankBalance,
    totalCashBalance,
    bankAccountCount: bankAccounts.length,
    cashAccountCount: cashAccounts.length,
    accountCount: managedAccounts.length,
  };
}

export type StatsBankCashGridProps = {
  accounts: JournalAccounts[];
  loading?: boolean;
};

export default function StatsBankCashGrid({ accounts, loading }: StatsBankCashGridProps) {
  const { t } = useTranslation('journal');
  const summary = summarizeBankCashAccounts(accounts);

  if (loading) {
    return (
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }}>
        <Skeleton height={12} width={150} mb="md" />
        <Skeleton height={42} width={260} mb="xl" />
        <SimpleGrid cols={{ base: 1, sm: 3 }}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} height={54} />
          ))}
        </SimpleGrid>
      </Paper>
    );
  }

  const details = [
    {
      label: t('availableBankBalance'),
      value: formatCurrency(summary.totalBankBalance),
      hint: t('bankAccountsSubtitle', { count: summary.bankAccountCount }),
    },
    {
      label: t('cashBalance'),
      value: formatCurrency(summary.totalCashBalance),
      hint: t('cashAccountsSubtitle', { count: summary.cashAccountCount }),
    },
    {
      label: t('managedAccounts'),
      value: String(summary.accountCount),
      hint: t('activeAccountsCountSubtitle'),
    },
  ];

  return (
    <Paper className={classes.summary} withBorder radius="lg">
      <Group className={classes.layout} align="stretch" wrap="nowrap">
        <Box className={classes.primaryMetric}>
          <Text fz="sm" c="dimmed" fw={600}>
            {t('totalLiquidity')}
          </Text>
          <Text className={classes.value}>{formatCurrency(summary.totalLiquidity)}</Text>
          <Text fz="xs" c="dimmed" mt={8}>
            {t('totalLiquiditySubtitle')}
          </Text>
        </Box>

        <SimpleGrid className={classes.details} cols={{ base: 1, sm: 3 }} spacing={0}>
          {details.map((detail) => (
            <Stack className={classes.detail} key={detail.label} gap={4}>
              <Text fz="xs" c="dimmed">
                {detail.label}
              </Text>
              <Text fz="lg" fw={650} c="dark.9" className={classes.tabular}>
                {detail.value}
              </Text>
              <Text fz={11} c="dimmed">
                {detail.hint}
              </Text>
            </Stack>
          ))}
        </SimpleGrid>
      </Group>
    </Paper>
  );
}
