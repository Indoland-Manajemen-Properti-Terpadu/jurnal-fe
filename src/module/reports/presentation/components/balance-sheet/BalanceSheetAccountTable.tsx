import React from 'react';
import { Box, Collapse, Group, ScrollArea, Table, Text, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconChevronDown } from '@tabler/icons-react';
import type { BalanceSheetAccountItem } from '@/module/reports/domain/balanceSheet.types';
import { formatMoney, percentOf } from '@/module/reports/domain/reportFormat';
import classes from '@/module/reports/presentation/components/shared/ReportShared.module.css';

import { useTranslation } from '@/i18n';

interface BalanceSheetAccountTableProps {
  title: string;
  accounts: BalanceSheetAccountItem[];
  subtotal: number;
  /** Total of the side this group belongs to; draws the group's share of it as a thin bar. */
  sideTotal?: number;
  emptyText?: string;
}

/** Negative balances show in parentheses, as in a printed statement. */
const signedMoney = (value: number) =>
  value < 0 ? `(${formatMoney(Math.abs(value))})` : formatMoney(value);

/** One group of a balance sheet side. The header carries the subtotal, so a collapsed group still reads. */
export const BalanceSheetAccountTable: React.FC<BalanceSheetAccountTableProps> = ({
  title,
  accounts,
  subtotal,
  sideTotal,
  emptyText,
}) => {
  const { t } = useTranslation('reports');
  const [opened, { toggle }] = useDisclosure(true);

  return (
    <Box>
      <UnstyledButton
        className={classes.groupHeader}
        onClick={toggle}
        aria-expanded={opened}
        aria-label={title}
      >
        <Group justify="space-between" wrap="nowrap" gap="md">
          <Group gap={6} wrap="nowrap">
            <IconChevronDown
              size={16}
              className={classes.chevron}
              data-open={opened}
              color="var(--mantine-color-gray-6)"
            />
            <Text fz="sm" fw={600} c="dark.9">
              {title}
            </Text>
            <Text fz="xs" c="dimmed">
              {accounts.length}
            </Text>
          </Group>
          <Text fz="sm" fw={700} c="dark.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
            {signedMoney(subtotal)}
          </Text>
        </Group>
        {sideTotal !== undefined && (
          <div className={classes.shareTrack} aria-hidden="true">
            <div
              className={classes.shareFill}
              style={{ width: `${percentOf(subtotal, sideTotal)}%` }}
            />
          </div>
        )}
      </UnstyledButton>

      <Collapse in={opened}>
        <ScrollArea offsetScrollbars>
          <Table verticalSpacing={8} horizontalSpacing="sm" highlightOnHover miw={420}>
            <Table.Thead>
              <Table.Tr>
                <Table.Th w={150} fz="xs" c="dimmed" fw={600}>
                  {t('common.accountNumberShort')}
                </Table.Th>
                <Table.Th fz="xs" c="dimmed" fw={600}>
                  {t('common.accountName')}
                </Table.Th>
                <Table.Th ta="right" w={150} fz="xs" c="dimmed" fw={600}>
                  {t('common.balance')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {accounts.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={3} ta="center" py="md">
                    <Text fz="sm" c="dimmed">
                      {emptyText ?? t('balanceSheet.noAccounts')}
                    </Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                accounts.map((item, index) => (
                  <Table.Tr key={`${item.accountId || item.accountNumber || index}`}>
                    <Table.Td>
                      <Text
                        fz="sm"
                        c="dimmed"
                        style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}
                      >
                        {item.accountNumber || '-'}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text fz="sm" c="dark.9">
                        {item.accountName}
                      </Text>
                      {item.categoryName && (
                        <Text fz="xs" c="dimmed">
                          {item.categoryName}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text
                        fz="sm"
                        fw={500}
                        c={item.balance < 0 ? 'red.7' : 'dark.9'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {signedMoney(item.balance)}
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Collapse>
    </Box>
  );
};
