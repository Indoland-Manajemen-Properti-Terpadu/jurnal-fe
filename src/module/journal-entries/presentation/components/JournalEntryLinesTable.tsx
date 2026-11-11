import React from 'react';
import { Anchor, Paper, Skeleton, Table, Text } from '@mantine/core';
import { IconBook2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/utils/formatCurrency';
import { routes } from '@/router/routes';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { JournalEntryLine } from '../../domain/journalEntry';
import { absoluteDifference, isDetailBalanced, sumAmounts } from '../../domain/journalRules';

/** An account as people read it: its code, then its name. */
const accountLabel = (code?: string | null, name?: string | null): string =>
  [code, name].filter(Boolean).join(' · ');

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

  const amount = (value: number | undefined) => (
    <Text
      size="sm"
      fw={value ? 600 : 400}
      c={value ? 'dark.8' : 'dimmed'}
      style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
    >
      {value ? formatCurrency(value) : '—'}
    </Text>
  );

  const openAccount = (account: NonNullable<JournalEntryLine['account']>) => {
    const targetRoute = account.isBankAndCash
      ? routes.accountLedger.cashBank
      : routes.accountLedger.nonCashBank;
    navigate(targetRoute.replace(':idAccount', account.id!));
  };

  return (
    <Paper withBorder={withBorder} radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={640} type="native">
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
              return (
                <Table.Tr key={txn.id || `txn-${index}`}>
                  <Table.Td>
                    {account?.id ? (
                      <Anchor
                        component="button"
                        type="button"
                        size="sm"
                        fw={600}
                        ta="left"
                        onClick={() => openAccount(account)}
                      >
                        {accountLabel(account.accountNumber, account.name) ||
                          t('linesTable.unknownAccount')}
                      </Anchor>
                    ) : (
                      <Text size="sm" fw={600} c="dark.8">
                        {accountLabel(account?.accountNumber, account?.name) || '—'}
                      </Text>
                    )}
                    <Text size="xs" c="dimmed" mt={2}>
                      {account?.category?.name || '—'}
                    </Text>
                  </Table.Td>

                  <Table.Td>
                    <Text size="sm" c={txn.description ? 'dark.7' : 'dimmed'}>
                      {txn.description || '—'}
                    </Text>
                    {txn.notes && txn.notes !== '-' && (
                      <Text size="xs" c="dimmed" mt={2}>
                        {t('linesTable.note', { note: txn.notes })}
                      </Text>
                    )}
                  </Table.Td>

                  <Table.Td style={{ textAlign: 'right' }}>{amount(txn.debit)}</Table.Td>
                  <Table.Td style={{ textAlign: 'right' }}>{amount(txn.credit)}</Table.Td>
                </Table.Tr>
              );
            })}

            <Table.Tr
              bg="gray.0"
              style={{ borderTop: '1px solid var(--jurnal-color-border-subtle)' }}
            >
              <Table.Td colSpan={2}>
                <Text fw={700} size="sm" c="dark.9">
                  {t('linesTable.total')}
                </Text>
                {!isBalanced && (
                  <Text size="xs" fw={600} c="red.7" mt={2}>
                    {t('linesTable.difference', {
                      amount: formatCurrency(absoluteDifference(totalDebit, totalCredit)),
                    })}
                  </Text>
                )}
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text
                  fw={700}
                  size="sm"
                  c="dark.9"
                  style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                >
                  {formatCurrency(totalDebit)}
                </Text>
              </Table.Td>
              <Table.Td style={{ textAlign: 'right' }}>
                <Text
                  fw={700}
                  size="sm"
                  c="dark.9"
                  style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                >
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
