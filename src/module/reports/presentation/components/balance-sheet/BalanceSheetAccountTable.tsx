import React from 'react';
import { Badge, Box, Group, ScrollArea, Table, Text } from '@mantine/core';
import type { BalanceSheetAccountItem } from '@/module/reports/domain/balanceSheet.types';
import { formatMoney } from '@/module/reports/domain/reportFormat';

interface BalanceSheetAccountTableProps {
  title: string;
  accounts: BalanceSheetAccountItem[];
  subtotal: number;
  subtotalLabel?: string;
  subtotalColor?: string;
  emptyText?: string;
}

export const BalanceSheetAccountTable: React.FC<BalanceSheetAccountTableProps> = ({
  title,
  accounts,
  subtotal,
  subtotalLabel,
  subtotalColor = 'dark.9',
  emptyText = 'Tidak ada akun tercatat',
}) => {
  return (
    <Box>
      <Group justify="space-between" align="center" mb={6}>
        <Text size="xs" fw={700} c="dimmed" tt="uppercase">
          {title} ({accounts.length})
        </Text>
      </Group>

      <ScrollArea offsetScrollbars>
        <Table
          verticalSpacing={6}
          horizontalSpacing="sm"
          highlightOnHover
          withTableBorder
          style={{ borderRadius: 'var(--mantine-radius-md)', overflow: 'hidden' }}
        >
          <Table.Thead bg="gray.1">
            <Table.Tr>
              <Table.Th w={120}>No. Akun</Table.Th>
              <Table.Th>Nama Akun</Table.Th>
              <Table.Th w={140}>Kategori</Table.Th>
              <Table.Th ta="right" w={160}>Saldo</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {accounts.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={4} ta="center" py="md">
                  <Text size="xs" c="dimmed" fs="italic">
                    {emptyText}
                  </Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              accounts.map((item, idx) => (
                <Table.Tr key={`${item.accountId || item.accountNumber || idx}`}>
                  <Table.Td>
                    <Text size="xs" fw={600} c="dark.7" style={{ fontFamily: 'monospace' }}>
                      {item.accountNumber || '-'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="xs" fw={500} c="dark.9">
                      {item.accountName}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    {item.categoryName ? (
                      <Badge size="xs" variant="light" color="gray">
                        {item.categoryName}
                      </Badge>
                    ) : (
                      <Text size="xs" c="dimmed">-</Text>
                    )}
                  </Table.Td>

                  <Table.Td ta="right">
                    <Text
                      size="xs"
                      fw={600}
                      c={item.balance < 0 ? 'red.6' : 'dark.9'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {item.balance < 0
                        ? `(${formatMoney(Math.abs(item.balance))})`
                        : formatMoney(item.balance)}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ))
            )}
          </Table.Tbody>

          <Table.Tfoot bg="gray.0">
            <Table.Tr>
              <Table.Th colSpan={3}>
                <Text size="xs" fw={700} c="dark.8">
                  {subtotalLabel || `Total ${title}`}
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text
                  size="xs"
                  fw={800}
                  c={subtotalColor}
                  style={{ fontVariantNumeric: 'tabular-nums' }}
                >
                  {subtotal < 0
                    ? `(${formatMoney(Math.abs(subtotal))})`
                    : formatMoney(subtotal)}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Tfoot>
        </Table>
      </ScrollArea>
    </Box>
  );
};

