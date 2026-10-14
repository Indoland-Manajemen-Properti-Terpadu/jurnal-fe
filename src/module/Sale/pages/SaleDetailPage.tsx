import { useState } from 'react';
import {
  ActionIcon,
  Anchor,
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CopyButton,
  Divider,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowUpRight,
  IconCalendar,
  IconCheck,
  IconClock,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconFileText,
  IconLink,
  IconMail,
  IconMapPin,
  IconNotebook,
  IconPaperclip,
  IconPhone,
  IconReceipt2,
  IconTag,
  IconUser,
  IconX,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { PaySaleModal } from '../components/PaySaleModal';
import {
  useCreateSalePayment,
  useDownloadInvoicePdf,
  useGenerateInvoiceLink,
  useSaleDetail,
} from '../hooks/useSaleQueries';
import type { CreateSalePaymentPayload } from '../types/sale';
import { formatDate, formatDateTime, formatIDR, getSaleStatusConfig } from '../utils/saleFormat';

export function SaleDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [payModalOpened, setPayModalOpened] = useState(false);

  // Queries & Mutations
  const { data: sale, isLoading, isError, refetch } = useSaleDetail(id);
  const payMutation = useCreateSalePayment(id);
  const generateLinkMutation = useGenerateInvoiceLink();
  const downloadPdfMutation = useDownloadInvoicePdf();

  const handlePaySubmit = async (payload: CreateSalePaymentPayload) => {
    await payMutation.mutateAsync(payload);
    setPayModalOpened(false);
    refetch();
  };

  const handleGenerateLink = async () => {
    if (!sale) return;
    await generateLinkMutation.mutateAsync(sale.id);
    refetch();
  };

  const handleDownloadPdf = async () => {
    if (!sale) return;
    await downloadPdfMutation.mutateAsync({
      id: sale.id,
      filename: `Faktur-${sale.transactionNumber.replace(/[/\\?%*:|"<>]/g, '_')}.pdf`,
    });
  };

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={160} radius="lg" />
            <Grid gutter="lg">
              <Grid.Col span={{ base: 12, md: 8 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
              <Grid.Col span={{ base: 12, md: 4 }}>
                <Skeleton height={350} radius="md" />
              </Grid.Col>
            </Grid>
          </Stack>
        </Box>
      </AppShellLayout>
    );
  }

  if (isError || !sale) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
            <ThemeIcon size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={32} />
            </ThemeIcon>
            <Title order={3} c="dark.8">
              Faktur Penjualan Tidak Ditemukan
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              Data faktur mungkin telah dihapus atau ID transaksi tidak valid di sistem.
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.sales.main)}
            >
              Kembali ke Daftar Penjualan
            </Button>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const statusCfg = getSaleStatusConfig(sale.status);
  const isOverdue =
    sale.remainingAmount > 0 &&
    sale.dueDate &&
    new Date(sale.dueDate).getTime() < Date.now();

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'lg' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 60%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<IconArrowLeft size={18} />}
                onClick={() => navigate(routes.sales.main)}
              >
                Kembali ke Daftar Penjualan
              </Button>

              <Group gap="xs">
                <Button
                  variant="default"
                  leftSection={<IconDownload size={16} />}
                  onClick={handleDownloadPdf}
                  loading={downloadPdfMutation.isPending}
                >
                  Unduh Faktur PDF
                </Button>

                <Button
                  variant="outline"
                  color="blue"
                  leftSection={<IconLink size={16} />}
                  onClick={handleGenerateLink}
                  loading={generateLinkMutation.isPending}
                >
                  {sale.invoiceLink ? 'Salin / Perbarui Tautan' : 'Generate Tautan Invoice'}
                </Button>

                {sale.remainingAmount > 0 && (
                  <Button
                    color="primary"
                    leftSection={<IconReceipt2 size={16} />}
                    onClick={() => setPayModalOpened(true)}
                  >
                    Catat Pembayaran
                  </Button>
                )}
              </Group>
            </Group>
          </Paper>

          {/* Hero Invoice Banner (Enhanced Spatial Layout) */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
              boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Stack gap="md">
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="lg">
                <Group gap="lg" align="flex-start">
                  <Avatar
                    size={84}
                    radius="md"
                    color="primary"
                    variant="light"
                    style={{
                      border: '2px solid var(--mantine-color-gray-2)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    }}
                  >
                    <IconReceipt2 size={40} />
                  </Avatar>

                  <Box>
                    <Group gap="xs" align="center" wrap="wrap">
                      <Title order={2} fz={{ base: 22, sm: 28 }} c="primary.9" fw={800}>
                        {sale.transactionNumber}
                      </Title>

                      <CopyButton value={sale.transactionNumber}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Tersalin' : 'Salin Nomor Faktur'}>
                            <ActionIcon
                              variant="subtle"
                              color={copied ? 'teal' : 'gray'}
                              size="sm"
                              onClick={copy}
                            >
                              {copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>

                      <Badge
                        size="md"
                        radius="sm"
                        color={statusCfg.color}
                        variant={statusCfg.variant || 'light'}
                        fw={700}
                      >
                        {statusCfg.label}
                      </Badge>

                      {isOverdue && (
                        <Badge size="md" color="red" variant="filled" radius="sm">
                          Lewat Jatuh Tempo
                        </Badge>
                      )}

                      {sale.customerRefNumber && (
                        <Badge size="md" radius="sm" variant="outline" color="gray">
                          Ref: {sale.customerRefNumber}
                        </Badge>
                      )}
                    </Group>

                    {/* Metadata chips with clear icons */}
                    <Group gap="md" mt={10} wrap="wrap">
                      <Group gap={6} align="center">
                        <ThemeIcon size={20} radius="xl" variant="light" color="gray">
                          <IconUser size={12} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Pelanggan: <Text span fw={700} c="dark.8">{sale.customer?.displayName || '—'}</Text>
                        </Text>
                      </Group>

                      <Group gap={6} align="center">
                        <ThemeIcon size={20} radius="xl" variant="light" color="gray">
                          <IconCalendar size={12} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Tanggal: <Text span fw={600} c="dark.8">{formatDate(sale.transactionDate)}</Text>
                        </Text>
                      </Group>

                      <Group gap={6} align="center">
                        <ThemeIcon size={20} radius="xl" variant="light" color={isOverdue ? 'red' : 'gray'}>
                          <IconClock size={12} />
                        </ThemeIcon>
                        <Text size="sm" c="dimmed">
                          Jatuh Tempo: <Text span fw={600} c={isOverdue ? 'red.7' : 'dark.8'}>{formatDate(sale.dueDate)}</Text>
                        </Text>
                      </Group>

                      {sale.paymentTerm && (
                        <Group gap={6} align="center">
                          <ThemeIcon size={20} radius="xl" variant="light" color="gray">
                            <IconNotebook size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="dimmed">
                            Termin: <Text span fw={600} c="dark.8">{sale.paymentTerm.name}</Text>
                          </Text>
                        </Group>
                      )}
                    </Group>
                  </Box>
                </Group>

                {/* Financial Summary Pill on Hero */}
                <Paper
                  withBorder
                  p="md"
                  radius="md"
                  bg="white"
                  style={{
                    minWidth: 260,
                    boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                    border: '1px solid var(--mantine-color-gray-2)',
                  }}
                >
                  <Stack gap={4} ta={{ base: 'left', sm: 'right' }}>
                    <Text size="xs" c="dimmed" fw={700} tt="uppercase" lts={0.5}>
                      Total Tagihan Akhir
                    </Text>
                    <Text fz={26} fw={800} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
                      {formatIDR(sale.finalAmount)}
                    </Text>
                    <Group gap="xs" justify="flex-end" wrap="wrap" mt={2}>
                      <Badge size="sm" variant="light" color="teal">
                        Lunas: {formatIDR(sale.paidAmount)}
                      </Badge>
                      <Badge
                        size="sm"
                        variant="light"
                        color={sale.remainingAmount > 0 ? 'orange' : 'teal'}
                      >
                        Sisa: {formatIDR(sale.remainingAmount)}
                      </Badge>
                    </Group>
                  </Stack>
                </Paper>
              </Group>

              {/* Public Invoice Link Interactive Pill */}
              {sale.invoiceLink && (
                <Paper
                  withBorder
                  radius="md"
                  p="sm"
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.05)',
                    borderColor: 'var(--mantine-color-teal-2)',
                  }}
                >
                  <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                    <Group gap="xs" wrap="nowrap" style={{ minWidth: 0, flex: 1 }}>
                      <ThemeIcon size={28} radius="md" color="teal" variant="light">
                        <IconLink size={16} />
                      </ThemeIcon>
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Text size="xs" fw={700} c="teal.9">
                          Tautan Faktur Publik Online Aktif
                        </Text>
                        <Text size="xs" c="dimmed" ff="monospace" truncate>
                          {sale.invoiceLink}
                        </Text>
                      </Box>
                    </Group>

                    <Group gap="xs" wrap="nowrap">
                      <Button
                        size="xs"
                        variant="subtle"
                        color="teal"
                        leftSection={<IconExternalLink size={14} />}
                        onClick={() => window.open(sale.invoiceLink!, '_blank')}
                      >
                        Buka Faktur
                      </Button>
                      <CopyButton value={sale.invoiceLink} timeout={2000}>
                        {({ copied, copy }) => (
                          <Button
                            size="xs"
                            variant="light"
                            color={copied ? 'teal' : 'primary'}
                            leftSection={copied ? <IconCheck size={14} /> : <IconCopy size={14} />}
                            onClick={copy}
                          >
                            {copied ? 'Tersalin!' : 'Salin Tautan'}
                          </Button>
                        )}
                      </CopyButton>
                    </Group>
                  </Group>
                </Paper>
              )}
            </Stack>
          </Paper>

          {/* Detail Content Grid */}
          <Grid gutter="lg">
            {/* Left 8 Cols: Items & Calculations Breakdown */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* 1. Rincian Item Penjualan */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs">
                      <ThemeIcon size={28} radius="md" color="primary" variant="light">
                        <IconReceipt2 size={16} />
                      </ThemeIcon>
                      <Text fw={700} size="md" c="primary.9">
                        Rincian Barang / Jasa
                      </Text>
                    </Group>
                    <Badge size="sm" variant="light" color="primary">
                      {sale.items.length} Item
                    </Badge>
                  </Group>

                  <Table.ScrollContainer minWidth={600}>
                    <Table verticalSpacing="sm" highlightOnHover>
                      <Table.Thead bg="gray.0">
                        <Table.Tr>
                          <Table.Th style={{ width: '45%' }}>Produk / Deskripsi</Table.Th>
                          <Table.Th ta="center" style={{ width: '10%' }}>Qty</Table.Th>
                          <Table.Th ta="right" style={{ width: '15%' }}>Harga Satuan</Table.Th>
                          <Table.Th ta="center" style={{ width: '15%' }}>Pajak</Table.Th>
                          <Table.Th ta="right" style={{ width: '15%' }}>Total</Table.Th>
                        </Table.Tr>
                      </Table.Thead>
                      <Table.Tbody>
                        {sale.items.map((item, idx) => (
                          <Table.Tr key={item.id || `item-${idx}`}>
                            <Table.Td>
                              <Group gap="xs" align="center" wrap="nowrap">
                                {item.product?.id ? (
                                  <Anchor
                                    size="sm"
                                    fw={600}
                                    c="primary.9"
                                    onClick={() =>
                                      navigate(
                                        routes.baseModules.productDetail.replace(
                                          ':id',
                                          item.product!.id
                                        )
                                      )
                                    }
                                    style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                                  >
                                    {item.product.name}
                                    <IconArrowUpRight size={13} style={{ opacity: 0.7 }} />
                                  </Anchor>
                                ) : (
                                  <Text size="sm" fw={600} c="dark.8">
                                    {item.product?.name || item.description || '—'}
                                  </Text>
                                )}
                              </Group>

                              {item.product?.productCode && (
                                <Badge size="xs" variant="outline" color="gray" mt={2}>
                                  {item.product.productCode}
                                </Badge>
                              )}

                              {item.description && item.product?.name && (
                                <Text size="xs" c="dimmed" mt={2}>
                                  {item.description}
                                </Text>
                              )}

                              {/* Button: Link to Journal Transaction */}
                              <Group gap={4} mt={6}>
                                <Button
                                  size="compact-xs"
                                  variant="subtle"
                                  color="primary"
                                  leftSection={<IconNotebook size={13} />}
                                  onClick={() => {
                                    const txId =
                                      item.journalTransaction ||
                                      item.journalId ||
                                      item.transactionId ||
                                      sale.journalId ||
                                      sale.transactionId ||
                                      sale.id;
                                    navigate(
                                      routes.generalJournal.detailTransactionJournal.replace(
                                        ':idTransaction',
                                        txId
                                      )
                                    );
                                  }}
                                >
                                  Lihat Jurnal Transaksi
                                </Button>
                              </Group>
                            </Table.Td>
                            <Table.Td ta="center">
                              <Text size="sm" fw={600} c="dark.8">
                                {item.quantity}
                              </Text>
                            </Table.Td>
                            <Table.Td ta="right">
                              <Text size="sm" c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatIDR(item.unitPrice)}
                              </Text>
                            </Table.Td>
                            <Table.Td ta="center">
                              {item.tax?.name ? (
                                <Badge size="xs" variant="light" color="blue">
                                  {item.tax.name}
                                </Badge>
                              ) : (
                                <Text size="xs" c="dimmed">—</Text>
                              )}
                            </Table.Td>
                            <Table.Td ta="right">
                              <Text size="sm" fw={700} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {formatIDR(item.amount)}
                              </Text>
                            </Table.Td>
                          </Table.Tr>
                        ))}
                      </Table.Tbody>
                    </Table>
                  </Table.ScrollContainer>

                  {/* Calculations breakdown footer (Revamped Spatial Calculation Panel) */}
                  <Paper
                    withBorder
                    p="md"
                    radius="md"
                    mt="md"
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-0)',
                      borderColor: 'var(--mantine-color-gray-2)',
                    }}
                  >
                    <Stack gap="xs">
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed">Subtotal Barang & Jasa</Text>
                        <Text size="sm" fw={600} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatIDR(sale.subtotal)}
                        </Text>
                      </Group>

                      {sale.discountAmount && sale.discountAmount > 0 ? (
                        <Group justify="space-between" align="center">
                          <Group gap={6}>
                            <Text size="sm" c="dimmed">Potongan Diskon</Text>
                            <Badge size="xs" color="red" variant="light">
                              {sale.discountType === 'percentage' ? `${sale.discountValue}%` : 'Nominal'}
                            </Badge>
                          </Group>
                          <Text size="sm" fw={600} c="red.7" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            -{formatIDR(sale.discountAmount)}
                          </Text>
                        </Group>
                      ) : null}

                      {sale.taxAmount && sale.taxAmount > 0 ? (
                        <Group justify="space-between" align="center">
                          <Group gap={6}>
                            <Text size="sm" c="dimmed">Pajak Pertambahan Nilai (PPN)</Text>
                            <Badge size="xs" color="blue" variant="light">PPN</Badge>
                          </Group>
                          <Text size="sm" fw={600} c="dark.8" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            +{formatIDR(sale.taxAmount)}
                          </Text>
                        </Group>
                      ) : null}

                      {sale.withholdingAmount && sale.withholdingAmount > 0 ? (
                        <Group justify="space-between" align="center">
                          <Group gap={6}>
                            <Text size="sm" c="dimmed">
                              Pajak Penghasilan (PPh) {sale.withholdingAccount?.name ? `· ${sale.withholdingAccount.name}` : ''}
                            </Text>
                            <Badge size="xs" color="orange" variant="light">PPh</Badge>
                          </Group>
                          <Text size="sm" fw={600} c="red.7" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            -{formatIDR(sale.withholdingAmount)}
                          </Text>
                        </Group>
                      ) : null}

                      <Divider my={4} />

                      {/* Highlighted Net Final Invoice Row */}
                      <Paper
                        p="xs"
                        radius="sm"
                        style={{
                          backgroundColor: 'var(--mantine-color-primary-0)',
                          border: '1px solid var(--mantine-color-primary-2)',
                        }}
                      >
                        <Group justify="space-between" align="center">
                          <div>
                            <Text size="sm" fw={800} c="primary.9">
                              Total Tagihan Bersih
                            </Text>
                            <Text size="xs" c="primary.7">
                              Total akhir faktur yang ditagihkan
                            </Text>
                          </div>
                          <Text size="xl" fw={800} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
                            {formatIDR(sale.finalAmount)}
                          </Text>
                        </Group>
                      </Paper>

                      <Group justify="space-between" align="center" mt={2}>
                        <Group gap={6}>
                          <ThemeIcon size={20} radius="xl" color="teal" variant="light">
                            <IconCheck size={12} />
                          </ThemeIcon>
                          <Text size="sm" c="teal.8" fw={600}>
                            Total Pembayaran Diterima
                          </Text>
                        </Group>
                        <Text size="sm" c="teal.8" fw={700} style={{ fontVariantNumeric: 'tabular-nums' }}>
                          {formatIDR(sale.paidAmount)}
                        </Text>
                      </Group>

                      <Group justify="space-between" align="center">
                        <Group gap={6}>
                          <ThemeIcon
                            size={20}
                            radius="xl"
                            color={sale.remainingAmount > 0 ? 'orange' : 'teal'}
                            variant="light"
                          >
                            {sale.remainingAmount > 0 ? <IconClock size={12} /> : <IconCheck size={12} />}
                          </ThemeIcon>
                          <Text
                            size="sm"
                            c={sale.remainingAmount > 0 ? 'orange.8' : 'teal.8'}
                            fw={700}
                          >
                            Sisa Tagihan
                          </Text>
                        </Group>
                        <Text
                          size="md"
                          c={sale.remainingAmount > 0 ? 'orange.8' : 'teal.8'}
                          fw={800}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatIDR(sale.remainingAmount)}
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                </Card>

                {/* 2. Pesan & Memo */}
                {(sale.message || sale.memo) && (
                  <Card withBorder radius="md" p="lg" bg="white">
                    <Text fw={700} size="md" c="primary.9" mb="md">
                      Pesan & Catatan
                    </Text>
                    <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                      {sale.message && (
                        <Paper withBorder p="sm" radius="md">
                          <Text size="xs" c="dimmed" fw={600}>Pesan untuk Pelanggan</Text>
                          <Text size="sm" c="dark.8" mt={4}>{sale.message}</Text>
                        </Paper>
                      )}
                      {sale.memo && (
                        <Paper withBorder p="sm" radius="md" bg="gray.0">
                          <Text size="xs" c="dimmed" fw={600}>Memo Internal</Text>
                          <Text size="sm" c="dark.8" mt={4}>{sale.memo}</Text>
                        </Paper>
                      )}
                    </SimpleGrid>
                  </Card>
                )}
              </Stack>
            </Grid.Col>

            {/* Right 4 Cols: Customer, Tags, Audit & Lampiran */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                {/* 1. Profil Pelanggan */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group gap="xs" mb="md">
                    <ThemeIcon size={32} radius="md" color="primary" variant="light">
                      <IconUser size={18} />
                    </ThemeIcon>
                    <Box>
                      <Text fw={700} size="md" c="primary.9">Profil Pelanggan</Text>
                      <Text size="xs" c="dimmed">Detail entitas penerima tagihan</Text>
                    </Box>
                  </Group>

                  <Stack gap="sm">
                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>Nama</Text>
                      <Text size="sm" fw={700} c="dark.8" mt={2}>
                        {sale.customer?.displayName || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>Email Penagihan</Text>
                      <Text size="sm" fw={500} c="dark.8" mt={2}>
                        {sale.emails?.[0] || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>Alamat Penagihan (Billing)</Text>
                      <Text size="sm" fw={500} c="dark.8" mt={2} lh={1.4}>
                        {sale.billingAddress || sale.customer?.billingAddress || '—'}
                      </Text>
                    </Paper>

                    <Paper withBorder p="sm" radius="md">
                      <Text size="xs" c="dimmed" fw={600}>Termin Pembayaran</Text>
                      <Text size="sm" fw={600} c="dark.8" mt={2}>
                        {sale.paymentTerm?.name || '—'}
                      </Text>
                    </Paper>
                  </Stack>
                </Card>

                {/* 2. Section Tags (New Section Added right after Customer Info) */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="sm">
                    <Group gap="xs">
                      <ThemeIcon size={32} radius="md" color="indigo" variant="light">
                        <IconTag size={18} />
                      </ThemeIcon>
                      <Box>
                        <Text fw={700} size="md" c="dark.8">Tag & Kategori</Text>
                        <Text size="xs" c="dimmed">Label klasifikasi transaksi</Text>
                      </Box>
                    </Group>
                    <Badge size="sm" variant="light" color="indigo">
                      {sale.tags?.length || 0} Tag
                    </Badge>
                  </Group>

                  <Divider mb="sm" />

                  {sale.tags && sale.tags.length > 0 ? (
                    <Group gap="xs" wrap="wrap">
                      {sale.tags.map((tag, idx) => (
                        <Badge
                          key={tag.id || tag.name || idx}
                          size="md"
                          radius="sm"
                          variant="light"
                          color="indigo"
                          leftSection={<IconTag size={12} />}
                          style={{ textTransform: 'none', fontWeight: 600 }}
                        >
                          {tag.name}
                        </Badge>
                      ))}
                    </Group>
                  ) : (
                    <Box p="xs" ta="center" bg="gray.0" style={{ borderRadius: 6 }}>
                      <Text size="xs" c="dimmed">
                        Belum ada tag yang disematkan pada faktur ini.
                      </Text>
                    </Box>
                  )}
                </Card>

                {/* 3. Dokumen Lampiran (if any) */}
                {sale.attachments && sale.attachments.length > 0 && (
                  <Card withBorder radius="md" p="lg" bg="white">
                    <Group justify="space-between" align="center" mb="sm">
                      <Group gap="xs">
                        <ThemeIcon size={32} radius="md" color="teal" variant="light">
                          <IconPaperclip size={18} />
                        </ThemeIcon>
                        <Box>
                          <Text fw={700} size="md" c="dark.8">Dokumen Lampiran</Text>
                          <Text size="xs" c="dimmed">Berkas bukti pendukung</Text>
                        </Box>
                      </Group>
                      <Badge size="sm" variant="light" color="teal">
                        {sale.attachments.length} Berkas
                      </Badge>
                    </Group>

                    <Divider mb="sm" />

                    <Stack gap="xs">
                      {sale.attachments.map((att, idx) => {
                        const fileUrl = att.filePath?.startsWith('http')
                          ? att.filePath
                          : `/${att.filePath?.replace(/^\//, '')}`;
                        return (
                          <Paper key={att.id || idx} withBorder p="xs" radius="sm">
                            <Group justify="space-between" align="center" wrap="nowrap">
                              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                                <IconFileText size={18} color="var(--mantine-color-primary-6)" />
                                <Text size="xs" fw={600} truncate maw={180}>
                                  {att.fileName || 'Lampiran'}
                                </Text>
                              </Group>
                              {att.filePath && (
                                <ActionIcon
                                  size="xs"
                                  variant="subtle"
                                  color="primary"
                                  onClick={() => window.open(fileUrl, '_blank')}
                                >
                                  <IconDownload size={14} />
                                </ActionIcon>
                              )}
                            </Group>
                          </Paper>
                        );
                      })}
                    </Stack>
                  </Card>
                )}

                {/* 4. Audit & Teknis */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="sm" c="primary.9" mb="md">
                    Rincian Audit & Teknis
                  </Text>
                  <Stack gap="sm">
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">ID Sistem (MongoDB)</Text>
                      <Group gap={4}>
                        <Text size="xs" ff="monospace" c="dark.7">{sale.id}</Text>
                        <CopyButton value={sale.id} timeout={2000}>
                          {({ copied, copy }) => (
                            <ActionIcon size="xs" variant="subtle" color={copied ? 'teal' : 'gray'} onClick={copy}>
                              {copied ? <IconCheck size={12} /> : <IconCopy size={12} />}
                            </ActionIcon>
                          )}
                        </CopyButton>
                      </Group>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Dibuat Pada</Text>
                      <Text size="xs" fw={500} c="dark.8">{formatDateTime(sale.createdAt)}</Text>
                    </Group>
                    <Divider />
                    <Group justify="space-between">
                      <Text size="xs" c="dimmed">Terakhir Diperbarui</Text>
                      <Text size="xs" fw={500} c="dark.8">{formatDateTime(sale.updatedAt)}</Text>
                    </Group>
                  </Stack>
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      {/* Pay Modal */}
      <PaySaleModal
        opened={payModalOpened}
        sale={sale}
        isSubmitting={payMutation.isPending}
        onClose={() => setPayModalOpened(false)}
        onSubmit={handlePaySubmit}
      />
    </AppShellLayout>
  );
}

export default SaleDetailPage;
