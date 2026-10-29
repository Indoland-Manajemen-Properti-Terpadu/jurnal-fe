import React, { useMemo } from 'react';
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
  Box,
} from '@mantine/core';
import {
  IconArrowDownRight,
  IconArrowUpRight,
  IconX,
  IconAlertCircle,
  IconSparkles,
} from '@tabler/icons-react';
import { isDebitNormal } from '@/lib/accounting/normalBalance';
import { formatCurrency, numberFormat } from '@/utils/FormatCurrency';
import EmptyState from '@/components/EmptyState/EmptyTable';
import defaultEmptyImage from '@/assets/img/Empty-Dataa.svg';
import { JournalAccounts } from '@/module/chart-of-accounts';

type TableBeginningBalanceProps = {
  data: JournalAccounts[];
  onChange: (updated: JournalAccounts[]) => void;
  searchQuery?: string;
  selectedCategory?: string | null;
};

/** Determine normal balance position from category standard */
export function isNormalDebit(categoryName?: string, isDebit?: boolean): boolean {
  return isDebitNormal({ isDebit, categoryName });
}

const TableBeginningBalance: React.FC<TableBeginningBalanceProps> = ({
  data,
  onChange,
  searchQuery = '',
  selectedCategory = null,
}) => {
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
    const cleanNumbers = rawString.replace(/\D/g, '');
    const numValue = cleanNumbers ? parseInt(cleanNumbers, 10) : 0;
    const oppositeField = field === 'debit' ? 'credit' : 'debit';

    const updated = data.map((acc) => {
      if (acc.id === accountId || (acc as any)._id === accountId) {
        return {
          ...acc,
          [field]: numValue,
          // Auto-mutual exclusion: automatically clear opposite side when typing a value > 0
          [oppositeField]: numValue > 0 ? 0 : acc[oppositeField] || 0,
        };
      }
      return acc;
    });

    onChange(updated);
  };

  const handleClearRow = (accountId: string) => {
    const updated = data.map((acc) => {
      if (acc.id === accountId || (acc as any)._id === accountId) {
        return {
          ...acc,
          debit: 0,
          credit: 0,
        };
      }
      return acc;
    });
    onChange(updated);
  };

  const columns = [
    {
      accessor: 'accountNumber',
      title: (
        <Text fw={700} fz={13} c="dark.8">
          Kode Akun
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
        <Text fw={700} fz={13} c="dark.8">
          Nama Akun & Posisi Normal
        </Text>
      ),
      render: (item: JournalAccounts) => {
        const isSub = Number(item.level) > 1 || item.level === 'sub';
        const normalDebit = isNormalDebit(item.category?.name, item.category?.isDebit);

        return (
          <Stack gap={3}>
            <Group gap="xs" wrap="nowrap">
              <Text fw={isSub ? 500 : 700} fz={14} c="dark.8">
                {item.name}
              </Text>
              {!isSub && (
                <Badge size="xs" variant="light" color="indigo" radius="sm">
                  Induk
                </Badge>
              )}
            </Group>
            <Group gap={6} wrap="wrap" align="center">
              <Text size="xs" c="dimmed">
                {item.category?.name || 'Buku Besar'}
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
                Disarankan: {normalDebit ? 'Debit' : 'Kredit'}
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
          <Text fw={700} fz={13} c="dark.8">
            Debit (Rp)
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
              placeholder={normalDebit ? '0 (Disarankan)' : '0'}
              size="xs"
              radius="md"
              leftSection={
                <Text size="xs" fw={600} c={hasVal ? 'teal.7' : normalDebit ? 'teal.6' : 'dimmed'}>
                  Rp
                </Text>
              }
              value={hasVal ? numberFormat(debitVal) : ''}
              onChange={(e) =>
                handleValueChange(item.id || (item as any)._id, 'debit', e.target.value)
              }
              styles={{
                root: {
                  width: '100%',
                },
                input: {
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  fontWeight: hasVal ? 700 : 400,
                  fontSize: 13,
                  color: hasVal ? 'var(--mantine-color-teal-8)' : 'inherit',
                  backgroundColor: hasVal
                    ? 'var(--mantine-color-teal-0)'
                    : normalDebit
                      ? '#FFFFFF'
                      : '#F8FAFC',
                  borderColor: hasVal
                    ? 'var(--mantine-color-teal-5)'
                    : normalDebit
                      ? 'var(--mantine-color-teal-2)'
                      : 'var(--mantine-color-gray-3)',
                  boxShadow: normalDebit ? '0 1px 2px rgba(0,0,0,0.02)' : 'none',
                  transition: 'all 150ms ease',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-teal-6)',
                    backgroundColor: '#FFFFFF',
                  },
                },
              }}
            />
            {isContraFilled && (
              <Badge size="xs" color="orange" variant="light" radius="xs">
                Sisi Kontra
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
          <Text fw={700} fz={13} c="dark.8">
            Kredit (Rp)
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
              placeholder={isNormalCredit ? '0 (Disarankan)' : '0'}
              size="xs"
              radius="md"
              leftSection={
                <Text size="xs" fw={600} c={hasVal ? 'red.7' : isNormalCredit ? 'red.6' : 'dimmed'}>
                  Rp
                </Text>
              }
              value={hasVal ? numberFormat(creditVal) : ''}
              onChange={(e) =>
                handleValueChange(item.id || (item as any)._id, 'credit', e.target.value)
              }
              styles={{
                root: {
                  width: '100%',
                },
                input: {
                  textAlign: 'right',
                  fontFamily: 'monospace',
                  fontWeight: hasVal ? 700 : 400,
                  fontSize: 13,
                  color: hasVal ? 'var(--mantine-color-red-8)' : 'inherit',
                  backgroundColor: hasVal
                    ? 'var(--mantine-color-red-0)'
                    : isNormalCredit
                      ? '#FFFFFF'
                      : '#F8FAFC',
                  borderColor: hasVal
                    ? 'var(--mantine-color-red-5)'
                    : isNormalCredit
                      ? 'var(--mantine-color-red-2)'
                      : 'var(--mantine-color-gray-3)',
                  boxShadow: isNormalCredit ? '0 1px 2px rgba(0,0,0,0.02)' : 'none',
                  transition: 'all 150ms ease',
                  '&:focus': {
                    borderColor: 'var(--mantine-color-red-6)',
                    backgroundColor: '#FFFFFF',
                  },
                },
              }}
            />
            {isContraFilled && (
              <Badge size="xs" color="orange" variant="light" radius="xs">
                Sisi Kontra
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
          <Tooltip label="Kosongkan Baris Ini">
            <ActionIcon
              variant="subtle"
              color="gray"
              size="sm"
              radius="md"
              onClick={() => handleClearRow(item.id || (item as any)._id)}
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
      noRecordsText="Tidak ada akun yang sesuai dengan filter atau kata kunci pencarian."
      emptyState={
        <EmptyState
          title="Tidak ada data akun yang tersedia"
          imageSrc={defaultEmptyImage}
          imageAlt="Data akun kosong"
        />
      }
    />
  );
};

export default TableBeginningBalance;
