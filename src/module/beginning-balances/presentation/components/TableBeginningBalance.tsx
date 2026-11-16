import React, { useState } from 'react';
import { ActionIcon, Badge, Group, Stack, Table, Text, TextInput, Tooltip } from '@mantine/core';
import { IconListTree, IconX } from '@tabler/icons-react';
import { numberFormat } from '@/utils/formatCurrency';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import type { OpeningRow } from '../../domain/beginningBalance';
import { formatAmountInput } from '../../domain/openingBalanceRules';
import { groupOpeningRows } from '../../domain/openingGroups';
import classes from './TableBeginningBalance.module.css';

type Side = 'debit' | 'credit';

type TableBeginningBalanceProps = {
  /** The rows to show; the page already applied the filter. */
  records: OpeningRow[];
  onEnter: (accountId: string, field: Side, raw: string) => void;
  onClear: (accountId: string) => void;
  /** Clears the search and filters; offered from the empty state. */
  onResetFilters: () => void;
};

const TableBeginningBalance: React.FC<TableBeginningBalanceProps> = ({
  records,
  onEnter,
  onClear,
  onResetFilters,
}) => {
  const { t } = useTranslation('beginningBalances');
  // The text being typed in one field, so a trailing comma or decimal digits survive re-formatting.
  const [typing, setTyping] = useState<{ key: string; text: string } | null>(null);

  // Format while typing and keep the caret after the same digit: the text gets dots, so the
  // caret index of the raw text is mapped to the same count of digits and comma in the new one.
  const handleType = (
    accountId: string,
    field: Side,
    input: HTMLInputElement,
    raw: string = input.value
  ) => {
    const caret = raw === input.value ? (input.selectionStart ?? raw.length) : raw.length;
    const significant = raw.slice(0, caret).replace(/[^\d,]/g, '').length;
    const text = formatAmountInput(raw);
    setTyping({ key: `${accountId}:${field}`, text });
    onEnter(accountId, field, text);

    let position = 0;
    let seen = 0;
    while (position < text.length && seen < significant) {
      if (/[\d,]/.test(text[position])) seen += 1;
      position += 1;
    }
    requestAnimationFrame(() => input.setSelectionRange(position, position));
  };

  const amountCell = (row: OpeningRow, field: Side) => {
    const key = `${row.id}:${field}`;
    const amount = row[field];
    const filled = amount > 0;
    const isNormal = row.normalSide === field;
    const offSide = filled && !isNormal;

    return (
      <Stack gap={2} align="flex-end">
        <TextInput
          aria-label={`${t(`table.${field}`)} ${row.accountNumber}`}
          placeholder="0"
          size="xs"
          radius="md"
          inputMode="decimal"
          leftSection={
            <Text size="xs" c="dimmed">
              Rp
            </Text>
          }
          value={typing?.key === key ? typing.text : filled ? numberFormat(amount) : ''}
          onChange={(event) => handleType(row.id, field, event.target)}
          onPaste={(event) => {
            // A pasted decimal with a dot (`1500.50`, from a sheet) is a decimal, not thousands.
            const pasted = event.clipboardData.getData('text').trim();
            if (/^\d+\.\d{1,2}$/.test(pasted)) {
              event.preventDefault();
              handleType(row.id, field, event.currentTarget, pasted.replace('.', ','));
            }
          }}
          onBlur={() => setTyping(null)}
          w="100%"
          styles={{
            input: {
              textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
              fontWeight: filled ? 600 : 400,
              // The side the account normally grows on is tinted, so it reads at a glance.
              backgroundColor: isNormal ? 'var(--mantine-color-primary-0)' : undefined,
              borderColor: offSide
                ? 'var(--mantine-color-orange-5)'
                : filled
                  ? 'var(--mantine-color-primary-3)'
                  : isNormal
                    ? 'var(--mantine-color-primary-1)'
                    : undefined,
            },
          }}
        />
        {offSide && (
          <Text fz="var(--jurnal-text-xs)" c="orange.9">
            {t(field === 'debit' ? 'table.offSideDebit' : 'table.offSideCredit')}
          </Text>
        )}
      </Stack>
    );
  };

  const groups = groupOpeningRows(records);

  if (records.length === 0) {
    return (
      <EmptyState
        icon={<IconListTree size={32} stroke={1.6} />}
        title={t('table.emptyTitle')}
        description={t('table.emptyDescription')}
        actionLabel={t('table.emptyAction')}
        onAction={onResetFilters}
      />
    );
  }

  return (
    <Stack gap="xs">
      <Group gap={6} aria-hidden="true">
        <span className={classes.swatch} />
        <Text fz="var(--jurnal-text-xs)" c="dimmed">
          {t('table.normalLegend')}
        </Text>
      </Group>
      <div className={classes.wrap}>
        <Table stickyHeader highlightOnHover verticalSpacing="xs" className={classes.table}>
          <Table.Thead className={classes.head}>
            <Table.Tr>
              <Table.Th w={120}>{t('table.code')}</Table.Th>
              <Table.Th>{t('table.name')}</Table.Th>
              <Table.Th w={210} ta="right">
                {t('table.debit')}
              </Table.Th>
              <Table.Th w={210} ta="right">
                {t('table.credit')}
              </Table.Th>
              <Table.Th w={48} aria-label={t('table.clearRow')} />
            </Table.Tr>
          </Table.Thead>
          {groups.map((group) => (
            <Table.Tbody key={group.accountClass ?? 'other'}>
              <Table.Tr className={classes.group}>
                <Table.Th colSpan={5} scope="rowgroup">
                  <Text component="span" fw={700} fz="var(--jurnal-text-sm)" c="primary.9">
                    {group.accountClass
                      ? t(`table.classNames.${group.accountClass}`)
                      : t('table.otherClass')}
                  </Text>
                </Table.Th>
              </Table.Tr>
              {group.rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>
                    <Text
                      fz="var(--jurnal-text-sm)"
                      fw={600}
                      c="primary.8"
                      style={{ whiteSpace: 'nowrap' }}
                    >
                      {row.accountNumber}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Text fz="var(--jurnal-text-sm)" fw={500} c="dark.8">
                        {row.name}
                      </Text>
                      {row.isContra && (
                        <Badge size="xs" variant="light" color="gray" c="gray.8" tt="none">
                          {t('table.contra')}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td>{amountCell(row, 'debit')}</Table.Td>
                  <Table.Td>{amountCell(row, 'credit')}</Table.Td>
                  <Table.Td ta="center">
                    {(row.debit > 0 || row.credit > 0) && (
                      <Tooltip label={t('table.clearRow')}>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          radius="md"
                          aria-label={`${t('table.clearRow')} ${row.accountNumber}`}
                          onClick={() => {
                            setTyping(null);
                            onClear(row.id);
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      </Tooltip>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          ))}
        </Table>
      </div>
    </Stack>
  );
};

export default TableBeginningBalance;
