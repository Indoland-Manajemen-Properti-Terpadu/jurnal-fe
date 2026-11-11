import {
  ActionIcon,
  Group,
  NumberInput,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Tooltip,
} from '@mantine/core';
import { IconArrowBarToDown } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  AUTO_ALLOCATION_ORDER,
  fillRestAmount,
  itemErrorKey,
  unallocatedAmount,
  type AllocationMode,
  type PaymentFormValues,
} from '@/module/sales/domain/salePayment';

export type AllocationLine = { id: string; name: string; outstandingAmount: number };

type PaymentAllocationProps = {
  values: PaymentFormValues;
  lines: AllocationLine[];
  outstandingLateFee: number;
  errors: Record<string, React.ReactNode>;
  onMode: (mode: AllocationMode) => void;
  onItemAmount: (itemId: string, amount: number) => void;
  onLateFee: (amount: number) => void;
};

const numberProps = {
  thousandSeparator: '.',
  decimalSeparator: ',',
  decimalScale: 2,
  min: 0,
  hideControls: true,
} as const;

/** Where a part payment goes: typed per invoice line, or left to the server's own order. */
export function PaymentAllocation({
  values,
  lines,
  outstandingLateFee,
  errors,
  onMode,
  onItemAmount,
  onLateFee,
}: Readonly<PaymentAllocationProps>) {
  const { t } = useTranslation('sales');
  const left = unallocatedAmount(values);

  const fillButton = (disabled: boolean, onClick: () => void) => (
    <Tooltip label={t('pay.fillRest')}>
      <ActionIcon
        variant="subtle"
        aria-label={t('pay.fillRest')}
        disabled={disabled}
        onClick={onClick}
      >
        <IconArrowBarToDown size={16} />
      </ActionIcon>
    </Tooltip>
  );

  return (
    <Paper withBorder p="sm" radius="md">
      <Stack gap="sm">
        <Group justify="space-between" align="flex-start" wrap="wrap">
          <div>
            <Text fw={700} size="sm">
              {t('pay.allocationTitle')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('pay.allocationHint')}
            </Text>
          </div>
          <SegmentedControl
            size="xs"
            value={values.allocation}
            onChange={(value) => onMode(value as AllocationMode)}
            data={[
              { value: 'manual', label: t('pay.allocationManual') },
              { value: 'auto', label: t('pay.allocationAuto') },
            ]}
          />
        </Group>

        {values.allocation === 'auto' ? (
          <Stack gap={4}>
            <Text size="sm">{t('pay.autoDescription')}</Text>
            <Text size="sm" fw={600}>
              {AUTO_ALLOCATION_ORDER.map((key) => t(`pay.autoOrder.${key}`)).join(' → ')}
            </Text>
          </Stack>
        ) : (
          <>
            <Table.ScrollContainer minWidth={420}>
              <Table verticalSpacing="xs" withRowBorders>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>{t('pay.colProduct')}</Table.Th>
                    <Table.Th ta="right">{t('pay.colOutstanding')}</Table.Th>
                    <Table.Th w={190}>{t('pay.colPay')}</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {lines.map((line) => (
                    <Table.Tr key={line.id}>
                      <Table.Td>{line.name}</Table.Td>
                      <Table.Td ta="right">{formatIDR(line.outstandingAmount)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap" align="flex-start">
                          <NumberInput
                            {...numberProps}
                            aria-label={t('pay.colPayFor', { name: line.name })}
                            value={values.itemAmounts[line.id] ?? ''}
                            onChange={(value) => onItemAmount(line.id, Number(value) || 0)}
                            error={errors[itemErrorKey(line.id)]}
                          />
                          {fillButton(false, () =>
                            onItemAmount(
                              line.id,
                              fillRestAmount(
                                values,
                                values.itemAmounts[line.id] ?? 0,
                                line.outstandingAmount
                              )
                            )
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                  {outstandingLateFee > 0 && (
                    <Table.Tr>
                      <Table.Td>{t('pay.lateFee')}</Table.Td>
                      <Table.Td ta="right">{formatIDR(outstandingLateFee)}</Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap" align="flex-start">
                          <NumberInput
                            {...numberProps}
                            aria-label={t('pay.colPayFor', { name: t('pay.lateFee') })}
                            value={values.lateFee || ''}
                            onChange={(value) => onLateFee(Number(value) || 0)}
                            error={errors.lateFee}
                          />
                          {fillButton(false, () =>
                            onLateFee(fillRestAmount(values, values.lateFee, outstandingLateFee))
                          )}
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>

            <Group justify="space-between">
              <Text size="sm" c="dimmed">
                {t('pay.unallocated')}
              </Text>
              <Text size="sm" fw={800} c={left > 0 ? 'red.7' : undefined} aria-live="polite">
                {formatIDR(left)}
              </Text>
            </Group>
            {errors.allocation && (
              <Text size="xs" c="red.7" role="alert">
                {errors.allocation}
              </Text>
            )}
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default PaymentAllocation;
