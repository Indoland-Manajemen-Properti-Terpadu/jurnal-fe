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
import { IconAlertTriangle, IconArrowBarToDown, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import {
  AUTO_ALLOCATION_ORDER,
  fillRestAmount,
  itemErrorKey,
  allocationGap,
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

/** Live balance of the allocation: done, still to place, or placed in excess. */
function AllocationStatus({ gap }: Readonly<{ gap: number }>) {
  const { t } = useTranslation('sales');
  if (gap === 0) {
    return (
      <Group gap={6} role="status" aria-live="polite">
        <IconCircleCheck size={16} color="var(--mantine-color-teal-7)" />
        <Text size="sm" fw={600} c="teal.8">
          {t('pay.allocatedAll')}
        </Text>
      </Group>
    );
  }
  const over = gap < 0;
  return (
    <Group
      justify="space-between"
      role="status"
      aria-live="polite"
      px="sm"
      py={8}
      style={{
        borderRadius: 'var(--mantine-radius-md)',
        background: over ? 'var(--mantine-color-red-0)' : 'var(--mantine-color-yellow-0)',
      }}
    >
      <Group gap={6}>
        <IconAlertTriangle
          size={16}
          color={over ? 'var(--mantine-color-red-7)' : 'var(--mantine-color-yellow-8)'}
        />
        <Text size="sm" fw={600} c={over ? 'red.8' : 'yellow.9'}>
          {over ? t('pay.overAllocated') : t('pay.unallocated')}
        </Text>
      </Group>
      <Text size="sm" fw={800} c={over ? 'red.8' : 'yellow.9'}>
        {formatIDR(Math.abs(gap))}
      </Text>
    </Group>
  );
}

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
  const gap = allocationGap(values);

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
                    <Table.Th w={210}>{t('pay.colPay')}</Table.Th>
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

            <AllocationStatus gap={gap} />
          </>
        )}
      </Stack>
    </Paper>
  );
}

export default PaymentAllocation;
