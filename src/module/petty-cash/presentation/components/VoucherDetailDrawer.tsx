import { ActionIcon, Anchor, Box, Drawer, Group, Stack, Text } from '@mantine/core';
import { IconDownload, IconFileText, IconPaperclip, IconUserCheck } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import type { PettyCashVoucher } from '@/module/petty-cash/domain/pettyCashTypes';
import classes from '@/module/petty-cash/presentation/components/PettyCashOverlay.module.css';

import { useTranslation } from '@/i18n';

interface Props {
  opened: boolean;
  onClose: () => void;
  voucher: PettyCashVoucher | null;
}

const STATUS_LABEL_KEYS: Record<PettyCashVoucher['status'], string> = {
  DRAFT: 'drawer.statusDraft',
  SUBMITTED: 'drawer.statusSubmitted',
  APPROVED: 'drawer.statusApproved',
  PAID: 'drawer.statusPaid',
  PENDING_REIMBURSE: 'drawer.statusPending',
  REIMBURSEMENT_PENDING: 'drawer.statusReplenishing',
  REIMBURSED: 'drawer.statusReimbursed',
  REJECTED: 'drawer.statusRejected',
  VOID: 'drawer.statusVoid',
};

export function VoucherDetailDrawer({ opened, onClose, voucher }: Props) {
  const { t: tp } = useTranslation('pettyCash');
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
            {tp('drawer.title')}
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
                {tp('drawer.amount')}
              </Text>
              <Text className={classes.amount}>{formatCurrency(voucher.amount)}</Text>
            </Box>
            <Box className={classes.status} mb={5}>
              <span className={classes.statusDot} aria-hidden="true" />
              {tp(STATUS_LABEL_KEYS[voucher.status])}
            </Box>
          </Group>
          <Text fz="xs" c="dimmed" mt="sm">
            {dateFormatV1(voucher.date)}
          </Text>
        </Box>

        <Box component="dl" className={classes.detailList}>
          <div className={classes.detailRow}>
            <dt>{tp('drawer.fund')}</dt>
            <dd>{voucher.fundName}</dd>
          </div>
          <div className={classes.detailRow}>
            <dt>{tp('drawer.beneficiary')}</dt>
            <dd>{voucher.beneficiary}</dd>
          </div>
          <div className={classes.detailRow}>
            <dt>{tp('drawer.account')}</dt>
            <dd>
              <Text span c="dimmed" fw={500} mr={6}>
                {voucher.expenseAccount.code}
              </Text>
              {voucher.expenseAccount.name}
            </dd>
          </div>
          <div className={classes.detailRow}>
            <dt>{tp('drawer.receiptNo')}</dt>
            <dd>{voucher.receiptNumber || tp('drawer.notProvided')}</dd>
          </div>
        </Box>

        <Box>
          <Text fz="xs" c="dimmed" mb={7}>
            {tp('common.purpose')}
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
              <Text fz="var(--jurnal-text-xs)" c="dimmed">
                {tp('drawer.evidence')}
              </Text>
            </Box>
            <ActionIcon variant="subtle" color="primary" aria-label={tp('drawer.download')}>
              <IconDownload size={17} />
            </ActionIcon>
          </Box>
        )}

        <Box>
          <Group gap={8} mb="xs">
            <IconFileText size={17} color="var(--mantine-color-gray-6)" />
            <Text fz="sm" fw={650}>
              {tp('drawer.accounting')}
            </Text>
          </Group>
          <Text fz="xs" c="dimmed" lh={1.55}>
            {tp('drawer.accountingNote')}
          </Text>
        </Box>

        <Box className={classes.audit}>
          <IconUserCheck size={17} />
          <Box>
            <Text fz="xs" c="dimmed">
              {tp('drawer.recordedBy')}
            </Text>
            <Text fz="sm" fw={600} c="dark.8">
              {voucher.createdBy}
            </Text>
            {voucher.approvedBy && (
              <Text fz="xs" c="dimmed" mt={6}>
                {tp('drawer.verifiedBy')} {voucher.approvedBy}
                {voucher.approvedAt ? `, ${dateFormatV1(voucher.approvedAt)}` : ''}
              </Text>
            )}
          </Box>
        </Box>

        <Anchor component="button" type="button" size="sm" onClick={onClose} ta="left">
          {tp('drawer.close')}
        </Anchor>
      </Stack>
    </Drawer>
  );
}

export default VoucherDetailDrawer;
