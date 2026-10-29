import React from 'react';
import {
  ActionIcon,
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
  Skeleton,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconCopy,
  IconNotebook,
  IconPaperclip,
  IconPrinter,
  IconTrash,
  IconX,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useDisclosure } from '@mantine/hooks';
import AppShellLayout from '@/components/AppShellLayout';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1, dateFormatTimeZone } from '@/utils/FormatDate';
import { useDetailTransaction } from '../hooks/useDetailTransaction';
import { useDeleteJournalTransaction } from '../services/DeleteTransactionAccount.service';
import JournalTransactionDetailTable from '../components/TableTransactionJournal/JournalTransactionDetailTable';
import FileAttachments from '../components/FileAttachment';
import DeleteTransactionModal from '../../Main/components/DeleteTransactionModal';

/** View tolerance: a journal reads as balanced when debit and credit differ by less than 0.01. */
export const isDetailBalanced = (totalDebit: number, totalCredit: number): boolean =>
  Math.abs(totalDebit - totalCredit) < 0.01;

export const JournalTransactionDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { idTransaction } = useParams<{ idTransaction: string }>();
  const { detailTransaction, isError, isLoading } = useDetailTransaction(idTransaction!);
  const [deleteOpened, { open: openDelete, close: closeDelete }] = useDisclosure(false);
  const deleteMutation = useDeleteJournalTransaction();

  const handleConfirmDelete = () => {
    if (!idTransaction) return;
    deleteMutation.mutate(idTransaction, {
      onSuccess: () => {
        closeDelete();
        navigate(routes.generalJournal.main);
      },
    });
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculate totals for summary cards
  const transactionDetails = detailTransaction?.transactionDetail || [];
  const totalDebit = transactionDetails.reduce((sum, item) => sum + (Number(item.debit) || 0), 0);
  const totalCredit = transactionDetails.reduce((sum, item) => sum + (Number(item.credit) || 0), 0);
  const isBalanced = isDetailBalanced(totalDebit, totalCredit);

  if (isLoading) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Stack gap="lg">
            <Skeleton height={50} radius="md" />
            <Skeleton height={140} radius="lg" />
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

  if (isError || !detailTransaction) {
    return (
      <AppShellLayout>
        <Box p={{ base: 'md', sm: 'xl' }}>
          <Paper withBorder p="xl" radius="lg" ta="center" bg="white">
            <Avatar size={64} radius="xl" color="red" variant="light" mx="auto" mb="md">
              <IconX size={32} />
            </Avatar>
            <Title order={3} c="dark.8">
              Transaksi Jurnal Tidak Ditemukan
            </Title>
            <Text c="dimmed" size="sm" mt="xs" mb="lg">
              Data transaksi jurnal ini mungkin telah dihapus atau ID transaksi tidak valid di
              sistem.
            </Text>
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => navigate(routes.generalJournal.main)}
            >
              Kembali ke Jurnal Umum
            </Button>
          </Paper>
        </Box>
      </AppShellLayout>
    );
  }

  const transactionNumberStr = String(detailTransaction.transactionNumber ?? '-');

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {/* Top Bar Navigation & Actions (Consistent with SaleDetailPage & ProductDetailPage) */}
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
                onClick={() => navigate(-1)}
              >
                Kembali
              </Button>

              <Group gap="xs">
                <Button
                  variant="default"
                  leftSection={<IconPrinter size={16} />}
                  onClick={handlePrint}
                >
                  Cetak Jurnal
                </Button>

                <Button
                  variant="outline"
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  loading={deleteMutation.isPending}
                  onClick={openDelete}
                >
                  Hapus Transaksi
                </Button>
              </Group>
            </Group>
          </Paper>

          {/* Hero Voucher Banner (Identical layout structure to SaleDetailPage & ProductDetailPage) */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'md', sm: 'xl' }}
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-white) 65%, var(--mantine-color-secondary-0) 100%)',
            }}
          >
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
                  <IconNotebook size={40} />
                </Avatar>

                <Box>
                  <Group gap="xs" align="center" wrap="wrap">
                    <Title order={2} fz={{ base: 22, sm: 26 }} c="primary.9">
                      Transaksi Jurnal #{transactionNumberStr}
                    </Title>

                    {detailTransaction.transactionNumber && (
                      <CopyButton value={transactionNumberStr}>
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Tersalin' : 'Salin Nomor Transaksi'}>
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
                    )}

                    <Badge
                      size="md"
                      radius="sm"
                      color={isBalanced ? 'teal' : 'red'}
                      variant="light"
                      leftSection={
                        isBalanced ? <IconCheck size={12} /> : <IconAlertTriangle size={12} />
                      }
                    >
                      {isBalanced ? 'Seimbang' : 'Tidak Seimbang'}
                    </Badge>

                    <Badge size="md" radius="sm" variant="outline" color="gray">
                      {detailTransaction.transactionType || 'DEFAULT'}
                    </Badge>
                  </Group>

                  <Group gap="md" mt={8} wrap="wrap">
                    <Text size="sm" c="dimmed">
                      Tanggal:{' '}
                      <Text span fw={600} c="dark.8">
                        {detailTransaction.transactionDate
                          ? dateFormatV1(detailTransaction.transactionDate.toString())
                          : '—'}
                      </Text>
                    </Text>

                    <Text size="sm" c="dimmed">
                      Entitas / Lokasi:{' '}
                      <Text span fw={600} c="dark.8">
                        {detailTransaction.site?.name || 'Kantor Pusat'}
                      </Text>
                    </Text>

                    {detailTransaction.tags && detailTransaction.tags !== '-' && (
                      <Text size="sm" c="dimmed">
                        Tag:{' '}
                        <Text span fw={600} c="dark.8">
                          {detailTransaction.tags}
                        </Text>
                      </Text>
                    )}

                    <Text size="sm" c="dimmed">
                      ID Sistem:{' '}
                      <Text span fw={500} c="dark.6" ff="monospace">
                        {detailTransaction.id}
                      </Text>
                    </Text>
                  </Group>
                </Box>
              </Group>
            </Group>
          </Paper>

          {/* 2-Column Content Grid (Matches SaleDetailPage exactly) */}
          <Grid gutter="lg">
            {/* Left 8 Cols: Detail Table & Memo */}
            <Grid.Col span={{ base: 12, md: 8 }}>
              <Stack gap="lg">
                {/* 1. Rincian Pos Akun Jurnal */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="md">
                    <Text fw={700} size="md" c="primary.9">
                      Rincian Pos Jurnal
                    </Text>
                    <Badge size="sm" variant="light" color="primary">
                      {transactionDetails.length} Pos Akun
                    </Badge>
                  </Group>

                  <JournalTransactionDetailTable
                    transactionDetails={detailTransaction.transactionDetail}
                    isLoading={isLoading}
                    withBorder={false}
                  />
                </Card>

                {/* 2. Catatan & Memo Transaksi */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="md" c="primary.9" mb="xs">
                    Catatan / Memo Transaksi
                  </Text>
                  <Box
                    p="sm"
                    style={{
                      backgroundColor: 'var(--mantine-color-gray-0)',
                      borderRadius: 8,
                      minHeight: 72,
                    }}
                  >
                    <Text
                      size="sm"
                      c={
                        detailTransaction.notes && detailTransaction.notes !== '-'
                          ? 'dark.8'
                          : 'dimmed'
                      }
                    >
                      {detailTransaction.notes && detailTransaction.notes !== '-'
                        ? detailTransaction.notes
                        : 'Tidak ada catatan khusus yang dilampirkan untuk transaksi jurnal ini.'}
                    </Text>
                  </Box>
                </Card>
              </Stack>
            </Grid.Col>

            {/* Right 4 Cols: Ringkasan Finansial, Audit, Lampiran */}
            <Grid.Col span={{ base: 12, md: 4 }}>
              <Stack gap="lg">
                {/* 1. Ringkasan Finansial */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="md" c="dark.8" mb="sm">
                    Ringkasan Finansial
                  </Text>
                  <Divider mb="sm" />

                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Total Debit
                      </Text>
                      <Text
                        size="sm"
                        fw={700}
                        c="teal.8"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(totalDebit)}
                      </Text>
                    </Group>

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Total Kredit
                      </Text>
                      <Text
                        size="sm"
                        fw={700}
                        c="red.8"
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(totalCredit)}
                      </Text>
                    </Group>

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Selisih Keseimbangan
                      </Text>
                      <Text
                        size="sm"
                        fw={700}
                        c={isBalanced ? 'teal.7' : 'red.7'}
                        style={{ fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatCurrency(Math.abs(totalDebit - totalCredit))}
                      </Text>
                    </Group>
                  </Stack>
                </Card>

                {/* 2. Informasi Entitas & Audit */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Text fw={700} size="md" c="dark.8" mb="sm">
                    Informasi Entitas & Audit
                  </Text>
                  <Divider mb="sm" />

                  <Stack gap="xs">
                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Entitas / Proyek
                      </Text>
                      <Text size="sm" fw={600} c="dark.8">
                        {detailTransaction.site?.name || 'Kantor Pusat'}
                      </Text>
                    </Group>

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Tanggal Transaksi
                      </Text>
                      <Text size="sm" fw={600} c="dark.8">
                        {detailTransaction.transactionDate
                          ? dateFormatV1(detailTransaction.transactionDate.toString())
                          : '—'}
                      </Text>
                    </Group>

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Tag Transaksi
                      </Text>
                      <div>
                        {detailTransaction.tags && detailTransaction.tags !== '-' ? (
                          <Badge size="xs" variant="light" color="primary">
                            {detailTransaction.tags}
                          </Badge>
                        ) : (
                          <Text size="sm" c="dimmed">
                            —
                          </Text>
                        )}
                      </div>
                    </Group>

                    <Group justify="space-between" align="center">
                      <Text size="sm" c="dimmed">
                        Waktu Dibuat
                      </Text>
                      <Text size="xs" c="dark.7">
                        {detailTransaction.createdAt
                          ? dateFormatTimeZone(detailTransaction.createdAt)
                          : '—'}
                      </Text>
                    </Group>

                    {detailTransaction.updatedAt && (
                      <Group justify="space-between" align="center">
                        <Text size="sm" c="dimmed">
                          Diperbarui
                        </Text>
                        <Text size="xs" c="dark.7">
                          {dateFormatTimeZone(detailTransaction.updatedAt)}
                        </Text>
                      </Group>
                    )}
                  </Stack>
                </Card>

                {/* 3. Dokumen Lampiran */}
                <Card withBorder radius="md" p="lg" bg="white">
                  <Group justify="space-between" align="center" mb="sm">
                    <Group gap="xs">
                      <IconPaperclip size={18} color="var(--mantine-color-primary-6)" />
                      <Text fw={700} size="md" c="dark.8">
                        Dokumen Bukti
                      </Text>
                    </Group>
                    <Badge size="sm" variant="light" color="primary">
                      {(detailTransaction.attachments || []).length} Berkas
                    </Badge>
                  </Group>
                  <Divider mb="sm" />

                  <FileAttachments attachments={detailTransaction.attachments} />
                </Card>
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      {/* Delete Confirmation Modal */}
      <DeleteTransactionModal
        opened={deleteOpened}
        onClose={closeDelete}
        onDelete={handleConfirmDelete}
      />
    </AppShellLayout>
  );
};

export default JournalTransactionDetailPage;
