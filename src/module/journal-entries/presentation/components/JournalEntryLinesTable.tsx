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
import { formatCurrency } from '@/utils/formatCurrency';
import { routes } from '@/router/routes';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { JournalEntryLine } from '../../domain/journalEntry';
import { absoluteDifference, isDetailBalanced, sumAmounts } from '../../domain/journalRules';

interface Props {
  transactionDetails?: JournalEntryLine[];
  isLoading?: boolean;
  withBorder?: boolean;
}

const JournalEntryLinesTable: React.FC<Props> = ({
  transactionDetails = [],
  isLoading = false,
  withBorder = true,
}) => {
  const { t } = useTranslation('journalEntries');
  const navigate = useNavigate();

  const totalDebit = sumAmounts(transactionDetails.map((item) => Number(item.debit) || 0));
  const totalCredit = sumAmounts(transactionDetails.map((item) => Number(item.credit) || 0));
  const isBalanced = isDetailBalanced(totalDebit, totalCredit);

  if (isLoading) {
    return (
      <Paper withBorder={withBorder} radius="md" p="md" bg="white">
        <Table verticalSpacing="md" horizontalSpacing="md">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '42%' }}>{t('linesTable.loadingAccount')}</Table.Th>
              <Table.Th style={{ width: '28%' }}>{t('linesTable.loadingDescription')}</Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                {t('linesTable.headDebit')}
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                {t('linesTable.headCredit')}
              </Table.Th>
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
          title={t('linesTable.emptyTitle')}
          description={t('linesTable.emptyDescription')}
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
                  {t('linesTable.headAccount')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '30%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('linesTable.headDescription')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('linesTable.headDebit')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '15%', textAlign: 'right' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('linesTable.headCredit')}
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
                              {account.name || t('linesTable.unknownAccount')}
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
                                  <Tooltip
                                    label={
                                      copied
                                        ? t('linesTable.copied')
                                        : t('linesTable.copyAccountNumber')
                                    }
                                  >
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
                        {t('linesTable.note', { note: txn.notes })}
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
                    {t('linesTable.total')}
                  </Text>
                  {!isBalanced && (
                    <Badge size="xs" color="red" variant="filled">
                      {t('linesTable.difference', {
                        amount: formatCurrency(absoluteDifference(totalDebit, totalCredit)),
                      })}
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

export default JournalEntryLinesTable;
