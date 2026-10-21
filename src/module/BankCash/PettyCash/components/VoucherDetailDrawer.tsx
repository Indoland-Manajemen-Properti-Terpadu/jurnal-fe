import { ActionIcon, Anchor, Box, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconDownload, IconFileText, IconPaperclip, IconUserCheck } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/FormatCurrency';
import { dateFormatV1 } from '@/utils/FormatDate';
import type { PettyCashVoucher } from '../types/pettyCash.types';
import classes from './PettyCashOverlay.module.css';

interface Props {
  opened: boolean;
  onClose: () => void;
  voucher: PettyCashVoucher | null;
}

const STATUS_LABELS: Record<PettyCashVoucher['status'], string> = {
  DRAFT: 'Draf',
  SUBMITTED: 'Diajukan',
  APPROVED: 'Disetujui',
  PAID: 'Sudah dibayar',
  PENDING_REIMBURSE: 'Belum diajukan',
  REIMBURSEMENT_PENDING: 'Menunggu pengisian kembali',
  REIMBURSED: 'Sudah diganti',
  REJECTED: 'Ditolak',
  VOID: 'Dibatalkan',
};

export function VoucherDetailDrawer({ opened, onClose, voucher }: Props) {
  if (!voucher) return null;

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      position="right"
      size={480}
      padding={0}
      classNames={{ body: classes.drawerBody, header: classes.drawerHeader }}
      title={
        <Box>
          <Text fw={650} fz="md" c="dark.9">
            Rincian voucher
          </Text>
          <Text fz="xs" c="dimmed" mt={2}>
            {voucher.voucherNumber}
          </Text>
        </Box>
      }
    >
      <Stack className={classes.drawerContent} gap="xl">
        <Box className={classes.amountBlock}>
          <Group justify="space-between" align="flex-end" gap="md">
            <Box>
              <Text size="xs" c="dimmed" mb={6}>
                Nilai pengeluaran
              </Text>
              <Text className={classes.amount}>{formatCurrency(voucher.amount)}</Text>
            </Box>
            <Box className={classes.status} mb={5}>
              <span className={classes.statusDot} aria-hidden="true" />
              {STATUS_LABELS[voucher.status]}
            </Box>
          </Group>
          <Text fz="xs" c="dimmed" mt="sm">
            {dateFormatV1(voucher.date)}
          </Text>
        </Box>

        <Box component="dl" className={classes.detailList}>
          <div className={classes.detailRow}>
            <dt>Dana kas kecil</dt>
            <dd>{voucher.fundName}</dd>
          </div>
          <div className={classes.detailRow}>
            <dt>Penerima</dt>
            <dd>{voucher.beneficiary}</dd>
          </div>
          <div className={classes.detailRow}>
            <dt>Akun beban</dt>
            <dd>
              <Text span c="dimmed" fw={500} mr={6}>
                {voucher.expenseAccount.code}
              </Text>
              {voucher.expenseAccount.name}
            </dd>
          </div>
          <div className={classes.detailRow}>
            <dt>No. bukti</dt>
            <dd>{voucher.receiptNumber || 'Tidak dicantumkan'}</dd>
          </div>
        </Box>

        <Box>
          <Text fz="xs" c="dimmed" mb={7}>
            Keperluan
          </Text>
          <Text fz="sm" c="dark.8" lh={1.65}>
            {voucher.description}
          </Text>
        </Box>

        {voucher.attachmentName && (
          <Box className={classes.attachment}>
            <IconPaperclip size={17} color="var(--mantine-color-gray-6)" />
            <Box style={{ minWidth: 0, flex: 1 }}>
              <Text fz="xs" fw={600} truncate>
                {voucher.attachmentName}
              </Text>
              <Text fz={11} c="dimmed">
                Bukti pengeluaran
              </Text>
            </Box>
            <ActionIcon variant="subtle" color="primary" aria-label="Unduh lampiran">
              <IconDownload size={17} />
            </ActionIcon>
          </Box>
        )}

        <Box>
          <Group gap={8} mb="xs">
            <IconFileText size={17} color="var(--mantine-color-gray-6)" />
            <Text fz="sm" fw={650}>
              Pencatatan akuntansi
            </Text>
          </Group>
          <Text fz="xs" c="dimmed" lh={1.55}>
            Voucher ini menjadi dasar jurnal saat pengisian kembali dicairkan. Belum ada jurnal baru
            yang diposting dari halaman ini.
          </Text>
        </Box>

        <Box className={classes.audit}>
          <IconUserCheck size={17} />
          <Box>
            <Text fz="xs" c="dimmed">
              Dicatat oleh
            </Text>
            <Text fz="sm" fw={600} c="dark.8">
              {voucher.createdBy}
            </Text>
            {voucher.approvedBy && (
              <Text fz="xs" c="dimmed" mt={6}>
                Diverifikasi oleh {voucher.approvedBy}
                {voucher.approvedAt ? `, ${dateFormatV1(voucher.approvedAt)}` : ''}
              </Text>
            )}
          </Box>
        </Box>

        <Anchor component="button" type="button" size="sm" onClick={onClose} ta="left">
          Tutup rincian
        </Anchor>
      </Stack>
    </Drawer>
  );
}

export default VoucherDetailDrawer;
