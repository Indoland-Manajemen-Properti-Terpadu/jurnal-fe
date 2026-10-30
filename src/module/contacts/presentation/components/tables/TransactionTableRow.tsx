import {
  ActionIcon,
  Anchor,
  Badge,
  Box,
  CopyButton,
  Group,
  Menu,
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
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales';
import { getSaleStatusConfig } from '@/module/sales/domain/saleFormat';
import { resolveSaleJournalId } from '@/module/contacts/domain/contactTransactions';

type Props = {
  transaction: Sale;
  formatDateValue: (value?: string | null) => string;
  formatAmount: (value: number) => string;
};

export function TransactionTableRow({
  transaction: tx,
  formatDateValue,
  formatAmount,
}: Readonly<Props>) {
  const navigate = useNavigate();
  const { t } = useTranslation('contactDetail');

  const statusCfg = getSaleStatusConfig(tx.status);
  const normalizedStatus = String(tx.status || 'DRAFT').toUpperCase();
  const statusKey = `table.saleStatus.${normalizedStatus}`;
  const translatedStatus = t(statusKey);
  const statusLabel = translatedStatus === statusKey ? t('table.unknownStatus') : translatedStatus;
  const isOverdue =
    tx.remainingAmount > 0 && tx.dueDate && new Date(tx.dueDate).getTime() < Date.now();
  const journalTxId = resolveSaleJournalId(tx);

  const openJournal = (journalId: string) =>
    navigate(routes.generalJournal.detailTransactionJournal.replace(':idTransaction', journalId));

  return (
    <Table.Tr
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
            color={isOverdue ? 'var(--mantine-color-red-6)' : 'var(--mantine-color-gray-6)'}
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
            ? tx.items.map((i) => i.product?.name || i.description || t('table.item')).join(', ')
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
                openJournal(journalTxId);
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
        <Text size="sm" fw={700} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
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
            <ActionIcon variant="subtle" color="gray" size="sm" aria-label={t('table.actions')}>
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
                onClick={() => openJournal(journalTxId)}
              >
                {t('table.openJournal')}
              </Menu.Item>
            )}
          </Menu.Dropdown>
        </Menu>
      </Table.Td>
    </Table.Tr>
  );
}
