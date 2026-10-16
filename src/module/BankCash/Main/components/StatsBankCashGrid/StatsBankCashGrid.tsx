import { Box, Group, Paper, SimpleGrid, Skeleton, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBuildingBank, IconCoins, IconWallet, IconChecks } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { JournalAccounts } from '@/module/GeneralJournal/JournalAccount/types/JournalAccountModel';
import { useTranslation } from '@/i18n';

export const isBankAccount = (account: JournalAccounts): boolean => {
  const name = (account.name || '').toLowerCase();
  const catName = (account.category?.name || '').toLowerCase();
  return (
    catName.includes('bank') ||
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

export type StatsBankCashGridProps = {
  accounts: JournalAccounts[];
  loading?: boolean;
};

export default function StatsBankCashGrid({ accounts, loading }: StatsBankCashGridProps) {
  const { t } = useTranslation('journal');

  const cashAndBankAccounts = (accounts || []).filter((acc) => acc.isBankAndCash);

  const totalLiquidity = cashAndBankAccounts.reduce(
    (sum, acc) => sum + (Number(acc.amount) || 0),
    0
  );

  const bankAccounts = cashAndBankAccounts.filter(isBankAccount);
  const totalBankBalance = bankAccounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0);

  const cashAccounts = cashAndBankAccounts.filter((acc) => !isBankAccount(acc));
  const totalCashBalance = cashAccounts.reduce((sum, acc) => sum + (Number(acc.amount) || 0), 0);

  const activeAccountsCount = cashAndBankAccounts.length;

  const stats = [
    {
      title: t('totalLiquidity'),
      value: formatCurrency(totalLiquidity),
      subtitle: t('totalLiquiditySubtitle'),
      icon: IconCoins,
      color: totalLiquidity < 0 ? 'red' : 'primary',
      badgeColor: totalLiquidity < 0 ? 'red' : 'teal',
    },
    {
      title: t('totalBankAccounts'),
      value: formatCurrency(totalBankBalance),
      subtitle: t('bankAccountsSubtitle', {
        count: bankAccounts.length,
      }),
      icon: IconBuildingBank,
      color: 'blue',
      badgeColor: 'blue',
    },
    {
      title: t('totalCashAccounts'),
      value: formatCurrency(totalCashBalance),
      subtitle: t('cashAccountsSubtitle', {
        count: cashAccounts.length,
      }),
      icon: IconWallet,
      color: 'teal',
      badgeColor: 'teal',
    },
    {
      title: t('activeAccountsCount'),
      value: `${activeAccountsCount} Akun`,
      subtitle: t('activeAccountsCountSubtitle'),
      icon: IconChecks,
      color: 'indigo',
      badgeColor: 'indigo',
    },
  ];

  if (loading) {
    return (
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
        {Array.from({ length: 4 }).map((_, i) => (
          <Paper key={`skeleton-${i}`} withBorder radius="md" p="md" bg="white">
            <Skeleton height={12} width="60%" radius="sm" mb="sm" />
            <Skeleton height={28} width="85%" radius="sm" mb="xs" />
            <Skeleton height={10} width="70%" radius="sm" />
          </Paper>
        ))}
      </SimpleGrid>
    );
  }

  return (
    <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md">
      {stats.map((stat) => {
        const IconComponent = stat.icon;
        return (
          <Paper
            key={stat.title}
            withBorder
            radius="md"
            p="md"
            bg="white"
            style={{
              transition: 'transform 150ms ease, box-shadow 150ms ease',
            }}
          >
            <Group justify="space-between" align="flex-start" wrap="nowrap">
              <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" fw={600} tt="uppercase" lts={0.5}>
                  {stat.title}
                </Text>
                <Text
                  fz={{ base: 20, sm: 22 }}
                  fw={800}
                  c="dark.8"
                  mt={4}
                  lh={1.2}
                  style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.3px' }}
                >
                  {stat.value}
                </Text>
                <Text size="xs" c="dimmed" mt={4} lineClamp={1}>
                  {stat.subtitle}
                </Text>
              </Box>

              <ThemeIcon
                size={42}
                radius="md"
                variant="light"
                color={stat.color}
                style={{ flexShrink: 0 }}
              >
                <IconComponent size={22} stroke={1.8} />
              </ThemeIcon>
            </Group>
          </Paper>
        );
      })}
    </SimpleGrid>
  );
}
