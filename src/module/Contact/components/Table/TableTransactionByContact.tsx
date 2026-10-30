import React from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  CopyButton,
  Group,
  Menu,
  Pagination,
  Paper,
  Select,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconClock,
  IconCopy,
  IconDotsVertical,
  IconEye,
  IconNotebook,
  IconReceipt2,
} from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { EmptyState } from '@/components/EmptyState';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales/domain/sale';
import { getSaleStatusConfig } from '@/module/sales/domain/saleFormat';

type TableTransactionByContactProps = {
  transactions: Sale[];
  isLoading: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
};

export const TableTransactionByContact: React.FC<TableTransactionByContactProps> = ({
  transactions,
  isLoading,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('contactDetail');
  const locale = currentLanguage === 'id' ? 'id-ID' : 'en-US';
  const formatDateValue = (value?: string | null) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', year: 'numeric' }).format(
          date
        );
  };
  const formatAmount = (value: number) =>
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(value);

  if (isLoading) {
    return (
      <Paper withBorder radius="md" p="md" bg="white">
        <Table verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>{t('table.number')}</Table.Th>
              <Table.Th>{t('table.dates')}</Table.Th>
              <Table.Th>{t('table.items')}</Table.Th>
              <Table.Th ta="center">{t('table.status')}</Table.Th>
              <Table.Th ta="right">{t('table.total')}</Table.Th>
              <Table.Th ta="right">{t('table.remaining')}</Table.Th>
              <Table.Th ta="center">{t('table.actions')}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
              // eslint-disable-next-line react/no-array-index-key
              <Table.Tr key={`skeleton-row-${idx}`}>
                <Table.Td>
                  <Skeleton height={16} width="80%" mb={4} />
                  <Skeleton height={12} width="40%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton height={14} width="70%" mb={4} />
                  <Skeleton height={12} width="50%" />
                </Table.Td>
                <Table.Td>
                  <Skeleton height={14} width="85%" />
                </Table.Td>
                <Table.Td ta="center">
                  <Skeleton height={20} width={70} radius="sm" mx="auto" />
                </Table.Td>
                <Table.Td ta="right">
                  <Skeleton height={16} width={80} ml="auto" />
                </Table.Td>
                <Table.Td ta="right">
                  <Skeleton height={16} width={80} ml="auto" />
                </Table.Td>
                <Table.Td ta="center">
                  <Skeleton height={24} width={24} radius="sm" mx="auto" />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Paper>
    );
  }

  const startRecord = transactions.length ? (page - 1) * limit + 1 : 0;
  const endRecord = Math.min(page * limit, total);

  return (
    <Paper withBorder radius="md" bg="white" style={{ overflow: 'hidden' }}>
      <Table.ScrollContainer minWidth={760}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th style={{ width: '22%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.number')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '18%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.dates')}
                </Text>
              </Table.Th>
              <Table.Th style={{ width: '24%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.items')}
                </Text>
              </Table.Th>
              <Table.Th ta="center" style={{ width: '12%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.status')}
                </Text>
              </Table.Th>
              <Table.Th ta="right" style={{ width: '12%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.total')}
                </Text>
              </Table.Th>
              <Table.Th ta="right" style={{ width: '12%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.remaining')}
                </Text>
              </Table.Th>
              <Table.Th ta="center" style={{ width: '6%' }}>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                  {t('table.actions')}
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {transactions.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <EmptyState
                    icon={<IconReceipt2 size={36} stroke={1.6} />}
                    title={t('table.emptyTitle')}
                    description={t('table.emptyDescription')}
                  />
                </Table.Td>
              </Table.Tr>
            )}
            {transactions.map((tx) => {
              const statusCfg = getSaleStatusConfig(tx.status);
              const normalizedStatus = String(tx.status || 'DRAFT').toUpperCase();
              const statusKey = `table.saleStatus.${normalizedStatus}`;
              const translatedStatus = t(statusKey);
              const statusLabel =
                translatedStatus === statusKey ? t('table.unknownStatus') : translatedStatus;
              const isOverdue =
                tx.remainingAmount > 0 && tx.dueDate && new Date(tx.dueDate).getTime() < Date.now();

              const firstItemWithJournal = tx.items?.find((i) => Boolean(i.journalTransaction));
              const journalTxId =
                firstItemWithJournal?.journalTransaction ||
                (tx as any).journalTransaction ||
                tx.journalId ||
                tx.transactionId;

              return (
                <Table.Tr
                  key={tx.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => navigate(routes.sales.detail.replace(':id', tx.id))}
                >
                  {/* 1. Transaction Number */}
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap" align="center">
                      <ThemeIcon size={28} radius="md" variant="light" color="primary">
                        <IconReceipt2 size={16} />
                      </ThemeIcon>
                      <Box style={{ minWidth: 0 }}>
                        <Group gap={4} wrap="nowrap" align="center">
                          <Anchor
                            component={Link}
                            to={routes.sales.detail.replace(':id', tx.id)}
                            size="sm"
                            fw={700}
                            c="primary.9"
                            onClick={(event) => event.stopPropagation()}
                          >
                            {tx.transactionNumber}
                          </Anchor>
                          <CopyButton value={tx.transactionNumber}>
                            {({ copied, copy }) => (
                              <Tooltip label={copied ? t('copied') : t('table.copyNumber')}>
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color={copied ? 'teal' : 'gray'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    copy();
                                  }}
                                  aria-label={t('table.copyNumber')}
                                >
                                  {copied ? <IconCheck size={11} /> : <IconCopy size={11} />}
                                </ActionIcon>
                              </Tooltip>
                            )}
                          </CopyButton>
                        </Group>

                        {tx.customerRefNumber && (
                          <Text size="xs" c="dimmed">
                            {t('table.reference')}: {tx.customerRefNumber}
                          </Text>
                        )}
                      </Box>
                    </Group>
                  </Table.Td>

                  {/* 2. Tanggal Transaksi & Jatuh Tempo */}
                  <Table.Td>
                    <Text size="xs" fw={600} c="dark.8">
                      {formatDateValue(tx.transactionDate)}
                    </Text>
                    <Group gap={4} mt={2}>
                      <IconClock
                        size={12}
                        color={
                          isOverdue ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-6)'
                        }
                      />
                      <Text size="xs" c={isOverdue ? 'red.7' : 'dimmed'} fw={isOverdue ? 600 : 400}>
                        {formatDateValue(tx.dueDate)}
                      </Text>
                    </Group>
                  </Table.Td>

                  {/* 3. Items Summary */}
                  <Table.Td>
                    <Text size="xs" fw={500} c="dark.8" lineClamp={1}>
                      {tx.items && tx.items.length > 0
                        ? tx.items
                            .map((i) => i.product?.name || i.description || t('table.item'))
                            .join(', ')
                        : '—'}
                    </Text>
                    <Group gap={4} mt={2}>
                      <Badge size="xs" variant="outline" color="gray">
                        {t('table.productCount', { count: tx.items?.length || 0 })}
                      </Badge>

                      {journalTxId && (
                        <Anchor
                          size="xs"
                          c="primary.8"
                          fw={600}
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              routes.generalJournal.detailTransactionJournal.replace(
                                ':idTransaction',
                                journalTxId
                              )
                            );
                          }}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          <IconNotebook size={12} />
                          {t('table.journal')}
                        </Anchor>
                      )}
                    </Group>
                  </Table.Td>

                  {/* 4. Status */}
                  <Table.Td ta="center">
                    <Stack gap={2} align="center">
                      <Badge
                        size="sm"
                        radius="sm"
                        color={statusCfg.color}
                        variant={statusCfg.variant || 'light'}
                      >
                        {statusLabel}
                      </Badge>
                      {isOverdue && (
                        <Badge size="xs" color="red" variant="filled">
                          {t('status.OVERDUE')}
                        </Badge>
                      )}
                    </Stack>
                  </Table.Td>

                  {/* 5. Total Tagihan */}
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      fw={700}
                      c="primary.9"
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAmount(tx.finalAmount)}
                    </Text>
                    {tx.paidAmount > 0 && (
                      <Text size="xs" c="teal.7" style={{ fontVariantNumeric: 'tabular-nums' }}>
                        {t('status.PAID')}: {formatAmount(tx.paidAmount)}
                      </Text>
                    )}
                  </Table.Td>

                  {/* 6. Sisa Tagihan */}
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      fw={tx.remainingAmount > 0 ? 700 : 400}
                      c={tx.remainingAmount > 0 ? 'orange.8' : 'dimmed'}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAmount(tx.remainingAmount)}
                    </Text>
                  </Table.Td>

                  {/* 7. Action Menu */}
                  <Table.Td
                    ta="center"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <Menu position="bottom-end" shadow="md" withinPortal>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label={t('table.actions')}
                        >
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={14} />}
                          onClick={() => navigate(routes.sales.detail.replace(':id', tx.id))}
                        >
                          {t('table.openInvoice')}
                        </Menu.Item>
                        {journalTxId && (
                          <Menu.Item
                            leftSection={<IconNotebook size={14} />}
                            onClick={() =>
                              navigate(
                                routes.generalJournal.detailTransactionJournal.replace(
                                  ':idTransaction',
                                  journalTxId
                                )
                              )
                            }
                          >
                            {t('table.openJournal')}
                          </Menu.Item>
                        )}
                      </Menu.Dropdown>
                    </Menu>
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      {/* Pagination Footer */}
      <Box p="md" style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}>
        <Group justify="space-between" align="center" wrap="wrap" gap="sm">
          <Group gap="xs" align="center">
            <Text size="xs" c="dimmed">
              {t('table.pagination', { start: startRecord, end: endRecord, total })}
            </Text>
            <Select
              size="xs"
              w={75}
              value={String(limit)}
              onChange={(val) => onLimitChange(Number(val) || 10)}
              data={[
                { value: '5', label: '5' },
                { value: '10', label: '10' },
                { value: '25', label: '25' },
                { value: '50', label: '50' },
              ]}
              aria-label={t('table.pageSize')}
            />
          </Group>

          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Box>
    </Paper>
  );
};

export default TableTransactionByContact;
