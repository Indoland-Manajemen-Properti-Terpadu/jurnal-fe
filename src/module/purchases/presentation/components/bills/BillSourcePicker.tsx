import { Alert, Badge, Checkbox, Group, Paper, Skeleton, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  incompatibility,
  type BillSourceDoc,
  type PickedSource,
} from '@/module/purchases/domain/billSources';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';
import { useBillSources } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface BillSourcePickerProps {
  source: PickedSource;
  picked: BillSourceDoc[];
  onToggle: (doc: BillSourceDoc) => void;
}

/** Receipts or orders ready to be billed; once one is picked only those of the same vendor and term fit. */
export const BillSourcePicker = ({ source, picked, onToggle }: Readonly<BillSourcePickerProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const query = useBillSources(source);
  const docs = query.data ?? [];

  if (query.isLoading) {
    return (
      <Stack gap="xs">
        <Skeleton height={64} radius="md" />
        <Skeleton height={64} radius="md" />
      </Stack>
    );
  }
  if (query.isError) {
    return (
      <Alert color="red" variant="light" radius="md">
        {t('bills.form.sourcesError')}
      </Alert>
    );
  }
  if (docs.length === 0) {
    return (
      <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
        {t(source === 'RECEIPT' ? 'bills.form.noReceipts' : 'bills.form.noOrders')}
      </Alert>
    );
  }

  return (
    <Stack gap="xs">
      {docs.map((doc) => {
        const isPicked = picked.some((item) => item.id === doc.id);
        const blocked = !isPicked ? incompatibility(picked, doc) : null;
        const open = doc.lines.reduce((sum, line) => sum + line.openQty, 0);
        return (
          <Paper
            key={doc.id}
            withBorder
            radius="md"
            p="sm"
            bg={isPicked ? 'var(--mantine-color-primary-0)' : 'white'}
            style={{ opacity: blocked ? 0.55 : 1 }}
          >
            <Group wrap="nowrap" align="flex-start" gap="sm">
              <Checkbox
                mt={2}
                checked={isPicked}
                disabled={blocked !== null}
                aria-label={t('bills.form.pickAria', { number: doc.number })}
                onChange={() => onToggle(doc)}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Group gap={8} wrap="wrap">
                  <Text size="sm" fw={600}>
                    {doc.number}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {doc.vendor.name}
                  </Text>
                  {doc.kind && (
                    <Badge size="xs" radius="sm" variant="light" color="gray">
                      {t(`bills.form.kind${doc.kind}`)}
                    </Badge>
                  )}
                  <Badge size="xs" radius="sm" variant="light">
                    {doc.termName}
                  </Badge>
                </Group>
                <Text size="xs" c="dimmed">
                  {[
                    formatDay(doc.date, currentLanguage),
                    doc.orderNumber,
                    t('bills.form.openQty', { count: formatQuantity(open) }),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </Text>
                {blocked && (
                  <Text size="xs" c="orange.8" mt={2}>
                    {t(`bills.form.blocked.${blocked}`)}
                  </Text>
                )}
              </div>
            </Group>
          </Paper>
        );
      })}
    </Stack>
  );
};
