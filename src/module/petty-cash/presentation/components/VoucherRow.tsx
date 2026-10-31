import React from 'react';
import {
  ActionIcon,
  Anchor,
  Badge,
  Checkbox,
  Group,
  Table,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconEye, IconPaperclip } from '@tabler/icons-react';
import { formatCurrency } from '@/utils/formatCurrency';
import { dateFormatV1 } from '@/utils/formatDate';
import { PettyCashVoucher } from '@/module/petty-cash/domain/pettyCashTypes';
import { useTranslation } from '@/i18n';

import { VoucherStatusBadge } from '@/module/petty-cash/presentation/components/VoucherStatusBadge';

interface VoucherRowProps {
  voucher: PettyCashVoucher;
  isChecked: boolean;
  onToggleSelect?: (voucherId: string) => void;
  onView: (voucher: PettyCashVoucher) => void;
}

export const VoucherRow: React.FC<VoucherRowProps> = ({
  voucher,
  isChecked,
  onToggleSelect,
  onView,
}) => {
  const { t } = useTranslation('journal');

  return (
    <Table.Tr
      style={{
        backgroundColor: isChecked ? 'var(--mantine-color-primary-0)' : undefined,
      }}
    >
      {onToggleSelect && (
        <Table.Td style={{ textAlign: 'center' }}>
          <Checkbox
            checked={isChecked}
            onChange={() => onToggleSelect(voucher.id)}
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
            onClick={() => onView(voucher)}
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
        <Badge variant="light" color="gray" radius="sm" size="xs" ff="monospace" mb={2}>
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
        <VoucherStatusBadge status={voucher.status} />
      </Table.Td>

      {/* Action */}
      <Table.Td style={{ textAlign: 'center' }}>
        <Tooltip label={t('pettyCashViewVoucher')}>
          <ActionIcon variant="subtle" color="primary" size="sm" onClick={() => onView(voucher)}>
            <IconEye size={15} />
          </ActionIcon>
        </Tooltip>
      </Table.Td>
    </Table.Tr>
  );
};
