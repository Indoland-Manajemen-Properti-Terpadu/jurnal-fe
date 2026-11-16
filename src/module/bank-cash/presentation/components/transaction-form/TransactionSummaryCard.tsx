import { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  Group,
  Paper,
  Stack,
  Table,
  Text,
  UnstyledButton,
} from '@mantine/core';
import { IconAlertTriangle, IconChevronDown, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { JournalPreview } from '@/module/bank-cash/domain/transactionForm';

export interface SummaryAccount {
  role: string;
  /** `null` until an account is chosen. */
  name: string | null;
  balance: number;
  /** Balance once the transaction is posted; `null` until it can be worked out. */
  after: number | null;
}

/**
 * The one summary of every posting form: the accounts with their balance now and after, the total,
 * one quiet status line, the actions, and the journal behind a disclosure (closed until asked).
 */
export function TransactionSummaryCard({
  accounts,
  total,
  warning,
  missing,
  journal,
  submitLabel,
  isPending,
  onCancel,
}: Readonly<{
  accounts: SummaryAccount[];
  total: { label: string; amount: number };
  warning?: string | null;
  /** Reasons the form cannot be saved yet, already translated; the first one is shown. */
  missing: string[];
  journal: JournalPreview;
  submitLabel: string;
  isPending: boolean;
  onCancel: () => void;
}>) {
  const { t } = useTranslation('bankCash');
  const [journalOpen, setJournalOpen] = useState(false);
  const ready = missing.length === 0;

  return (
    <Paper withBorder radius="md" p="lg" bg="white" pos="sticky" top={20}>
      <Stack gap="md">
        <Text fw={700} fz={15} c="dark.9">
          {t('form.summaryTitle')}
        </Text>

        {accounts.map((account) => (
          <Stack key={account.role} gap={4}>
            <Text fz={12} c="dimmed">
              {account.role}
            </Text>
            <Text fw={600} fz="sm" c={account.name ? 'dark.9' : 'dimmed'}>
              {account.name ?? t('form.notSelected')}
            </Text>
            {account.name && (
              <Group justify="space-between" fz={12} c="dimmed" gap="xs">
                <span>{t('form.balanceNow')}</span>
                <span>{formatCurrency(account.balance)}</span>
              </Group>
            )}
            {account.name && account.after !== null && (
              <Group justify="space-between" fz={12} gap="xs">
                <Text span fz={12} c="dimmed">
                  {t('form.balanceAfter')}
                </Text>
                <Text span fz={12} fw={600} c={account.after < 0 ? 'orange.8' : 'dark.8'}>
                  {formatCurrency(account.after)}
                </Text>
              </Group>
            )}
          </Stack>
        ))}

        <Divider />

        <Box>
          <Text fz={12} c="dimmed">
            {total.label}
          </Text>
          <Text fz={28} fw={700} lh={1.2} c="dark.9">
            {formatCurrency(total.amount)}
          </Text>
        </Box>

        {warning && (
          <Group gap={6} wrap="nowrap" align="flex-start">
            <IconAlertTriangle size={16} color="var(--mantine-color-orange-7)" />
            <Text fz={12} c="orange.8">
              {warning}
            </Text>
          </Group>
        )}

        <Group gap={6} wrap="nowrap" align="flex-start" role="status">
          {ready ? (
            <IconCircleCheck size={16} color="var(--mantine-color-teal-7)" />
          ) : (
            <IconAlertTriangle size={16} color="var(--mantine-color-gray-6)" />
          )}
          <Text fz={12} c={ready ? 'teal.8' : 'dimmed'}>
            {ready ? t('form.ready') : missing[0]}
          </Text>
        </Group>

        <Stack gap="xs">
          <Button type="submit" size="md" disabled={!ready} loading={isPending} fullWidth>
            {submitLabel}
          </Button>
          <Button variant="default" onClick={onCancel} disabled={isPending} fullWidth>
            {t('form.cancel')}
          </Button>
        </Stack>

        <Divider />

        <Box>
          <UnstyledButton
            onClick={() => setJournalOpen((open) => !open)}
            aria-expanded={journalOpen}
            w="100%"
          >
            <Group justify="space-between" wrap="nowrap">
              <Text fz={13} fw={600} c="primary.8">
                {t('form.journalToggle')}
              </Text>
              <IconChevronDown
                size={16}
                style={{
                  transform: journalOpen ? 'rotate(180deg)' : undefined,
                  transition: 'transform 150ms ease',
                }}
              />
            </Group>
          </UnstyledButton>
          {journalOpen && (
            <Box mt="sm">
              {journal.lines.length === 0 ? (
                <Text fz={12} c="dimmed">
                  {t('form.journalEmpty')}
                </Text>
              ) : (
                <Stack gap="xs">
                  <Table verticalSpacing={4} horizontalSpacing={4} fz={12}>
                    <Table.Thead>
                      <Table.Tr>
                        <Table.Th>{t('form.journalAccount')}</Table.Th>
                        <Table.Th ta="right">{t('form.journalDebit')}</Table.Th>
                        <Table.Th ta="right">{t('form.journalCredit')}</Table.Th>
                      </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                      {journal.lines.map((line, index) => (
                        <Table.Tr key={`${line.account}-${index}`}>
                          <Table.Td>{line.account}</Table.Td>
                          <Table.Td ta="right">
                            {line.debit !== undefined ? formatCurrency(line.debit) : ''}
                          </Table.Td>
                          <Table.Td ta="right">
                            {line.credit !== undefined ? formatCurrency(line.credit) : ''}
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                  {journal.balanced && (
                    <Text fz={12} c="dimmed">
                      {t('form.journalBalanced')}
                    </Text>
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </Paper>
  );
}
