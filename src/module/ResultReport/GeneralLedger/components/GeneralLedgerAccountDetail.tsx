import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Select,
  SimpleGrid,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowDown,
  IconArrowUp,
  IconBook2,
  IconExternalLink,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import type { GeneralLedgerAccount, GeneralLedgerTransaction } from '../types/generalLedger.types';
import { displayDate, formatCount, formatMoney } from '../../utils/reportFormat';

interface GeneralLedgerAccountDetailProps {
  account: GeneralLedgerAccount | null;
  transactions: GeneralLedgerTransaction[];
  transactionSearch: string;
  onTransactionSearchChange: (search: string) => void;
  transactionSort: 'asc' | 'desc';
  onTransactionSortChange: (sort: 'asc' | 'desc') => void;
}

export const GeneralLedgerAccountDetail: React.FC<GeneralLedgerAccountDetailProps> = ({
  account,
  transactions,
  transactionSearch,
  onTransactionSearchChange,
  transactionSort,
  onTransactionSortChange,
}) => {
  if (!account) {
    return (
      <Paper withBorder radius="lg" p="xl" bg="white" shadow="xs">
        <EmptyState
          title="Pilih Akun Buku Besar"
          description="Pilih salah satu akun pada daftar di sebelah kiri untuk melihat rincian mutasi transaksi dan saldo berjalan."
          py={60}
        />
      </Paper>
    );
  }

  return (
    <Paper withBorder radius="lg" p="lg" bg="white" shadow="xs">
      <Stack gap="lg">
        {/* Account Header */}
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Group align="flex-start" wrap="nowrap" gap="md">
            <ThemeIcon color="primary" variant="light" radius="md" size={46}>
              <IconBook2 size={24} />
            </ThemeIcon>
            <Box>
              <Group gap="xs" align="center">
                <Text size="xs" fw={700} c="primary.7" style={{ fontFamily: 'monospace' }}>
                  AKUN {account.number}
                </Text>
                <Badge variant="light" color="primary" size="sm">
                  {account.category}
                </Badge>
                {account.isContra && (
                  <Badge variant="outline" color="orange" size="sm">
                    Akun Kontra
                  </Badge>
                )}
              </Group>
              <Title order={3} c="dark.9" mt={2} fw={800}>
                {account.name}
              </Title>
            </Box>
          </Group>

          <Badge variant="outline" color="gray" size="md">
            {formatCount(account.transactions.length)} Transaksi Terdaftar
          </Badge>
        </Group>

        {/* 4 Mini Balance Summary Cards */}
        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="sm">
          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="dimmed" fw={600}>
              Saldo Awal
            </Text>
            <Text size="sm" fw={700} c="dark.8" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(account.openingBalance)}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="teal.7" fw={600}>
              Total Debit
            </Text>
            <Text size="sm" fw={700} c="teal.8" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(account.periodDebit)}
            </Text>
          </Paper>

          <Paper withBorder radius="md" p="sm" bg="gray.0">
            <Text size="xs" c="indigo.7" fw={600}>
              Total Kredit
            </Text>
            <Text size="sm" fw={700} c="indigo.8" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(account.periodCredit)}
            </Text>
          </Paper>

          <Paper
            withBorder
            radius="md"
            p="sm"
            bg="primary.0"
            style={{ borderColor: 'var(--mantine-color-primary-3)' }}
          >
            <Text size="xs" c="primary.7" fw={700}>
              Saldo Akhir
            </Text>
            <Text size="sm" fw={800} c="primary.9" mt={2} style={{ fontVariantNumeric: 'tabular-nums' }}>
              {formatMoney(account.closingBalance)}
            </Text>
          </Paper>
        </SimpleGrid>

        <Divider />

        {/* Transactions Toolbar */}
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Text fw={700} size="sm" c="dark.9">
              Rincian Mutasi Transaksi
            </Text>
            <Badge size="xs" variant="light" color="gray">
              {transactions.length} mutasi ditampilkan
            </Badge>
          </Group>

          <Group gap="xs">
            <TextInput
              placeholder="Cari no referensi atau memo..."
              size="xs"
              radius="md"
              leftSection={<IconSearch size={14} />}
              rightSection={
                transactionSearch ? (
                  <ActionIcon
                    size="xs"
                    variant="subtle"
                    color="gray"
                    onClick={() => onTransactionSearchChange('')}
                  >
                    <IconX size={12} />
                  </ActionIcon>
                ) : null
              }
              value={transactionSearch}
              onChange={(e) => onTransactionSearchChange(e.currentTarget.value)}
              w={{ base: '100%', xs: 220 }}
            />

            <Select
              size="xs"
              radius="md"
              value={transactionSort}
              onChange={(val) => onTransactionSortChange((val as 'asc' | 'desc') || 'asc')}
              data={[
                { value: 'asc', label: 'Tanggal: Terlama ke Terbaru' },
                { value: 'desc', label: 'Tanggal: Terbaru ke Terlama' },
              ]}
              w={200}
            />
          </Group>
        </Group>

        {/* Transactions Table */}
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
                <Table.Th w={110}>Tanggal</Table.Th>
                <Table.Th w={160}>No. Referensi</Table.Th>
                <Table.Th>Deskripsi Transaksi</Table.Th>
                <Table.Th ta="right" w={150}>Debit</Table.Th>
                <Table.Th ta="right" w={150}>Kredit</Table.Th>
                <Table.Th ta="right" w={160}>Saldo Berjalan</Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {transactions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={6}>
                    <EmptyState
                      title="Tidak Ada Mutasi"
                      description={
                        transactionSearch
                          ? `Tidak ada transaksi yang cocok dengan kata kunci "${transactionSearch}".`
                          : 'Tidak ada aktivitas transaksi pada akun ini selama periode yang dipilih.'
                      }
                      py={36}
                    />
                  </Table.Td>
                </Table.Tr>
              ) : (
                transactions.map((tx, idx) => {
                  const hasJournalLink = Boolean(tx.journalId);
                  return (
                    <Table.Tr key={`${tx.journalId}-${tx.transactionNumber}-${idx}`}>
                      <Table.Td>
                        <Text size="xs" c="dark.7">
                          {displayDate(tx.transactionDate)}
                        </Text>
                      </Table.Td>

                      <Table.Td>
                        {hasJournalLink ? (
                          <Tooltip label="Lihat Detail Transaksi Jurnal">
                            <Text
                              component={Link}
                              to={`/general-journal/detail-transaction-journal/${tx.journalId}`}
                              size="xs"
                              fw={600}
                              c="primary.7"
                              style={{
                                textDecoration: 'none',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                            >
                              <span>{tx.transactionNumber}</span>
                              <IconExternalLink size={12} />
                            </Text>
                          </Tooltip>
                        ) : (
                          <Text size="xs" fw={600} c="dark.7">
                            {tx.transactionNumber}
                          </Text>
                        )}
                      </Table.Td>

                      <Table.Td>
                        <Text size="xs" c="dark.8">
                          {tx.description || '-'}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="right">
                        <Text
                          size="xs"
                          fw={tx.debit > 0 ? 600 : 400}
                          c={tx.debit > 0 ? 'teal.7' : 'dimmed'}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {tx.debit > 0 ? formatMoney(tx.debit) : '-'}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="right">
                        <Text
                          size="xs"
                          fw={tx.credit > 0 ? 600 : 400}
                          c={tx.credit > 0 ? 'indigo.7' : 'dimmed'}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {tx.credit > 0 ? formatMoney(tx.credit) : '-'}
                        </Text>
                      </Table.Td>

                      <Table.Td ta="right">
                        <Text
                          size="xs"
                          fw={700}
                          c={tx.balance < 0 ? 'red.6' : 'dark.9'}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatMoney(tx.balance)}
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>

            {transactions.length > 0 && (
              <Table.Tfoot bg="gray.1">
                <Table.Tr>
                  <Table.Th colSpan={3}>
                    <Text size="xs" fw={700} c="dark.9">
                      Total Periode
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text size="xs" fw={800} c="teal.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(account.periodDebit)}
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text size="xs" fw={800} c="indigo.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(account.periodCredit)}
                    </Text>
                  </Table.Th>
                  <Table.Th ta="right">
                    <Text size="xs" fw={800} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatMoney(account.closingBalance)}
                    </Text>
                  </Table.Th>
                </Table.Tr>
              </Table.Tfoot>
            )}
          </Table>
        </ScrollArea>
      </Stack>
    </Paper>
  );
};

