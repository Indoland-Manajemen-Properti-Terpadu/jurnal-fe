import { useNavigate } from 'react-router-dom';
import { ActionIcon, Badge, Button, Group, Stack, Table, Text, Tooltip } from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PendingChangeItem } from '../../domain/pendingChange';
import { formatDateTime } from '../../domain/pendingChangeFormat';
import {
  isDeletionChange,
  isFineChange,
  isPaymentChange,
  parseChangeNotes,
} from '../../domain/pendingChangeRules';
import { canApprove } from '../../domain/pendingChangeStatus';
import PendingChangeDetails from './PendingChangeDetails';

type PendingChangeRowProps = {
  change: PendingChangeItem;
  isApproving: boolean;
  onApprove: (change: PendingChangeItem) => void;
};

export default function PendingChangeRow({
  change,
  isApproving,
  onApprove,
}: PendingChangeRowProps) {
  const navigate = useNavigate();
  const { t, currentLanguage } = useTranslation('pendingChanges');

  const isFine = isFineChange(change);
  const isPayment = isPaymentChange(change);
  const isDelete = isDeletionChange(change);
  const isSale = change.referenceModel === 'Sale';
  const { invoiceNo, customerCode, description } = parseChangeNotes(change.notes);

  const badgeColor = isDelete ? 'red' : isFine ? 'orange' : isPayment ? 'teal' : 'blue';
  const badgeLabel = isDelete
    ? t('badgeDeletion')
    : isFine
      ? t('badgeFine')
      : isPayment
        ? t('badgePayment')
        : change.type;

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={4}>
          <Group gap={6} align="center" wrap="nowrap">
            <Badge
              color={badgeColor}
              variant="light"
              size="xs"
              radius="sm"
              style={{ fontWeight: 700 }}
            >
              {badgeLabel}
            </Badge>

            {customerCode && (
              <Badge size="xs" variant="outline" color="gray" radius="sm">
                {customerCode}
              </Badge>
            )}
          </Group>

          <Group gap={6} align="center">
            {invoiceNo ? (
              <Text
                size="sm"
                fw={700}
                c={isSale ? 'primary.7' : 'dark.8'}
                style={{
                  cursor: isSale ? 'pointer' : 'default',
                  textDecoration: isSale ? 'underline' : 'none',
                  textUnderlineOffset: 2,
                }}
                onClick={() => {
                  if (isSale) {
                    navigate(`/sales/${change.referenceId}`);
                  }
                }}
              >
                {invoiceNo}
              </Text>
            ) : (
              <Text size="sm" fw={700} c="dark.8">
                {change.referenceModel}
              </Text>
            )}

            {isSale && (
              <Tooltip label={t('openInvoice')}>
                <ActionIcon
                  size="xs"
                  color="primary"
                  variant="subtle"
                  onClick={() => navigate(`/sales/${change.referenceId}`)}
                >
                  <IconArrowRight size={13} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        </Stack>
      </Table.Td>

      <Table.Td>
        {description ? (
          <Text size="xs" c="dark.7" lh={1.45} style={{ maxWidth: 360 }}>
            {description}
          </Text>
        ) : (
          <Text size="xs" c="dimmed" fs="italic">
            —
          </Text>
        )}
      </Table.Td>

      <Table.Td>
        <PendingChangeDetails change={change} />
      </Table.Td>

      <Table.Td>
        <Stack gap={2}>
          <Text size="xs" fw={600} c="dark.8">
            {formatDateTime(change.createdAt, currentLanguage)}
          </Text>
          {change.updatedAt && change.updatedAt !== change.createdAt && (
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t('updatedPrefix')} {formatDateTime(change.updatedAt, currentLanguage)}
            </Text>
          )}
        </Stack>
      </Table.Td>

      <Table.Td style={{ textAlign: 'center' }}>
        {canApprove(change.status) ? (
          <Button
            size="xs"
            color="primary"
            radius="md"
            leftSection={<IconCheck size={14} />}
            onClick={() => onApprove(change)}
            loading={isApproving}
          >
            {t('approveBtn')}
          </Button>
        ) : (
          <Badge
            color="teal"
            variant="light"
            size="sm"
            radius="md"
            leftSection={<IconCheck size={12} stroke={3} />}
            style={{
              backgroundColor: 'var(--mantine-color-emerald-0)',
              color: 'var(--mantine-color-emerald-7)',
              border: '1px solid var(--mantine-color-emerald-2)',
              fontWeight: 700,
            }}
          >
            {t('statusApproved')}
          </Badge>
        )}
      </Table.Td>
    </Table.Tr>
  );
}
