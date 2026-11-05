import React, { useState } from 'react';
import {
  Accordion,
  ActionIcon,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import type {
  GeneralLedgerAccount,
  GeneralLedgerPagination,
  ReportPeriod,
} from '@/module/reports/domain/generalLedger.types';
import { percentOf } from '@/module/reports/domain/generalLedgerInsights';
import { formatCount, formatMoney } from '@/module/reports/domain/reportFormat';
import { useTranslation } from '@/i18n';
import { GeneralLedgerAccountBody } from './GeneralLedgerAccountBody';
import { GeneralLedgerPager } from './GeneralLedgerPager';
import classes from './GeneralLedger.module.css';

interface GeneralLedgerAccountsTableProps {
  accounts: GeneralLedgerAccount[];
  period: ReportPeriod;
  search: string;
  onSearchChange: (search: string) => void;
  pagination: GeneralLedgerPagination;
  onPageChange: (page: number) => void;
  isPageLoading: boolean;
}

const amount = (value: number) => (value > 0 ? formatMoney(value) : '–');

/** Every account of the ledger as one row; a row opens to its charts and transactions. */
export const GeneralLedgerAccountsTable: React.FC<GeneralLedgerAccountsTableProps> = ({
  accounts,
  period,
  search,
  onSearchChange,
  pagination,
  onPageChange,
  isPageLoading,
}) => {
  const { t } = useTranslation('reports');
  const [opened, setOpened] = useState<string[]>([]);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="md">
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Box>
            <Text fw={600} fz="md" c="dark.9">
              {t('generalLedger.tableTitle')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('generalLedger.tableHint')}
            </Text>
          </Box>
          <TextInput
            placeholder={t('generalLedger.searchAccounts')}
            aria-label={t('generalLedger.searchAccounts')}
            radius="md"
            leftSection={<IconSearch size={14} />}
            rightSection={
              search ? (
                <ActionIcon
                  size="sm"
                  variant="subtle"
                  color="gray"
                  aria-label={t('common.resetSearch')}
                  onClick={() => onSearchChange('')}
                >
                  <IconX size={13} />
                </ActionIcon>
              ) : null
            }
            value={search}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            w={{ base: '100%', sm: 320 }}
          />
        </Group>

        <ScrollArea offsetScrollbars>
          <div className={classes.ledgerTable}>
            <div className={`${classes.accountRow} ${classes.headRow}`}>
              <Text fz="xs" fw={600} c="dimmed">
                {t('common.accountName')}
              </Text>
              <Text fz="xs" fw={600} c="dimmed">
                {t('generalLedger.compositionLabel')}
              </Text>
              {(['openingBalance', 'totalDebit', 'totalCredit', 'closingBalance'] as const).map(
                (key) => (
                  <Text key={key} fz="xs" fw={600} c="dimmed" ta="right">
                    {t(`generalLedger.${key}`)}
                  </Text>
                )
              )}
            </div>

            {accounts.length === 0 ? (
              <EmptyState
                title={t('generalLedger.accountNotFound')}
                description={t('generalLedger.noAccountMatch', { query: search })}
                actionLabel={t('common.resetSearch')}
                onAction={() => onSearchChange('')}
                py={40}
              />
            ) : (
              <Accordion multiple variant="default" value={opened} onChange={setOpened}>
                {accounts.map((account) => {
                  const total = account.periodDebit + account.periodCredit;
                  return (
                    <Accordion.Item key={account.id} value={account.id}>
                      <Accordion.Control>
                        <span className={classes.accountRow}>
                          <span>
                            <Text component="span" fz="xs" c="dimmed" display="block">
                              {account.number}
                            </Text>
                            <Text component="span" fz="sm" fw={600} c="dark.9" display="block">
                              {account.name}
                            </Text>
                            <Text component="span" fz="xs" c="dimmed" display="block">
                              {[
                                account.category,
                                account.isContra ? t('generalLedger.contraAccount') : null,
                                `${formatCount(account.transactions.length)} ${t('common.mutationUnit')}`,
                              ]
                                .filter(Boolean)
                                .join(' · ')}
                            </Text>
                          </span>
                          <span className={classes.split} aria-hidden="true">
                            <span
                              style={{
                                width: `${percentOf(account.periodDebit, total)}%`,
                                background: 'var(--mantine-color-primary-6)',
                              }}
                            />
                            <span
                              style={{
                                width: `${percentOf(account.periodCredit, total)}%`,
                                background: 'var(--mantine-color-primary-2)',
                              }}
                            />
                          </span>
                          <Text component="span" fz="sm" ta="right" className={classes.amount}>
                            {formatMoney(account.openingBalance)}
                          </Text>
                          <Text
                            component="span"
                            fz="sm"
                            ta="right"
                            c={account.periodDebit > 0 ? 'dark.9' : 'dimmed'}
                            className={classes.amount}
                          >
                            {amount(account.periodDebit)}
                          </Text>
                          <Text
                            component="span"
                            fz="sm"
                            ta="right"
                            c={account.periodCredit > 0 ? 'dark.9' : 'dimmed'}
                            className={classes.amount}
                          >
                            {amount(account.periodCredit)}
                          </Text>
                          <Text
                            component="span"
                            fz="sm"
                            fw={700}
                            ta="right"
                            c={account.closingBalance < 0 ? 'red.7' : 'dark.9'}
                            className={classes.amount}
                          >
                            {formatMoney(account.closingBalance)}
                          </Text>
                        </span>
                      </Accordion.Control>
                      <Accordion.Panel>
                        {opened.includes(account.id) && (
                          <GeneralLedgerAccountBody account={account} period={period} />
                        )}
                      </Accordion.Panel>
                    </Accordion.Item>
                  );
                })}
              </Accordion>
            )}
          </div>
        </ScrollArea>

        <GeneralLedgerPager
          pagination={pagination}
          onChange={onPageChange}
          disabled={isPageLoading}
        />
      </Stack>
    </Paper>
  );
};
