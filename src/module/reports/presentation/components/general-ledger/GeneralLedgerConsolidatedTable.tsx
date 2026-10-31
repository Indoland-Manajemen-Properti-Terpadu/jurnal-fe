import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconArrowRight, IconEye, IconSearch, IconX } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { formatCount, formatMoney } from '@/module/reports/domain/reportFormat';

import { useTranslation } from '@/i18n';
interface GeneralLedgerConsolidatedTableProps {
  accounts: GeneralLedgerAccount[];
  onSelectAccount: (accountId: string) => void;
}

export const GeneralLedgerConsolidatedTable: React.FC<GeneralLedgerConsolidatedTableProps> = ({
  accounts,
  onSelectAccount,
}) => {
  const { t } = useTranslation('reports');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return accounts;
    return accounts.filter(
      (acc) =>
        acc.number.toLowerCase().includes(term) ||
        acc.name.toLowerCase().includes(term) ||
        acc.category.toLowerCase().includes(term)
    );
  }, [accounts, search]);

  // Aggregate totals
  const totals = useMemo(() => {
    return filtered.reduce(
      (acc, curr) => ({
        openingBalance: acc.openingBalance + curr.openingBalance,
        periodDebit: acc.periodDebit + curr.periodDebit,
        periodCredit: acc.periodCredit + curr.periodCredit,
        closingBalance: acc.closingBalance + curr.closingBalance,
      }),
      { openingBalance: 0, periodDebit: 0, periodCredit: 0, closingBalance: 0 }
    );
  }, [filtered]);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Box>
            <Text fw={700} size="md" c="dark.9">
              {t('generalLedger.consolidatedTitle')}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              {t('generalLedger.consolidatedDescription')}
            </Text>
          </Box>

          <TextInput
            placeholder="Cari kode, nama, atau kategori akun..."
            size="xs"
            radius="md"
            leftSection={<IconSearch size={14} />}
            rightSection={
              search ? (
                <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => setSearch('')}>
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            w={{ base: '100%', sm: 300 }}
          />
        </Group>

        <ScrollArea offsetScrollbars>
          <Table
            verticalSpacing="xs"
            horizontalSpacing="sm"
            highlightOnHover
            withTableBorder
            style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}
          >
            <Table.Thead bg="gray.1">
              <Table.Tr>
                <Table.Th w={120}>{t('common.accountNumberShort')}</Table.Th>
                <Table.Th>{t('common.accountName')}</Table.Th>
                <Table.Th w={140}>{t('common.category')}</Table.Th>
                <Table.Th ta="right" w={150}>
                  {t('generalLedger.openingBalance')}
                </Table.Th>
                <Table.Th ta="right" w={150}>
                  {t('generalLedger.colPeriodDebit')}
                </Table.Th>
                <Table.Th ta="right" w={150}>
                  {t('generalLedger.colPeriodCredit')}
                </Table.Th>
                <Table.Th ta="right" w={160}>
                  {t('generalLedger.closingBalance')}
                </Table.Th>
                <Table.Th ta="center" w={110}>
                  {t('common.action')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {filtered.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={8}>
                    <EmptyState
                      title={t('generalLedger.accountNotFound')}
                      description={`Tidak ada akun yang sesuai dengan pencarian "${search}".`}
                      actionLabel={t('common.resetSearch')}
                      onAction={() => setSearch('')}
                      py={40}
                    />
                  </Table.Td>
                </Table.Tr>
              ) : (
                filtered.map((acc) => (
                  <Table.Tr key={acc.id}>
                    <Table.Td>
                      <Text size="xs" fw={700} c="dark.8" style={{ fontFamily: 'monospace' }}>
                        {acc.number}
                      </Text>
                    </Table.Td>

                    <Table.Td>
                      <Group gap={6} wrap="nowrap">
                        <Text size="xs" fw={600} c="dark.9">
                          {acc.name}
                        </Text>
                        {acc.isContra && (
                          <Badge size="xs" variant="outline" color="orange">
                            {t('common.contra')}
                          </Badge>
                        )}
                      </Group>
                    </Table.Td>

                    <Table.Td>
                      <Badge size="xs" variant="light" color="gray">
                        {acc.category}
                      </Badge>
                    </Table.Td>

                    <Table.Td ta="right">
                      <Text size="xs" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {formatMoney(acc.openingBalance)}
                      </Text>
                    </Table.Td>

                    <Table.Td ta="right">
                      <Text
                        size="xs"
                        fw={acc.periodDebit > 0 ? 600 : 400}
                        c={acc.periodDebit > 0 ? 'teal.7' : 'dimmed'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {acc.periodDebit > 0 ? formatMoney(acc.periodDebit) : '-'}
                      </Text>
                    </Table.Td>

                    <Table.Td ta="right">
                      <Text
                        size="xs"
                        fw={acc.periodCredit > 0 ? 600 : 400}
                        c={acc.periodCredit > 0 ? 'red.7' : 'dimmed'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {acc.periodCredit > 0 ? formatMoney(acc.periodCredit) : '-'}
                      </Text>
                    </Table.Td>

                    <Table.Td ta="right">
                      <Text
                        size="xs"
                        fw={700}
                        c={acc.closingBalance < 0 ? 'red.6' : 'dark.9'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatMoney(acc.closingBalance)}
                      </Text>
                    </Table.Td>

                    <Table.Td ta="center">
                      <Button
                        size="xs"
                        variant="subtle"
                        color="primary"
                        leftSection={<IconEye size={13} />}
                        onClick={() => onSelectAccount(acc.id)}
                      >
                        {t('common.detail')}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>

            {filtered.length > 0 && (
              <Table.Tfoot bg="gray.1">
                <Table.Tr>
                  <Table.Th colSpan={3}>
                    <Text size="xs" fw={700} c="dark.9">
                      {t('generalLedger.totalAllAccountsPrefix')}
                      {formatCount(filtered.length)})
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text size="xs" fw={800} style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(totals.openingBalance)}
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text
                      size="xs"
                      fw={800}
                      c="teal.8"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatMoney(totals.periodDebit)}
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text
                      size="xs"
                      fw={800}
                      c="red.8"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatMoney(totals.periodCredit)}
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text
                      size="xs"
                      fw={800}
                      c="primary.9"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatMoney(totals.closingBalance)}
                    </Text>
                  </Table.Th>
                  <Table.Th />
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};
