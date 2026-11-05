import { Badge, Button, Checkbox, Group, NumberInput, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  clampAmount,
  type PayableBill,
  type PaymentFormValues,
} from '@/module/purchases/domain/paymentForm';
import {
  formatAmount,
  formatDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';

interface PaymentBillsEditorProps {
  bills: PayableBill[];
  values: PaymentFormValues;
  zeroIds: string[];
  overIds: string[];
  showErrors: boolean;
  onToggle: (bill: PayableBill, chosen: boolean) => void;
  onAmount: (billId: string, amount: number) => void;
  onPayAll: () => void;
  onClear: () => void;
}

/** The vendor's open bills; a chosen bill takes the amount paid on it, never above what it owes. */
export const PaymentBillsEditor = ({
  bills,
  values,
  zeroIds,
  overIds,
  showErrors,
  onToggle,
  onAmount,
  onPayAll,
  onClear,
}: Readonly<PaymentBillsEditorProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const today = todayIso();
  const chosenCount = Object.keys(values.amounts).length;

  return (
    <>
      <Group justify="flex-end" gap="xs" mb="xs">
        <Button variant="subtle" size="xs" onClick={onPayAll}>
          {t('payments.form.payAll')}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          disabled={chosenCount === 0}
          onClick={onClear}
        >
          {t('payments.form.clearAll')}
        </Button>
      </Group>
      <Table.ScrollContainer minWidth={640}>
        <Table verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Table.Th w={40} />
              {(['bill', 'dueDate', 'remaining', 'pay'] as const).map((key) => (
                <Table.Th key={key} ta={key === 'remaining' || key === 'pay' ? 'right' : undefined}>
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`payments.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {bills.map((bill) => {
              const chosen = bill.id in values.amounts;
              const overdue = bill.dueDate !== null && bill.dueDate < today;
              let error: string | undefined;
              if (showErrors && overIds.includes(bill.id)) {
                error = t('payments.form.overRemaining', { max: formatAmount(bill.remaining) });
              } else if (showErrors && zeroIds.includes(bill.id)) {
                error = t('payments.form.zeroAmount');
              }
              return (
                <Table.Tr key={bill.id} style={{ verticalAlign: 'top' }}>
                  <Table.Td>
                    <Checkbox
                      mt={6}
                      checked={chosen}
                      aria-label={t('payments.form.selectBill', { number: bill.number })}
                      onChange={(event) => onToggle(bill, event.currentTarget.checked)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <Text
                      size="sm"
                      fw={500}
                      pt={7}
                      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {bill.number}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <Group gap={6} pt={7} wrap="nowrap">
                      <Text
                        size="sm"
                        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {formatDay(bill.dueDate, currentLanguage)}
                      </Text>
                      {overdue && (
                        <Badge color="red" variant="light" radius="sm">
                          {t('payments.form.overdue')}
                        </Badge>
                      )}
                    </Group>
                  </Table.Td>
                  <Table.Td ta="right">
                    <Text
                      size="sm"
                      pt={7}
                      style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatAmount(bill.remaining)}
                    </Text>
                  </Table.Td>
                  <Table.Td w={190}>
                    <NumberInput
                      radius="md"
                      aria-label={t('payments.form.amountAria', { number: bill.number })}
                      value={chosen ? values.amounts[bill.id] : ''}
                      disabled={!chosen}
                      min={0}
                      max={bill.remaining}
                      hideControls
                      allowNegative={false}
                      thousandSeparator="."
                      decimalSeparator=","
                      prefix="Rp "
                      error={error}
                      onChange={(value) => onAmount(bill.id, clampAmount(value, bill.remaining))}
                    />
                  </Table.Td>
                </Table.Tr>
              );
            })}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
