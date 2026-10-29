import { Badge, Group, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { PendingChangeItem } from '../../domain/pendingChange';
import { formatIDR } from '../../domain/pendingChangeFormat';
import {
  findGenericAmount,
  isDeletionChange,
  isFineChange,
  isPaymentChange,
  visiblePayloadEntries,
} from '../../domain/pendingChangeRules';

type PendingChangeDetailsProps = {
  change: PendingChangeItem;
};

/** Summary of what a change does; the layout depends on the kind of change. */
export default function PendingChangeDetails({ change }: PendingChangeDetailsProps) {
  const { t } = useTranslation('pendingChanges');
  const payload = change.payload || {};

  if (isFineChange(change)) {
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="orange.9" ff="monospace">
          +{formatIDR(payload.newLateFeeAmount ?? payload.amount)}
        </Text>
        <Text fz={11} c="dimmed">
          {t('lateFeeFine')}
        </Text>
      </Stack>
    );
  }

  if (isPaymentChange(change)) {
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="teal.9" ff="monospace">
          {formatIDR(payload.amount)}
        </Text>
        <Group gap={6} wrap="wrap">
          {payload.paymentMethod && (
            <Badge size="xs" variant="light" color="teal">
              {payload.paymentMethod}
            </Badge>
          )}
          {payload.transactionNumber && (
            <Text fz={11} c="dark.6">
              #{payload.transactionNumber}
            </Text>
          )}
        </Group>
      </Stack>
    );
  }

  if (isDeletionChange(change)) {
    return (
      <Stack gap={2}>
        <Badge color="red" variant="light" size="sm" radius="sm">
          {t('detailDeletion')}
        </Badge>
        {payload.originalAmount !== undefined && (
          <Text fz={11} c="dimmed" ff="monospace">
            {t('invoiceAmountLabel')} {formatIDR(payload.originalAmount)}
          </Text>
        )}
        {payload.reason && (
          <Text fz={11} c="dark.7" lineClamp={1}>
            {payload.reason}
          </Text>
        )}
      </Stack>
    );
  }

  const genericAmount = findGenericAmount(change);
  if (genericAmount) {
    return (
      <Stack gap={2}>
        <Text size="sm" fw={800} c="dark.8" ff="monospace">
          {formatIDR(genericAmount.value)}
        </Text>
        <Text fz={11} c="dimmed">
          {payload.description || payload.note || change.type}
        </Text>
      </Stack>
    );
  }

  const entries = visiblePayloadEntries(change);
  if (entries.length === 0) {
    return (
      <Text fz="xs" c="dimmed" fs="italic">
        —
      </Text>
    );
  }

  return (
    <Stack gap={2}>
      {entries.slice(0, 2).map(([key, val]) => (
        <Text key={key} fz={11} c="dark.7" truncate>
          <Text span fw={600} c="dimmed">
            {key}:
          </Text>{' '}
          {typeof val === 'object' ? JSON.stringify(val) : String(val)}
        </Text>
      ))}
      {entries.length > 2 && (
        <Text fz={10} c="dimmed">
          {t('moreFields', { count: entries.length - 2 })}
        </Text>
      )}
    </Stack>
  );
}
