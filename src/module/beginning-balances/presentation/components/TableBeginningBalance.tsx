import React, { useMemo, useState } from 'react';
import { DataTable } from 'mantine-datatable';
import {
  Badge,
  Group,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
  ActionIcon,
} from '@mantine/core';
import { IconArrowDownRight, IconArrowUpRight, IconX } from '@tabler/icons-react';
import { numberFormat } from '@/utils/formatCurrency';
import EmptyState from '@/components/EmptyState/EmptyTable';
import defaultEmptyImage from '@/assets/images/illustrations/empty-table.svg';
import type { JournalAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import {
  accountKey,
  applyAmountEntry,
  clearAccountRow,
  isNormalDebit,
} from '../../domain/openingBalanceRules';

type TableBeginningBalanceProps = {
  data: JournalAccounts[];
  onChange: (updated: JournalAccounts[]) => void;
  searchQuery?: string;
  selectedCategory?: string | null;
};

const TableBeginningBalance: React.FC<TableBeginningBalanceProps> = ({
  data,
  onChange,
  searchQuery = '',
  selectedCategory = null,
}) => {
  const { t } = useTranslation('beginningBalances');
  // The text being typed in one field, so a trailing comma or decimal digits survive re-formatting.
  const [draft, setDraft] = useState<{ key: string; text: string } | null>(null);
  const shown = (key: string, formatted: string) => (draft?.key === key ? draft.text : formatted);
  // Filter records based on search and category
  const filteredRecords = useMemo(
    () =>
      data.filter((item) => {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (item.name && item.name.toLowerCase().includes(q)) ||
          (item.accountNumber && item.accountNumber.toLowerCase().includes(q)) ||
          (item.category?.name && item.category.name.toLowerCase().includes(q));

        const matchesCategory =
          !selectedCategory ||
          selectedCategory === 'all' ||
          item.category?.name?.toLowerCase() === selectedCategory.toLowerCase() ||
          item.category?.categoryID === selectedCategory;

        return matchesSearch && matchesCategory;
      }),
    [data, searchQuery, selectedCategory]
  );

  const handleValueChange = (accountId: string, field: 'debit' | 'credit', rawString: string) => {
    setDraft({ key: `${accountId}:${field}`, text: rawString });
    onChange(applyAmountEntry(data, accountId, field, rawString));
  };

  const handleClearRow = (accountId: string) => {
    setDraft(null);
    onChange(clearAccountRow(data, accountId));
  };

  const columns = [
    {
      accessor: 'accountNumber',
      title: (
        <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
          {t('table.code')}
        </Text>
      ),
      width: 140,
      render: (item: JournalAccounts) => {
        const isSub = Number(item.level) > 1 || item.level === 'sub';
        return (
          <Group gap={6} wrap="nowrap" style={{ paddingLeft: isSub ? 16 : 0 }}>
            <Badge
              variant="outline"
              color={isSub ? 'gray' : 'primary'}
              radius="sm"
              ff="monospace"
              size="sm"
              fw={700}
            >
              {item.accountNumber}
            </Badge>
          </Group>
        );
      },
    },
    {
      accessor: 'name',
      title: (
        <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
          {t('table.nameAndNormal')}
        </Text>
      ),
      render: (item: JournalAccounts) => {
        const isSub = Number(item.level) > 1 || item.level === 'sub';
        const normalDebit = isNormalDebit(item.category?.name, item.category?.isDebit);

        return (
          <Stack gap={3}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={isSub ? 500 : 700} fz="var(--jurnal-text-sm)" c="dark.8">
                {item.name}
              </Text>
              {!isSub && (
                <Badge size="xs" variant="light" color="indigo" radius="sm">
                  {t('table.parent')}
                </Badge>
              )}
            </Group>
            <Group gap={6} wrap="wrap" align="center">
              <Text size="xs" c="dimmed">
                {item.category?.name || t('table.defaultCategory')}
              </Text>
              <Text size="xs" c="dimmed">
                •
              </Text>
              <Badge
                size="xs"
                variant="light"
                color={normalDebit ? 'teal' : 'red'}
                radius="sm"
                leftSection={
                  normalDebit ? <IconArrowDownRight size={11} /> : <IconArrowUpRight size={11} />
                }
              >
                {normalDebit ? t('table.suggestedDebit') : t('table.suggestedCredit')}
              </Badge>
            </Group>
          </Stack>
        );
      },
    },
    {
      accessor: 'debit',
      title: (
        <Group justify="flex-end" gap={6}>
          <ThemeIcon size={20} radius="xl" color="teal" variant="light">
            <IconArrowDownRight size={13} />
          </ThemeIcon>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('table.debit')}
          </Text>
        </Group>
      ),
      width: 220,
      textAlignment: 'right' as const,
      render: (item: JournalAccounts) => {
        const debitVal = item.debit || 0;
        const hasVal = debitVal > 0;
        const normalDebit = isNormalDebit(item.category?.name, item.category?.isDebit);
        const isContraFilled = hasVal && !normalDebit;

        return (
          <Stack gap={2} align="flex-end">
            <TextInput
              placeholder={normalDebit ? t('table.placeholderSuggested') : '0'}
              size="xs"
              radius="md"
              leftSection={
                <Text size="xs" fw={600} c={hasVal ? 'teal.7' : normalDebit ? 'teal.6' : 'dimmed'}>
                  Rp
                </Text>
              }
              value={shown(`${accountKey(item)}:debit`, hasVal ? numberFormat(debitVal) : '')}
              onChange={(e) => handleValueChange(accountKey(item), 'debit', e.target.value)}
              onBlur={() => setDraft(null)}
              styles={{
                root: {
                  width: '100%',
                },
                input: {
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  fontWeight: hasVal ? 700 : 400,
                  fontSize: 'var(--jurnal-text-sm)',
                  color: hasVal ? 'var(--mantine-color-teal-8)' : 'inherit',
                  backgroundColor: hasVal
                    ? 'var(--mantine-color-teal-0)'
                    : normalDebit
                      ? 'var(--mantine-color-white)'
                      : 'var(--mantine-color-slate-0)',
                  borderColor: hasVal
                    ? 'var(--mantine-color-teal-5)'
                    : normalDebit
                      ? 'var(--mantine-color-teal-2)'
                      : 'var(--mantine-color-gray-3)',
                  boxShadow: normalDebit
                    ? '0 1px 2px color-mix(in srgb, var(--mantine-color-black) 2%, transparent)'
                    : 'none',
                  transition: 'all 150ms ease',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-teal-6)',
                    backgroundColor: 'var(--mantine-color-white)',
                  },
                },
              }}
            />
            {isContraFilled && (
              <Badge size="xs" color="orange" variant="light" radius="xs">
                {t('table.contraSide')}
              </Badge>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: 'credit',
      title: (
        <Group justify="flex-end" gap={6}>
          <ThemeIcon size={20} radius="xl" color="red" variant="light">
            <IconArrowUpRight size={13} />
          </ThemeIcon>
          <Text fw={700} fz="var(--jurnal-text-sm)" c="dark.8">
            {t('table.credit')}
          </Text>
        </Group>
      ),
      width: 220,
      textAlignment: 'right' as const,
      render: (item: JournalAccounts) => {
        const creditVal = item.credit || 0;
        const hasVal = creditVal > 0;
        const normalDebit = isNormalDebit(item.category?.name, item.category?.isDebit);
        const isNormalCredit = !normalDebit;
        const isContraFilled = hasVal && normalDebit;

        return (
          <Stack gap={2} align="flex-end">
            <TextInput
              placeholder={isNormalCredit ? t('table.placeholderSuggested') : '0'}
              size="xs"
              radius="md"
              leftSection={
                <Text size="xs" fw={600} c={hasVal ? 'red.7' : isNormalCredit ? 'red.6' : 'dimmed'}>
                  Rp
                </Text>
              }
              value={shown(`${accountKey(item)}:credit`, hasVal ? numberFormat(creditVal) : '')}
              onChange={(e) => handleValueChange(accountKey(item), 'credit', e.target.value)}
              onBlur={() => setDraft(null)}
              styles={{
                root: {
                  width: '100%',
                },
                input: {
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  fontWeight: hasVal ? 700 : 400,
                  fontSize: 'var(--jurnal-text-sm)',
                  color: hasVal ? 'var(--mantine-color-red-8)' : 'inherit',
                  backgroundColor: hasVal
                    ? 'var(--mantine-color-red-0)'
                    : isNormalCredit
                      ? 'var(--mantine-color-white)'
                      : 'var(--mantine-color-slate-0)',
                  borderColor: hasVal
                    ? 'var(--mantine-color-red-5)'
                    : isNormalCredit
                      ? 'var(--mantine-color-red-2)'
                      : 'var(--mantine-color-gray-3)',
                  boxShadow: isNormalCredit
                    ? '0 1px 2px color-mix(in srgb, var(--mantine-color-black) 2%, transparent)'
                    : 'none',
                  transition: 'all 150ms ease',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-red-6)',
                    backgroundColor: 'var(--mantine-color-white)',
                  },
                },
              }}
            />
            {isContraFilled && (
              <Badge size="xs" color="orange" variant="light" radius="xs">
                {t('table.contraSide')}
              </Badge>
            )}
          </Stack>
        );
      },
    },
    {
      accessor: 'actions',
      title: '',
      width: 50,
      textAlignment: 'center' as const,
      render: (item: JournalAccounts) => {
        const hasAny = (item.debit || 0) > 0 || (item.credit || 0) > 0;
        if (!hasAny) return null;

        return (
          <Tooltip label={t('table.clearRow')}>
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
              onClick={() => handleClearRow(accountKey(item))}
            >
              <IconX size={14} />
            </ActionIcon>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <DataTable
      withTableBorder
      borderRadius="md"
      highlightOnHover
      records={filteredRecords}
      columns={columns}
      minHeight={320}
      verticalSpacing="sm"
      noRecordsText={t('table.noRecords')}
      emptyState={
        <EmptyState
          title={t('table.emptyTitle')}
          imageSrc={defaultEmptyImage}
          imageAlt={t('table.emptyImageAlt')}
        />
      }
    />
  );
};

export default TableBeginningBalance;
