import {
  Box,
  Group,
  Progress,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconBuildingBank } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { sumPositive } from '@/module/dashboard/domain/dashboardTotals';
import type { BalanceSheetLine } from '@/module/dashboard/domain/dashboardTypes';
import classes from './dashboard.module.css';
import { EmptyHint } from './EmptyHint';
import { formatIDR } from './dashboardFormat';

/* ---------- Bank & Cash Account Balances Widget ---------- */

export function BankAccountsList({
  accounts,
  loading,
  onOpenAccount,
}: Readonly<{
  accounts: BalanceSheetLine[];
  loading?: boolean;
  onOpenAccount?: (account: BalanceSheetLine) => void;
}>) {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h={56} radius="md" />
        ))}
      </Stack>
    );
  }

  if (accounts.length === 0) {
    return <EmptyHint text={t('bankEmpty')} />;
  }

  const totalBalance = sumPositive(accounts.map((a) => a.balance));

  return (
    <Stack gap="xs">
      <ScrollArea.Autosize mah={290} type="auto">
        <Stack gap={8}>
          {accounts.map((acc) => {
            const pct = totalBalance > 0 ? (Math.max(0, acc.balance) / totalBalance) * 100 : 0;
            const isNegative = acc.balance < 0;

            return (
              <UnstyledButton
                key={acc.accountId ?? acc.accountName}
                className={classes.rowHover}
                p="sm"
                onClick={() => onOpenAccount?.(acc)}
                style={{
                  border:
                    '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
                  borderRadius: 12,
                  backgroundColor:
                    'color-mix(in srgb, var(--mantine-color-white) 65%, transparent)',
                }}
              >
                <Group justify="space-between" wrap="nowrap" mb={6}>
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon size={34} radius="md" color="primary" variant="light">
                      <IconBuildingBank size={17} />
                    </ThemeIcon>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="dark.8" truncate>
                        {acc.accountName}
                      </Text>
                      <Text size="xs" c="dimmed" ff="monospace">
                        {acc.accountNumber ?? t('bankAccountFallback')}
                      </Text>
                    </Box>
                  </Group>

                  <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
                    <Text size="sm" fw={700} c={isNegative ? 'red.7' : 'dark.9'}>
                      {formatIDR(acc.balance)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('bankShareOfTotal', { pct: pct.toFixed(0) })}
                    </Text>
                  </Stack>
                </Group>
                <Progress value={pct} size={5} radius="xl" color="primary.5" />
              </UnstyledButton>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}
