import { Alert, Button, Divider, Group, Paper, Stack, Text } from '@mantine/core';
import { IconDeviceFloppy, IconScale, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import type { VarianceType } from '@/module/petty-cash/domain/pettyCashEntities';

interface Props {
  counted: number;
  expected: number;
  variance: { amount: number; type: VarianceType };
  pending: boolean;
  showIssues: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
}

const money = (amount: number) => formatCurrency(amount, false);

function Row({
  label,
  value,
  strong,
}: Readonly<{ label: string; value: string; strong?: boolean }>) {
  return (
    <Group justify="space-between" wrap="nowrap" gap="md">
      <Text size="sm" c={strong ? 'dark.9' : 'dimmed'} fw={strong ? 700 : 400}>
        {label}
      </Text>
      <Text size="sm" fw={strong ? 700 : 600} ta="right">
        {value}
      </Text>
    </Group>
  );
}

/** Live result of the count against the books, and the two ways to save it. */
export function CountSummary({
  counted,
  expected,
  variance,
  pending,
  showIssues,
  onCancel,
  onSaveDraft,
  onSubmit,
}: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const noteKey =
    variance.type === 'SHORT'
      ? 'shortNote'
      : variance.type === 'OVER'
        ? 'overNote'
        : 'balancedNote';

  return (
    <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
      <Stack gap="sm">
        <Text fw={700}>{t('countForm.summaryTitle')}</Text>
        <Row label={t('countForm.counted')} value={money(counted)} />
        <Row label={t('countForm.expected')} value={money(expected)} />
        <Text size="xs" c="dimmed">
          {t('countForm.expectedNote')}
        </Text>
        <Divider />
        <Row label={t('countForm.variance')} value={money(Math.abs(variance.amount))} strong />
        <Alert
          variant="light"
          color={variance.type === 'BALANCED' ? 'teal' : 'orange'}
          radius="md"
          icon={<IconScale size={16} />}
        >
          {t(`countForm.${noteKey}`, { amount: money(Math.abs(variance.amount)) })}
        </Alert>
        {showIssues && (
          <Text size="sm" c="red.7" role="alert">
            {t('countForm.fixIssues')}
          </Text>
        )}
        <Stack gap="xs" mt="xs">
          <Button
            leftSection={<IconSend size={16} />}
            loading={pending}
            onClick={onSubmit}
            fullWidth
          >
            {t('countForm.submit')}
          </Button>
          <Button
            variant="default"
            leftSection={<IconDeviceFloppy size={16} />}
            disabled={pending}
            onClick={onSaveDraft}
            fullWidth
          >
            {t('countForm.saveDraft')}
          </Button>
          <Button variant="subtle" color="gray" disabled={pending} onClick={onCancel} fullWidth>
            {t('countForm.cancel')}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
