import { useMemo } from 'react';
import {
  Alert,
  Button,
  Grid,
  Group,
  NumberInput,
  Paper,
  Radio,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconCalendar, IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import type { Sale } from '@/module/sales/domain/sale';
import { formatDate, formatIDR } from '@/module/sales/domain/saleFormat';
import { RETURN_REASONS, type ReturnSettlement } from '@/module/sales/domain/saleReturn';
import {
  returnAll,
  validateReturnForm,
  type ReturnFormValues,
} from '@/module/sales/domain/saleReturnForm';
import { useCreateReturn, useUpdateReturn } from '../../hooks/useReturnMutations';

interface ReturnFormBodyProps {
  sale: Sale;
  initial: ReturnFormValues;
  /** Present when editing a draft. */
  returnId?: string;
}

const detailPath = (id: string) => routes.sales.returnDetail.replace(':id', id);

export function ReturnFormBody({ sale, initial, returnId }: Readonly<ReturnFormBodyProps>) {
  const { t } = useTranslation('salesReturns');
  const navigate = useNavigate();
  const form = useForm<ReturnFormValues>({ initialValues: initial });
  const createMutation = useCreateReturn();
  const updateMutation = useUpdateReturn(returnId ?? '');
  const busy = createMutation.isPending || updateMutation.isPending;

  const errors = useMemo(
    () => validateReturnForm(form.values, sale.transactionDate),
    [form.values, sale.transactionDate]
  );
  const ready = Object.keys(errors).length === 0;
  const hasRoom = form.values.lines.some((line) => line.remaining > 0);

  const save = async () => {
    if (busy || !ready) return;
    try {
      const saved = returnId
        ? await updateMutation.mutateAsync(form.values)
        : await createMutation.mutateAsync(form.values);
      navigate(detailPath(saved.id));
    } catch {
      // The mutation hooks already told the user what went wrong; the form keeps its values.
    }
  };

  const back = () => navigate(returnId ? detailPath(returnId) : routes.sales.returns);

  return (
    <Stack gap="lg">
      <Paper withBorder radius="lg" p="lg" bg="white">
        <Text fw={700} mb="sm">
          {t('form.invoiceCard')}
        </Text>
        <Group gap="xl" wrap="wrap">
          {[
            [t('form.invoiceNumber'), sale.transactionNumber],
            [t('form.invoiceCustomer'), sale.customer?.displayName || '–'],
            [t('form.invoiceDate'), formatDate(sale.transactionDate)],
            [t('form.invoiceBalance'), formatIDR(sale.remainingAmount)],
          ].map(([label, value]) => (
            <Stack key={label} gap={2}>
              <Text size="xs" c="dimmed" fw={700}>
                {label}
              </Text>
              <Text size="sm" fw={600}>
                {value}
              </Text>
            </Stack>
          ))}
        </Group>
      </Paper>

      <Paper withBorder radius="lg" p="lg" bg="white">
        <Text fw={700} mb="sm">
          {t('form.detailsCard')}
        </Text>
        <Grid gutter="md">
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <TextInput
              type="date"
              label={t('form.date')}
              leftSection={<IconCalendar size={16} />}
              withAsterisk
              {...form.getInputProps('transactionDate')}
              error={form.isTouched('transactionDate') ? t(errors.transactionDate ?? '') : null}
            />
          </Grid.Col>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <Select
              label={t('form.reason')}
              allowDeselect={false}
              data={RETURN_REASONS.map((value) => ({ value, label: t(`reasons.${value}`) }))}
              {...form.getInputProps('reason')}
            />
          </Grid.Col>
          <Grid.Col span={12}>
            <Radio.Group
              label={t('form.settlement')}
              value={form.values.settlement}
              onChange={(value) => form.setFieldValue('settlement', value as ReturnSettlement)}
            >
              <Stack gap="xs" mt="xs">
                {(['REDUCE_INVOICE', 'CUSTOMER_CREDIT'] as const).map((value) => (
                  <Radio
                    key={value}
                    value={value}
                    label={t(`settlement.${value}`)}
                    description={t(`settlement.${value}_HINT`)}
                  />
                ))}
              </Stack>
            </Radio.Group>
          </Grid.Col>
          <Grid.Col span={12}>
            <Textarea
              label={t('form.memo')}
              placeholder={t('form.memoPlaceholder')}
              autosize
              minRows={2}
              {...form.getInputProps('memo')}
            />
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper withBorder radius="lg" p="lg" bg="white">
        <Group justify="space-between" mb="xs">
          <Text fw={700}>{t('form.linesCard')}</Text>
          <Button
            size="xs"
            variant="light"
            disabled={!hasRoom}
            onClick={() => form.setFieldValue('lines', returnAll(form.values.lines))}
          >
            {t('form.returnAll')}
          </Button>
        </Group>
        <Text size="sm" c="dimmed" mb="md">
          {t('form.linesHint')}
        </Text>
        {!hasRoom && (
          <Alert color="gray" mb="md">
            {t('form.nothingLeft')}
          </Alert>
        )}
        <Table.ScrollContainer minWidth={640}>
          <Table verticalSpacing="xs" horizontalSpacing="sm">
            <Table.Thead bg="gray.0">
              <Table.Tr>
                <Table.Th>{t('form.colItem')}</Table.Th>
                <Table.Th ta="right">{t('form.colInvoiceQty')}</Table.Th>
                <Table.Th ta="right">{t('form.colReturned')}</Table.Th>
                <Table.Th ta="right">{t('form.colRemaining')}</Table.Th>
                <Table.Th ta="right">{t('form.colUnitPrice')}</Table.Th>
                <Table.Th w={140}>{t('form.colReturnQty')}</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {form.values.lines.map((line, index) => {
                const lineError = errors[`lines.${index}`];
                return (
                  <Table.Tr key={line.saleItem}>
                    <Table.Td>
                      <Text size="sm" fw={600}>
                        {line.name || '–'}
                      </Text>
                      {line.description && line.description !== line.name && (
                        <Text size="xs" c="dimmed">
                          {line.description}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td ta="right">{line.quantity}</Table.Td>
                    <Table.Td ta="right">{line.returned}</Table.Td>
                    <Table.Td ta="right">{line.remaining}</Table.Td>
                    <Table.Td ta="right">{formatIDR(line.unitPrice)}</Table.Td>
                    <Table.Td>
                      <NumberInput
                        aria-label={`${t('form.colReturnQty')} ${line.name}`}
                        min={0}
                        max={line.remaining}
                        decimalScale={4}
                        hideControls
                        disabled={line.remaining <= 0}
                        value={line.returnQty}
                        onChange={(value) =>
                          form.setFieldValue(`lines.${index}.returnQty`, Number(value) || 0)
                        }
                        error={lineError ? t(lineError) : undefined}
                      />
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
        {form.isTouched() && errors.lines && (
          <Text size="sm" c="red.7" mt="sm">
            {t(errors.lines)}
          </Text>
        )}
      </Paper>

      <Group justify="flex-end">
        <Button variant="default" onClick={back} disabled={busy}>
          {t('form.actions.cancel')}
        </Button>
        <Tooltip label={t('form.actions.saveHint')} disabled={ready} withArrow>
          <span>
            <Button
              leftSection={<IconDeviceFloppy size={18} />}
              onClick={save}
              loading={busy}
              disabled={!ready}
            >
              {returnId ? t('form.actions.saveChanges') : t('form.actions.save')}
            </Button>
          </span>
        </Tooltip>
      </Group>
    </Stack>
  );
}
