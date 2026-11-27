import { NumberInput, Select, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type {
  PaymentRequestErrors,
  PaymentRequestFormValues,
  RequestableBill,
} from '@/module/purchases/domain/paymentRequest';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { RequestableBillsEditor } from '@/module/purchases/presentation/components/paymentRequests/RequestableBillsEditor';
import { formatAmount } from '@/module/purchases/presentation/components/shared/format';

interface PaymentRequestAmountFieldsProps {
  isAdvance: boolean;
  editing: boolean;
  values: PaymentRequestFormValues;
  errors: PaymentRequestErrors;
  showErrors: boolean;
  bills: RequestableBill[];
  /** The vendors chosen in step one, in the order they were chosen. */
  vendors: { id: string; name: string }[];
  billsLoading: boolean;
  orders: PurchaseOrder[];
  ordersLoading: boolean;
  order: PurchaseOrder | undefined;
  available: number | undefined;
  onChange: (next: Partial<PaymentRequestFormValues>) => void;
}

/** Step 2 of the form: the amount asked on each bill, or the advance of one order. */
export const PaymentRequestAmountFields = ({
  isAdvance,
  editing,
  values,
  errors,
  showErrors,
  bills,
  vendors,
  billsLoading,
  orders,
  ordersLoading,
  order,
  available,
  onChange: patch,
}: Readonly<PaymentRequestAmountFieldsProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <>
      {isAdvance ? (
        <Stack gap="md">
          {!ordersLoading && orders.length === 0 && (
            <Text size="sm" c="dimmed">
              {t('paymentRequests.form.noOrders')}
            </Text>
          )}
          {orders.length > 0 && (
            <>
              <Select
                radius="md"
                withAsterisk
                searchable
                label={t('paymentRequests.form.order')}
                placeholder={t('paymentRequests.form.orderPlaceholder')}
                disabled={editing}
                data={orders.map((item) => ({ value: item.id, label: item.number }))}
                value={values.purchaseOrderId || null}
                onChange={(id) => {
                  const picked = orders.find((item) => item.id === id);
                  patch({
                    purchaseOrderId: id ?? '',
                    advanceAmount: picked ? picked.advance.available : '',
                  });
                }}
                error={
                  showErrors && errors.order ? t('paymentRequests.form.orderRequired') : undefined
                }
              />
              {order && (
                <Text size="xs" c="dimmed">
                  {t('paymentRequests.form.orderHint', {
                    amount: formatAmount(order.advance.amount),
                    requested: formatAmount(order.advance.requested),
                    available: formatAmount(order.advance.available),
                  })}
                </Text>
              )}
              <NumberInput
                radius="md"
                withAsterisk
                label={t('paymentRequests.form.advanceAmount')}
                value={values.advanceAmount}
                min={0}
                hideControls
                allowNegative={false}
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={2}
                prefix="Rp "
                onChange={(value) =>
                  patch({ advanceAmount: typeof value === 'number' ? value : '' })
                }
                error={
                  showErrors && errors.advance
                    ? errors.advance === 'advanceTooHigh'
                      ? t('paymentRequests.form.advanceTooHigh', {
                          max: formatAmount(available ?? 0),
                        })
                      : t('paymentRequests.form.advanceInvalid')
                    : undefined
                }
              />
            </>
          )}
        </Stack>
      ) : (
        <Stack gap="sm">
          {billsLoading && (
            <Text size="sm" c="dimmed">
              {t('paymentRequests.form.loadingBills')}
            </Text>
          )}
          {!billsLoading && bills.length === 0 && (
            <Text size="sm" c="dimmed">
              {t('paymentRequests.form.noBills')}
            </Text>
          )}
          {bills.length > 0 && (
            <RequestableBillsEditor
              bills={bills}
              vendors={vendors}
              values={values}
              errors={errors}
              showErrors={showErrors}
              onChange={(amounts) => patch({ amounts })}
            />
          )}
          {showErrors && errors.noBills && (
            <Text size="sm" c="red" role="alert">
              {t('paymentRequests.form.noBillChosen')}
            </Text>
          )}
        </Stack>
      )}
    </>
  );
};
