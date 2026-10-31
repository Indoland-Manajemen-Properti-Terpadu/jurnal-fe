import React, { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Checkbox,
  Group,
  Pagination,
  Paper,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconEye,
  IconPaperclip,
  IconReceipt,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1 } from '@/utils/FormatDate';
import { PettyCashVoucher, VoucherStatus } from '@/module/petty-cash/domain/pettyCashTypes';
import EmptyState from '@/components/EmptyState/EmptyState';
import { useTranslation } from '@/i18n';

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

  const getStatusBadge = (status: VoucherStatus) => {
    switch (status) {
      case 'DRAFT':
        return (
          <Badge color="gray" variant="light" size="xs">
            {t('pettyCashStatusDraft')}
          </Badge>
        );
      case 'APPROVED':
        return (
          <Badge color="blue" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
            {t('pettyCashStatusApproved')}
          </Badge>
        );
      case 'PAID':
      case 'PENDING_REIMBURSE':
        return (
          <Badge color="blue" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
            {t('pettyCashStatusPaid')}
          </Badge>
        );
      case 'REIMBURSEMENT_PENDING':
        return (
          <Badge color="orange" variant="light" size="xs" leftSection={<IconClock size={10} />}>
            {t('pettyCashStatusReplenishing')}
          </Badge>
        );
      case 'REIMBURSED':
        return (
          <Badge color="teal" variant="light" size="xs" leftSection={<IconCheck size={10} />}>
            {t('pettyCashStatusReimbursed')}
          </Badge>
        );
      case 'VOID':
        return (
          <Badge color="red" variant="light" size="xs" leftSection={<IconX size={10} />}>
            {t('pettyCashStatusVoid')}
          </Badge>
        );
      case 'SUBMITTED':
        return (
          <Badge color="blue" variant="light" size="xs">
            {t('pettyCashStatusSubmitted')}
          </Badge>
        );
      case 'REJECTED':
        return (
          <Badge color="red" variant="light" size="xs">
            {t('pettyCashStatusRejected')}
          </Badge>
        );
      default:
        return <Badge size="xs">{status}</Badge>;
    }
  };

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
                paginatedVouchers.map((voucher) => {
                  const isChecked = selectedVoucherIds.includes(voucher.id);

                  return (
                    <Table.Tr
                      key={voucher.id}
                      style={{
                        backgroundColor: isChecked ? 'var(--mantine-color-primary-0)' : undefined,
                      }}
                    >
                      {onToggleVoucherSelect && (
                        <Table.Td style={{ textAlign: 'center' }}>
                          <Checkbox
                            checked={isChecked}
                            onChange={() => onToggleVoucherSelect(voucher.id)}
                            aria-label={`${t('pettyCashSelect')} ${voucher.voucherNumber}`}
                          />
                        </Table.Td>
                      )}

                      {/* Voucher Number & Receipt */}
                      <Table.Td>
                        <Group gap={6} align="center" wrap="nowrap">
                          <Anchor
                            component="button"
                            type="button"
                            fz={13}
                            fw={700}
                            c="primary.9"
                            ff="monospace"
                            onClick={() => onViewVoucherDetail(voucher)}
                          >
                            {voucher.voucherNumber}
                          </Anchor>
                          {voucher.attachmentName && (
                            <Tooltip label={`${t('pettyCashEvidence')}: ${voucher.attachmentName}`}>
                              <ThemeIcon size={20} radius="xl" variant="light" color="gray">
                                <IconPaperclip size={11} />
                              </ThemeIcon>
                            </Tooltip>
                          )}
                        </Group>
                      </Table.Td>

                      {/* Date */}
                      <Table.Td>
                        <Text fz={12} c="dark.7">
                          {dateFormatV1(voucher.date)}
                        </Text>
                      </Table.Td>

                      {/* Beneficiary & Fund */}
                      <Table.Td>
                        <Text fz={13} fw={600} c="dark.9" lineClamp={1}>
                          {voucher.beneficiary}
                        </Text>
                        <Text fz={11} c="dimmed" lineClamp={1}>
                          {voucher.fundName}
                        </Text>
                      </Table.Td>

                      {/* Expense Account */}
                      <Table.Td>
                        <Badge
                          variant="light"
                          color="gray"
                          radius="sm"
                          size="xs"
                          ff="monospace"
                          mb={2}
                        >
                          {voucher.expenseAccount.code}
                        </Badge>
                        <Text fz={12} c="dark.8" lineClamp={1}>
                          {voucher.expenseAccount.name}
                        </Text>
                      </Table.Td>

                      {/* Description */}
                      <Table.Td>
                        <Text fz={12} c="dark.7" lineClamp={2}>
                          {voucher.description}
                        </Text>
                      </Table.Td>

                      {/* Amount */}
                      <Table.Td style={{ textAlign: 'right' }}>
                        <Text
                          fz={13}
                          fw={700}
                          c="dark.8"
                          ff="monospace"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatCurrency(voucher.amount)}
                        </Text>
                      </Table.Td>

                      {/* Status */}
                      <Table.Td style={{ textAlign: 'center' }}>
                        {getStatusBadge(voucher.status)}
                      </Table.Td>

                      {/* Action */}
                      <Table.Td style={{ textAlign: 'center' }}>
                        <Tooltip label={t('pettyCashViewVoucher')}>
                          <ActionIcon
                            variant="subtle"
                            color="primary"
                            size="sm"
                            onClick={() => onViewVoucherDetail(voucher)}
                          >
                            <IconEye size={15} />
                          </ActionIcon>
                        </Tooltip>
                      </Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      {/* Pagination */}
      {totalPages > 1 && (
        <Group justify="space-between" align="center">
          <Text size="xs" c="dimmed">
            Halaman {page} dari {totalPages}
          </Text>
          <Pagination value={page} onChange={setPage} total={totalPages} size="sm" radius="md" />
        </Group>
      )}
    </Stack>
  );
};

export default VoucherTable;
