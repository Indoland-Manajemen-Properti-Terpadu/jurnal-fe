import {
  ActionIcon,
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
  Tooltip,
} from '@mantine/core';
import {
  IconCheck,
  IconCopy,
  IconDotsVertical,
  IconDownload,
  IconEye,
  IconLink,
  IconReceipt2,
  IconReceiptOff,
} from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import type { Sale } from '@/module/sales/domain/sale';
import { formatDate, formatIDR, getSaleStatusConfig } from '@/module/sales/domain/saleFormat';

type SaleTableProps = {
  sales: Sale[];
  isLoading?: boolean;
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
  onViewDetail: (sale: Sale) => void;
  onPaySale: (sale: Sale) => void;
  onGenerateLink?: (sale: Sale) => void;
  onDownloadPdf?: (sale: Sale) => void;
  onCreateNew?: () => void;
};

export function SaleTable({
  sales,
  isLoading,
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
  onViewDetail,
  onPaySale,
  onGenerateLink,
  onDownloadPdf,
  onCreateNew,
}: Readonly<SaleTableProps>) {
  return (
    <Stack gap="md">
      <Table.ScrollContainer minWidth={950}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  No. Transaksi
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  Pelanggan
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  Tanggal
                </Text>
              </Table.Th>
              <Table.Th>
                <Text size="xs" fw={700} c="dimmed">
                  Jatuh Tempo
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dimmed">
                  Total Faktur
                </Text>
              </Table.Th>
              <Table.Th ta="right">
                <Text size="xs" fw={700} c="dimmed">
                  Sisa Tagihan
                </Text>
              </Table.Th>
              <Table.Th ta="center">
                <Text size="xs" fw={700} c="dimmed">
                  Status
                </Text>
              </Table.Th>
              <Table.Th ta="center" w={70}>
                <Text size="xs" fw={700} c="dimmed">
                  Aksi
                </Text>
              </Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading && (
              Array.from({ length: Math.min(limit, 5) }).map((_, idx) => (
                // eslint-disable-next-line react/no-array-index-key
                <Table.Tr key={`sale-skeleton-${idx}`}>
                  <Table.Td>
                    <Skeleton height={16} width={130} mb={4} />
                    <Skeleton height={11} width={80} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={16} width={140} mb={4} />
                    <Skeleton height={11} width={110} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} width={90} />
                  </Table.Td>
                  <Table.Td>
                    <Skeleton height={14} width={90} />
                  </Table.Td>
                  <Table.Td ta="right">
                    <Skeleton height={16} width={100} ml="auto" />
                  </Table.Td>
                  <Table.Td ta="right">
                    <Skeleton height={16} width={100} ml="auto" />
                  </Table.Td>
                  <Table.Td ta="center">
                    <Skeleton height={20} width={80} mx="auto" radius="sm" />
                  </Table.Td>
                  <Table.Td ta="center">
                    <Skeleton height={28} width={28} mx="auto" radius="md" />
                  </Table.Td>
                </Table.Tr>
              ))
            )}

            {!isLoading && sales.length === 0 && (
              <Table.Tr>
                <Table.Td colSpan={8} p={0}>
                  <EmptyState
                    icon={<IconReceiptOff size={32} stroke={1.6} />}
                    title="Belum Ada Data Penjualan"
                    description="Tidak ada data penjualan yang cocok dengan filter atau kata kunci pencarian Anda."
                    actionLabel={onCreateNew ? 'Buat Faktur Penjualan' : undefined}
                    onAction={onCreateNew}
                    actionIcon={<IconReceipt2 size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}

            {!isLoading && sales.map((sale) => {
              const statusCfg = getSaleStatusConfig(sale.status);
              const isOverdue =
                sale.remainingAmount > 0 &&
                sale.dueDate &&
                new Date(sale.dueDate).getTime() < Date.now();

              return (
                <Table.Tr
                  key={sale.id}
                  style={{ cursor: 'pointer' }}
                  onClick={() => onViewDetail(sale)}
                >
                  {/* Transaction number */}
                  <Table.Td onClick={(e) => e.stopPropagation()}>
                    <Group gap={6} wrap="nowrap">
                      <Text
                        size="sm"
                        fw={700}
                        c="primary.9"
                        style={{ cursor: 'pointer' }}
                        onClick={() => onViewDetail(sale)}
                      >
                        {sale.transactionNumber}
                      </Text>
                      <CopyButton value={sale.transactionNumber} timeout={2000}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Tersalin' : 'Salin Nomor'} withArrow>
                            <ActionIcon
                              size="xs"
                              variant="subtle"
                              color={copied ? 'teal' : 'gray'}
                              onClick={copy}
                              aria-label="Salin nomor transaksi"
                            >
                              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>
                    {sale.customerRefNumber && (
                      <Text size="xs" c="dimmed">
                        Ref: {sale.customerRefNumber}
                      </Text>
                    )}
                  </Table.Td>

                  {/* Customer */}
                  <Table.Td>
                    <Text size="sm" fw={600} c="dark.8" lineClamp={1}>
                      {sale.customer?.displayName || '—'}
                    </Text>
                    {sale.emails?.[0] && (
                      <Text size="xs" c="dimmed" lineClamp={1}>
                        {sale.emails[0]}
                      </Text>
                    )}
                  </Table.Td>

                  {/* Transaction Date */}
                  <Table.Td>
                    <Text size="sm" c="dark.7">
                      {formatDate(sale.transactionDate)}
                    </Text>
                  </Table.Td>

                  {/* Due Date */}
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={isOverdue ? 700 : 400}
                      c={isOverdue ? 'red.7' : 'dark.7'}
                    >
                      {formatDate(sale.dueDate)}
                    </Text>
                    {isOverdue && (
                      <Badge size="xs" color="red" variant="light">
                        Lewat
                      </Badge>
                    )}
                  </Table.Td>

                  {/* Total */}
                  <Table.Td ta="right">
                    <Text size="sm" fw={700} c="dark.8">
                      {formatIDR(sale.finalAmount)}
                    </Text>
                    {sale.discountAmount && sale.discountAmount > 0 ? (
                      <Text size="xs" c="dimmed">
                        Diskon: -{formatIDR(sale.discountAmount)}
                      </Text>
                    ) : null}
                  </Table.Td>

                  {/* Remaining Amount */}
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      fw={700}
                      c={sale.remainingAmount > 0 ? 'orange.8' : 'teal.8'}
                    >
                      {formatIDR(sale.remainingAmount)}
                    </Text>
                    {sale.paidAmount > 0 && (
                      <Text size="xs" c="teal.7">
                        Terbayar: {formatIDR(sale.paidAmount)}
                      </Text>
                    )}
                  </Table.Td>

                  {/* Status Badge */}
                  <Table.Td ta="center">
                    <Badge
                      size="sm"
                      radius="sm"
                      color={statusCfg.color}
                      variant={statusCfg.variant || 'light'}
                    >
                      {statusCfg.label}
                    </Badge>
                  </Table.Td>

                  {/* Action Menu */}
                  <Table.Td ta="center" onClick={(e) => e.stopPropagation()}>
                    <Menu position="bottom-end" shadow="md" width={180}>
                      <Menu.Target>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          radius="md"
                          aria-label="Aksi Penjualan"
                        >
                          <IconDotsVertical size={16} />
                        </ActionIcon>
                      </Menu.Target>
                      <Menu.Dropdown>
                        <Menu.Item
                          leftSection={<IconEye size={16} />}
                          onClick={() => onViewDetail(sale)}
                        >
                          Lihat Rincian
                        </Menu.Item>
                        {sale.remainingAmount > 0 && (
                          <Menu.Item
                            leftSection={<IconReceipt2 size={16} />}
                            color="primary"
                            onClick={() => onPaySale(sale)}
                          >
                            Catat Pembayaran
                          </Menu.Item>
                        )}
                        {onGenerateLink && (
                          <Menu.Item
                            leftSection={<IconLink size={16} />}
                            onClick={() => onGenerateLink(sale)}
                          >
                            Tautan Invoice
                          </Menu.Item>
                        )}
                        {onDownloadPdf && (
                          <Menu.Item
                            leftSection={<IconDownload size={16} />}
                            onClick={() => onDownloadPdf(sale)}
                          >
                            Unduh Faktur PDF
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
      <Group justify="space-between" align="center" wrap="wrap" px="xs">
        <Text size="xs" c="dimmed">
          Menampilkan {sales.length} dari {total} data faktur
        </Text>
        <Group gap="sm">
          <Select
            size="xs"
            w={110}
            data={[
              { value: '10', label: '10 / hal' },
              { value: '25', label: '25 / hal' },
              { value: '50', label: '50 / hal' },
            ]}
            value={String(limit)}
            onChange={(val) => onLimitChange(Number(val) || 10)}
            aria-label="Baris per halaman"
          />
          <Pagination
            size="sm"
            value={page}
            total={totalPages}
            onChange={onPageChange}
            color="primary"
          />
        </Group>
      </Group>
    </Stack>
  );
}

export default SaleTable;
