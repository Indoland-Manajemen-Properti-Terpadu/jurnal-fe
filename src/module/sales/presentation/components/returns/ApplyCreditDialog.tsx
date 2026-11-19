import { useState } from 'react';
import { Button, Group, Modal, NumberInput, Select, Stack, Text, TextInput } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleReturn } from '@/module/sales/domain/saleReturn';
import type { ApplyCreditInput } from '@/module/sales/infrastructure/saleReturnPayloads';
import { useSales } from '../../hooks/useSaleQueries';

interface ApplyCreditDialogProps {
  ret: SaleReturn;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: ApplyCreditInput) => void;
}

const today = () => new Date().toLocaleDateString('en-CA');

/** Pays another unpaid invoice of the same customer with what is left of the return's credit. */
export function ApplyCreditDialog({
  ret,
  loading,
  onClose,
  onSubmit,
}: Readonly<ApplyCreditDialogProps>) {
  const { t } = useTranslation('salesReturns');
  const invoices = useSales({
    paymentStatus: ['UNPAID', 'OVERDUE'],
    customerId: ret.customer?.id,
    limit: 100,
  });
  const [sale, setSale] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(today());

  const options = (invoices.data?.items ?? []).map((invoice) => ({
    value: invoice.id,
    label: t('apply.invoiceOption', {
      number: invoice.transactionNumber,
      remaining: formatIDR(invoice.remainingAmount),
    }),
    remaining: invoice.remainingAmount,
  }));
  const target = options.find((option) => option.value === sale);
  const max = Math.min(ret.creditRemaining, target?.remaining ?? ret.creditRemaining);
  const value = typeof amount === 'number' ? amount : 0;
  const returnDay = (ret.transactionDate ?? '').slice(0, 10);

  let error: string | undefined;
  if (value > max) error = t('validation.amountOver');
  let dateError: string | undefined;
  if (returnDay && date && date < returnDay) dateError = t('validation.dateBeforeReturn');
  const ready = Boolean(sale) && value > 0 && !error && Boolean(date) && !dateError;

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      radius="lg"
      title={t('apply.title', { number: ret.transactionNumber })}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('apply.intro', { credit: formatIDR(ret.creditRemaining) })}
        </Text>
        <Select
          label={t('apply.invoice')}
          placeholder={t('apply.invoicePlaceholder')}
          data={options}
          value={sale}
          onChange={(next) => {
            setSale(next);
            const picked = options.find((option) => option.value === next);
            setAmount(picked ? Math.min(ret.creditRemaining, picked.remaining) : '');
          }}
          searchable
          nothingFoundMessage={t('apply.invoiceEmpty')}
          data-autofocus
        />
        <NumberInput
          label={t('apply.amount')}
          description={t('apply.amountHint')}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          min={0}
          decimalScale={2}
          thousandSeparator="."
          decimalSeparator=","
          value={amount}
          onChange={(next) => setAmount(typeof next === 'number' ? next : '')}
          error={error}
        />
        <TextInput
          type="date"
          label={t('apply.date')}
          value={date}
          onChange={(event) => setDate(event.currentTarget.value)}
          error={dateError}
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('apply.cancel')}
          </Button>
          <Button
            color="primary"
            loading={loading}
            disabled={!ready}
            onClick={() => sale && onSubmit({ sale, amount: value, appliedAt: date })}
          >
            {t('apply.submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
