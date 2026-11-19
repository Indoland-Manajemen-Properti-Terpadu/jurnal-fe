import { Group, Paper, Radio, Stack, Text } from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { useTranslation } from '@/i18n';
import type { Sale } from '@/module/sales/domain/sale';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { ReturnSettlement } from '@/module/sales/domain/saleReturn';
import {
  splitReturn,
  type ReturnEstimate,
  type ReturnFormValues,
} from '@/module/sales/domain/saleReturnForm';

interface ReturnStepSettlementProps {
  form: UseFormReturnType<ReturnFormValues>;
  sale: Sale;
  estimate: ReturnEstimate;
}

const Row = ({ label, value }: { label: string; value: number }) => (
  <Group justify="space-between">
    <Text size="sm">{label}</Text>
    <Text size="sm" fw={600} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {formatIDR(value)}
    </Text>
  </Group>
);

/** Step 3: reduce the invoice or keep it as credit, with how the value is shared. */
export function ReturnStepSettlement({
  form,
  sale,
  estimate,
}: Readonly<ReturnStepSettlementProps>) {
  const { t } = useTranslation('salesReturns');
  const split = splitReturn(estimate.total, sale.remainingAmount, form.values.settlement);

  return (
    <Stack gap="md">
      <Radio.Group
        label={t('form.settlement')}
        withAsterisk
        value={form.values.settlement}
        onChange={(value) => form.setFieldValue('settlement', value as ReturnSettlement)}
      >
        <Stack gap="xs" mt="xs">
          {(['REDUCE_INVOICE', 'CUSTOMER_CREDIT'] as const).map((value) => (
            <Paper key={value} withBorder radius="md" p="sm">
              <Radio
                value={value}
                label={t(`settlement.${value}`)}
                description={t(`settlement.${value}_HINT`)}
              />
            </Paper>
          ))}
        </Stack>
      </Radio.Group>
      <Paper radius="md" p="md" bg="gray.0">
        <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
          {t('form.split.title')}
        </Text>
        <Stack gap={6}>
          <Row
            label={t('form.split.reducesInvoice', { invoice: sale.transactionNumber })}
            value={split.reducesInvoice}
          />
          <Row label={t('form.split.becomesCredit')} value={split.becomesCredit} />
          <Text size="xs" c="dimmed" mt={4}>
            {t('form.split.balanceAfter', { amount: formatIDR(split.balanceAfter) })}
          </Text>
        </Stack>
      </Paper>
      <Text size="sm" c="dimmed">
        {t('form.split.issueHint')}
      </Text>
    </Stack>
  );
}
