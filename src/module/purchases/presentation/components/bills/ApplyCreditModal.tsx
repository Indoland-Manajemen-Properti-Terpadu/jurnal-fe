import { useState } from 'react';
import { Alert, Button, Group, Modal, NumberInput, Radio, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PurchaseBill, VendorCreditLine } from '@/module/purchases/domain/purchaseDocuments';
import { DateField } from '@/module/purchases/presentation/components/requests/DateField';
import {
  formatAmount,
  formatDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';
import { useApplyCredit } from '@/module/purchases/presentation/hooks/usePurchaseMutations';
import { useVendorCredits } from '@/module/purchases/presentation/hooks/usePurchaseQueries';

interface ApplyCreditModalProps {
  bill: PurchaseBill;
  opened: boolean;
  onClose: () => void;
}

/** The most that can be allocated: what the credit still holds, capped by what the bill still owes. */
const maxAmount = (line: VendorCreditLine | undefined, remaining: number): number =>
  line ? Math.min(line.available, remaining) : 0;

/** Uses vendor credit (an unused advance or a return) to reduce what the bill still owes. */
export const ApplyCreditModal = ({ bill, opened, onClose }: Readonly<ApplyCreditModalProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const credits = useVendorCredits(opened ? bill.vendor.id : undefined);
  const apply = useApplyCredit();
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState(() => (todayIso() > bill.date ? todayIso() : bill.date));

  const lines = (credits.data?.lines ?? []).filter((line) => line.available > 0);
  const keyOf = (line: VendorCreditLine) => `${line.source}:${line.id}`;
  const selected = lines.find((line) => keyOf(line) === selectedKey);
  const max = maxAmount(selected, bill.remainingAmount);

  // Choosing a credit suggests the most that fits; the user can lower it.
  const choose = (key: string) => {
    setSelectedKey(key);
    setAmount(
      maxAmount(
        lines.find((line) => keyOf(line) === key),
        bill.remainingAmount
      )
    );
  };

  const valid =
    Boolean(selected) && amount !== '' && amount > 0 && amount <= max && date >= bill.date;

  const close = () => {
    setSelectedKey(null);
    setAmount('');
    onClose();
  };

  const submit = () => {
    if (!selected || amount === '') return;
    apply.mutate(
      {
        billId: bill.id,
        input: { source: selected.source, sourceId: selected.id, amount, transactionDate: date },
      },
      { onSuccess: close }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={t('bills.apply.title')}
      centered
      radius="lg"
      size="lg"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('bills.apply.description', { vendor: bill.vendor.name })}
        </Text>

        {credits.isLoading && <Text size="sm">{t('bills.apply.loading')}</Text>}
        {credits.isError && (
          <Alert color="red" variant="light" radius="md">
            {t('list.errorDescription')}
          </Alert>
        )}
        {credits.data && lines.length === 0 && (
          <Alert color="gray" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
            {t('bills.apply.none')}
          </Alert>
        )}

        {lines.length > 0 && (
          <Radio.Group
            value={selectedKey}
            onChange={choose}
            label={t('bills.apply.pick')}
            withAsterisk
          >
            <Stack gap="xs" mt="xs">
              {lines.map((line) => (
                <Radio
                  key={keyOf(line)}
                  value={keyOf(line)}
                  label={
                    <Group justify="space-between" wrap="nowrap" gap="md" w="100%">
                      <div>
                        <Text size="sm" fw={500}>
                          {line.source === 'RETURN'
                            ? t('bills.credits.sourceReturn')
                            : t('bills.credits.sourceAdvance')}{' '}
                          {line.number}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDay(line.date, currentLanguage)}
                        </Text>
                      </div>
                      <Text
                        size="sm"
                        style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}
                      >
                        {t('bills.apply.available', { amount: formatAmount(line.available) })}
                      </Text>
                    </Group>
                  }
                  styles={{ label: { width: '100%' }, body: { width: '100%' } }}
                />
              ))}
            </Stack>
          </Radio.Group>
        )}

        {selected && (
          <Group align="flex-start" grow>
            <NumberInput
              radius="md"
              label={t('bills.apply.amount')}
              description={t('bills.apply.maxHint', { max: formatAmount(max) })}
              value={amount}
              min={0}
              max={max}
              hideControls
              allowNegative={false}
              thousandSeparator="."
              decimalSeparator=","
              prefix="Rp "
              onChange={(value) =>
                setAmount(value === '' ? '' : Math.min(Math.max(Number(value), 0), max))
              }
            />
            <DateField
              withAsterisk
              label={t('bills.apply.date')}
              value={date}
              minDate={bill.date}
              onChange={setDate}
            />
          </Group>
        )}

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close} disabled={apply.isPending}>
            {t('common.cancel')}
          </Button>
          <Button loading={apply.isPending} disabled={!valid} onClick={submit}>
            {t('bills.apply.submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
