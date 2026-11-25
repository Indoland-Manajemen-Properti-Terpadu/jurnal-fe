import { Fragment } from 'react';
import tableClasses from '@/module/purchases/presentation/components/shared/Table.module.css';
import { Button, Checkbox, Group, NumberInput, Table, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type {
  PaymentRequestErrors,
  PaymentRequestFormValues,
  RequestableBill,
} from '@/module/purchases/domain/paymentRequest';
import {
  formatAmount,
  formatDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';

interface RequestableBillsEditorProps {
  bills: RequestableBill[];
  /** The vendors chosen in step one; with more than one, the bills are grouped under them. */
  vendors: { id: string; name: string }[];
  values: PaymentRequestFormValues;
  errors: PaymentRequestErrors;
  showErrors: boolean;
  onChange: (amounts: Record<string, number>) => void;
}

/** The vendor's open bills; a chosen bill takes the amount asked on it, never above what is still free. */
export const RequestableBillsEditor = ({
  bills,
  vendors,
  values,
  errors,
  showErrors,
  onChange,
}: Readonly<RequestableBillsEditorProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const today = todayIso();
  const chosen = Object.keys(values.amounts).length;

  const grouped = vendors.length > 1;
  const billRow = (bill: RequestableBill) => {
    const picked = bill.id in values.amounts;
    const overdue = bill.dueDate !== null && bill.dueDate < today;
    const problem = showErrors ? errors.bills[bill.id] : undefined;
    let error: string | undefined;
    if (problem === 'amountTooHigh') {
      error = t('paymentRequests.form.amountTooHigh', {
        max: formatAmount(bill.requestable),
      });
    } else if (problem) {
      error = t('paymentRequests.form.amountInvalid');
    }
    return (
      <Table.Tr key={bill.id} style={{ verticalAlign: 'top' }}>
        <Table.Td>
          <Checkbox
            mt={6}
            checked={picked}
            aria-label={t('paymentRequests.form.selectBill', { number: bill.number })}
            onChange={(event) => {
              const next = { ...values.amounts };
              if (event.currentTarget.checked) {
                next[bill.id] = bill.requestable;
              } else {
                delete next[bill.id];
              }
              onChange(next);
            }}
          />
        </Table.Td>
        <Table.Td>
          <Text size="sm" fw={500} pt={7} style={{ whiteSpace: 'nowrap' }}>
            {bill.number}
          </Text>
          {bill.vendorInvoiceNumber && (
            <Text size="xs" c="dimmed">
              {bill.vendorInvoiceNumber}
            </Text>
          )}
        </Table.Td>
        <Table.Td>
          <Group gap={6} pt={7} wrap="nowrap">
            <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
              {formatDay(bill.dueDate, currentLanguage)}
            </Text>
            {overdue && (
              <Text span size="xs" c="red.7" fw={600}>
                {t('paymentRequests.form.overdue')}
              </Text>
            )}
          </Group>
        </Table.Td>
        <Table.Td ta="right">
          <Text size="sm" pt={7} style={{ whiteSpace: 'nowrap' }}>
            {formatAmount(bill.requestable)}
          </Text>
        </Table.Td>
        <Table.Td w={190}>
          <NumberInput
            radius="md"
            aria-label={t('paymentRequests.form.amountAria', { number: bill.number })}
            value={picked ? values.amounts[bill.id] : ''}
            disabled={!picked}
            min={0}
            hideControls
            allowNegative={false}
            thousandSeparator="."
            decimalSeparator=","
            decimalScale={2}
            prefix="Rp "
            error={error}
            onChange={(value) =>
              onChange({
                ...values.amounts,
                [bill.id]: typeof value === 'number' ? value : 0,
              })
            }
          />
        </Table.Td>
      </Table.Tr>
    );
  };

  /** One vendor: a header with what is asked from it, then its bills (or a note when it has none). */
  const vendorGroup = (vendor: { id: string; name: string }) => {
    const own = bills.filter((bill) => bill.vendorId === vendor.id);
    const asked = own
      .filter((bill) => bill.id in values.amounts)
      .reduce((sum, bill) => sum + Math.round((values.amounts[bill.id] || 0) * 100), 0);
    const missing = showErrors && errors.vendors[vendor.id] === 'noBillForVendor';
    return (
      <Fragment key={vendor.id}>
        <Table.Tr bg="var(--jurnal-color-surface-muted)">
          <Table.Td colSpan={5}>
            <Group justify="space-between" wrap="nowrap">
              <div>
                <Text size="sm" fw={700}>
                  {vendor.name}
                </Text>
                {missing && (
                  <Text size="xs" c="red.7" role="alert">
                    {t('paymentRequests.form.vendorNeedsBill', { name: vendor.name })}
                  </Text>
                )}
              </div>
              {asked > 0 && (
                <Text size="xs" c="dimmed">
                  {t('paymentRequests.form.askedFromVendor')}{' '}
                  <Text span fw={700} c="dark.8">
                    {formatAmount(asked / 100)}
                  </Text>
                </Text>
              )}
            </Group>
          </Table.Td>
        </Table.Tr>
        {own.length === 0 ? (
          <Table.Tr>
            <Table.Td colSpan={5}>
              <Text size="sm" c="dimmed">
                {t('paymentRequests.form.vendorNoBills')}
              </Text>
            </Table.Td>
          </Table.Tr>
        ) : (
          own.map(billRow)
        )}
      </Fragment>
    );
  };

  return (
    <>
      <Group justify="flex-end" gap="xs" mb="xs">
        <Button
          variant="subtle"
          size="xs"
          onClick={() =>
            onChange(Object.fromEntries(bills.map((bill) => [bill.id, bill.requestable])))
          }
        >
          {t('paymentRequests.form.requestAll')}
        </Button>
        <Button
          variant="subtle"
          size="xs"
          color="gray"
          disabled={chosen === 0}
          onClick={() => onChange({})}
        >
          {t('paymentRequests.form.clearAll')}
        </Button>
      </Group>
      <Table.ScrollContainer type="native" minWidth={640}>
        <Table className={tableClasses.table} verticalSpacing="xs" horizontalSpacing="xs">
          <Table.Thead bg="var(--jurnal-color-surface-hover)">
            <Table.Tr>
              <Table.Th w={40} />
              {(['bill', 'dueDate', 'requestable', 'amount'] as const).map((key) => (
                <Table.Th
                  key={key}
                  ta={key === 'requestable' || key === 'amount' ? 'right' : undefined}
                >
                  <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                    {t(`paymentRequests.form.col.${key}`)}
                  </Text>
                </Table.Th>
              ))}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>{grouped ? vendors.map(vendorGroup) : bills.map(billRow)}</Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </>
  );
};
