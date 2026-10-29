import React from 'react';
import {
  Badge,
  Box,
  CopyButton,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconScale,
  IconAlertCircle,
  IconArrowUpRight,
  IconBook2,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { isJournalBalanced } from '@/lib/accounting/journalBalance';
import { formatCurrency } from '@/utils/FormatCurrency';
import { routes } from '@/router/routes';
import { EmptyState } from '@/components/EmptyState';
import { TransactionDetail } from '../../types/TransactionDetailModel';

interface Props {
  transactionDetails?: TransactionDetail[];
  isLoading?: boolean;
  withBorder?: boolean;
}

export const JournalTransactionDetailTable: React.FC<Props> = ({
  transactionDetails = [],
  isLoading = false,
  withBorder = true,
}) => {
  const navigate = useNavigate();

  const totalDebit = transactionDetails.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  const totalCredit = transactionDetails.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
  const isBalanced = isJournalBalanced([{ debit: totalDebit, credit: totalCredit }]);

  if (isLoading) {
    return (
      <Paper withBorder={withBorder} radius="md" p="md" bg="white">
        <Table verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '42%' }}>Akun Transaksi</Table.Th>
              <Table.Th style={{ width: '28%' }}>Keterangan Baris</Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>Debit</Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>Kredit</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from({ length: 4 }).map((_, i) => (
              // eslint-disable-next-line react/no-array-index-key
              <Table.Tr key={`skeleton-row-${i}`}>
                <Table.Td>
                  <Skeleton height={16} width="60%" mb={4} />
                  <Skeleton height={12} width="40%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton height={14} width="75%" />
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Skeleton height={16} width={80} ml="auto" />
                </Table.Td>
                <Table.Td style={{ textAlign: 'right' }}>
                  <Skeleton height={16} width={80} ml="auto" />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    );
  }

  if (transactionDetails.length === 0) {
    return (
      <Paper withBorder={withBorder} radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <EmptyState
          icon={<IconBook2 size={32} stroke={1.6} />}
          title="Tidak Ada Baris Jurnal"
          description="Transaksi jurnal ini tidak memiliki rincian debit atau kredit."
        />
      </Paper>
    );
  }

  return (
    <Paper withBorder={withBorder} radius="md" bg="white" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={720}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '40%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Akun Perkiraan (COA)
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '30%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Deskripsi / Keterangan
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Debit
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  Kredit
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {transactionDetails.map((txn, index) => {
              const { account } = txn;
              const hasDebit = (txn.debit || 0) > 0;
              const hasCredit = (txn.credit || 0) > 0;

              return (
                <Table.Tr
                  key={txn.id || `txn-${index}`}
                  style={{
                    backgroundColor: index % 2 === 1 ? 'var(--mantine-color-gray-0)' : 'white',
                  }}
                >
                  {/* Account Name & Number with Link to Account */}
                  <Table.Td>
                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <ThemeIcon
                        size={28}
                        radius="md"
                        variant="light"
                        color={account?.isBankAndCash ? 'teal' : 'primary'}
                        mt={2}
                      >
                        <IconBook2 size={16} />
                      </ThemeIcon>

                      <Box style={{ flex: 1, minWidth: 0 }}>
                        <Group gap={6} align="center" wrap="nowrap">
                          {account?.id ? (
                            <Text
                              size="sm"
                              fw={600}
                              c="primary.9"
                              style={{
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 4,
                              }}
                              onClick={() => {
                                const targetRoute = account.isBankAndCash
                                  ? routes.generalJournal.detailAccount
                                  : routes.generalJournal.detailAccountNonCB;
                                navigate(targetRoute.replace(':idAccount', account.id!));
                              }}
                            >
                              {account.name || 'Akun Tidak Dikenal'}
                              <IconArrowUpRight size={13} style={{ opacity: 0.7 }} />
                            </Text>
                          ) : (
                            <Text size="sm" fw={600} c="dark.8">
                              {account?.name || '—'}
                            </Text>
                          )}
                        </Group>

                        <Group gap={6} align="center" mt={2} wrap="wrap">
                          {account?.accountNumber && (
                            <Group gap={4} wrap="nowrap">
                              <Badge size="xs" variant="outline" color="gray" radius="sm">
                                {account.accountNumber}
                              </Badge>
                              <CopyButton value={account.accountNumber}>
                                {({ copied, copy }) => (
                                  <Tooltip label={copied ? 'Tersalin' : 'Salin Nomor Akun'}>
                                    <ActionIcon
                                      size="xs"
                                      variant="subtle"
                                      color={copied ? 'teal' : 'gray'}
                                      onClick={copy}
                                    >
                                      {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
                                    </ActionIcon>
                                  </Tooltip>
                                )}
                              </CopyButton>
                            </Group>
                          )}

                          {account?.category?.name && (
                            <Text size="xs" c="dimmed">
                              • {account.category.name}
                            </Text>
                          )}
                        </Group>
                      </Box>
                    </Group>
                  </Table.Td>

                  {/* Description */}
                  <Table.Td>
                    <Text size="sm" c={txn.description ? 'dark.7' : 'dimmed'}>
                      {txn.description || '—'}
                    </Text>
                    {txn.notes && txn.notes !== '-' && (
                      <Text size="xs" c="dimmed" mt={2} fs="italic">
                        Catatan: {txn.notes}
                      </Text>
                    )}
                  </Table.Td>

                  {/* Debit */}
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="sm"
                      fw={hasDebit ? 700 : 400}
                      c={hasDebit ? 'teal.8' : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {hasDebit ? formatCurrency(txn.debit!) : '—'}
                    </Text>
                  </Table.Td>

                  {/* Credit */}
                  <Table.Td style={{ textAlign: 'right' }}>
                    <Text
                      size="sm"
                      fw={hasCredit ? 700 : 400}
                      c={hasCredit ? 'red.8' : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {hasCredit ? formatCurrency(txn.credit!) : '—'}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              );
            })}

            {/* Total Balance Summary Row */}
            <Table.Tr
              style={{
                backgroundColor: 'var(--mantine-color-gray-1)',
                borderTop: '2px solid var(--mantine-color-gray-3)',
              }}
            >
              <Table.Td colSpan={2}>
                <Group gap="xs">
                  <ThemeIcon
                    size={24}
                    radius="md"
                    variant="light"
                    color={isBalanced ? 'teal' : 'red'}
                  >
                    {isBalanced ? <IconScale size={14} /> : <IconAlertCircle size={14} />}
                  </ThemeIcon>
                  <Text fw={700} size="sm" c="dark.9">
                    Total
                  </Text>
                  {!isBalanced && (
                    <Badge size="xs" color="red" variant="filled">
                      Selisih: {formatCurrency(Math.abs(totalDebit - totalCredit))}
                    </Badge>
                  )}
                </Group>
              </Table.Td>

              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={800} size="sm" c="teal.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(totalDebit)}
                </Text>
              </Table.Td>

              <Table.Td style={{ textAlign: 'right' }}>
                <Text fw={800} size="sm" c="red.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatCurrency(totalCredit)}
                </Text>
              </Table.Td>
            </Table.Tr>
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  );
};

export default JournalTransactionDetailTable;
