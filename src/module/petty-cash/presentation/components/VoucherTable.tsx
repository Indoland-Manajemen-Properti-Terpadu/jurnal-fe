import React, { useState } from 'react';
import {
  ActionIcon,
  Checkbox,
  Group,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconReceipt, IconSearch, IconX } from '@tabler/icons-react';
import { PettyCashVoucher } from '@/module/petty-cash/domain/pettyCashTypes';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';
import { VoucherRow } from '@/module/petty-cash/presentation/components/VoucherRow';

interface Props {
  vouchers: PettyCashVoucher[];
  selectedVoucherIds?: string[];
  onToggleVoucherSelect?: (voucherId: string) => void;
  onSelectAllVouchers?: (selected: boolean) => void;
  onViewVoucherDetail: (voucher: PettyCashVoucher) => void;
  selectedFundFilter?: string;
  onFundFilterChange?: (fundId: string) => void;
  fundOptions?: Array<{ value: string; label: string }>;
}

const PAGE_SIZE = 8;

export const VoucherTable: React.FC<Props> = ({
  vouchers,
  selectedVoucherIds = [],
  onToggleVoucherSelect,
  onSelectAllVouchers,
  onViewVoucherDetail,
  selectedFundFilter = 'all',
  onFundFilterChange,
  fundOptions = [],
}) => {
  const { t: tp } = useTranslation('pettyCash');
  const { t } = useTranslation('journal');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);

  // Filter vouchers
  const filteredVouchers = vouchers.filter((v) => {
    if (selectedFundFilter !== 'all' && v.fundId !== selectedFundFilter) {
      return false;
    }
    if (statusFilter !== 'all' && v.status !== statusFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchNumber = v.voucherNumber.toLowerCase().includes(q);
      const matchBeneficiary = v.beneficiary.toLowerCase().includes(q);
      const matchDesc = v.description.toLowerCase().includes(q);
      const matchAccount = v.expenseAccount.name.toLowerCase().includes(q);
      return matchNumber || matchBeneficiary || matchDesc || matchAccount;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredVouchers.length / PAGE_SIZE) || 1;
  const paginatedVouchers = filteredVouchers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const isAllSelected =
    paginatedVouchers.length > 0 &&
    paginatedVouchers.every((v) => selectedVoucherIds.includes(v.id));

  return (
    <Stack gap="md">
      {/* Search & Filters */}
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" style={{ flex: 1, minWidth: 260 }} wrap="wrap">
          <TextInput
            placeholder={t('pettyCashSearchVoucher')}
            size="sm"
            radius="md"
            leftSection={<IconSearch size={16} />}
            rightSection={
              searchQuery ? (
                <ActionIcon variant="subtle" size="xs" onClick={() => setSearchQuery('')}>
                  <IconX size={12} />
                </ActionIcon>
              ) : null
            }
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setPage(1);
            }}
            style={{ flex: 1, minWidth: 220, maxWidth: 360 }}
          />

          {fundOptions.length > 0 && onFundFilterChange && (
            <Select
              placeholder={t('pettyCashFilterFund')}
              size="sm"
              radius="md"
              data={fundOptions}
              value={selectedFundFilter}
              onChange={(val) => {
                onFundFilterChange(val || 'all');
                setPage(1);
              }}
              style={{ width: 220 }}
            />
          )}

          <Select
            placeholder={t('pettyCashFilterStatus')}
            size="sm"
            radius="md"
            data={[
              { value: 'all', label: t('pettyCashAllStatuses') },
              { value: 'PAID', label: t('pettyCashStatusPaid') },
              { value: 'REIMBURSEMENT_PENDING', label: t('pettyCashStatusReplenishing') },
              { value: 'APPROVED', label: t('pettyCashStatusApproved') },
              { value: 'REIMBURSED', label: t('pettyCashStatusReimbursed') },
              { value: 'DRAFT', label: t('pettyCashStatusDraft') },
            ]}
            value={statusFilter}
            onChange={(val) => {
              setStatusFilter(val || 'all');
              setPage(1);
            }}
            style={{ width: 190 }}
          />
        </Group>

        <Text size="xs" c="dimmed">
          {t('pettyCashShowing')}{' '}
          <Text span fw={700} c="dark.8">
            {filteredVouchers.length}
          </Text>{' '}
          {t('pettyCashExpenseVouchers')}
        </Text>
      </Group>

      {/* Table Frame */}
      <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={850}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {onToggleVoucherSelect && (
                  <Table.Th style={{ width: 40, textAlign: 'center' }}>
                    <Checkbox
                      checked={isAllSelected}
                      indeterminate={
                        paginatedVouchers.some((v) => selectedVoucherIds.includes(v.id)) &&
                        !isAllSelected
                      }
                      onChange={(e) => onSelectAllVouchers?.(e.currentTarget.checked)}
                      aria-label={t('pettyCashSelectAllRows')}
                    />
                  </Table.Th>
                )}
                <Table.Th style={{ width: 170 }}>{t('pettyCashVoucherNumber')}</Table.Th>
                <Table.Th style={{ width: 120 }}>{t('pettyCashDate')}</Table.Th>
                <Table.Th style={{ width: 220 }}>{t('pettyCashBeneficiaryFund')}</Table.Th>
                <Table.Th style={{ width: 220 }}>{t('pettyCashExpenseAccount')}</Table.Th>
                <Table.Th>{t('pettyCashExpenseDescription')}</Table.Th>
                <Table.Th style={{ width: 150, textAlign: 'right' }}>
                  {t('pettyCashAmount')}
                </Table.Th>
                <Table.Th style={{ width: 130, textAlign: 'center' }}>
                  {t('pettyCashStatus')}
                </Table.Th>
                <Table.Th style={{ width: 60, textAlign: 'center' }}>
                  {t('pettyCashAction')}
                </Table.Th>
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {paginatedVouchers.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={onToggleVoucherSelect ? 9 : 8}>
                    <EmptyState
                      icon={<IconReceipt size={32} />}
                      title={t('pettyCashNoVouchers')}
                      description={
                        searchQuery || statusFilter !== 'all'
                          ? t('pettyCashNoFilteredVouchers')
                          : t('pettyCashNoVouchersDescription')
                      }
                    />
                  </Table.Td>
                </Table.Tr>
              ) : (
                paginatedVouchers.map((voucher) => (
                  <VoucherRow
                    key={voucher.id}
                    voucher={voucher}
                    isChecked={selectedVoucherIds.includes(voucher.id)}
                    onToggleSelect={onToggleVoucherSelect}
                    onView={onViewVoucherDetail}
                  />
                ))
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            {tp('common.page')} {page} {tp('common.of')} {totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={totalPages} size="sm" radius="md" />
        </Group>
      )}
    </Stack>
  );
};

export default VoucherTable;
