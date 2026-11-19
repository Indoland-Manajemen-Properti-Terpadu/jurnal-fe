import { useState } from 'react';
import { Button, Select, TextInput, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import type { SaleReturn } from '@/module/sales/domain/saleReturn';
import type { RefundInput } from '@/module/sales/infrastructure/saleReturnPayloads';
import { useDepositAccounts } from '../../hooks/useSaleQueries';

interface RefundDialogProps {
  ret: SaleReturn;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: RefundInput) => void;
}

const today = () => new Date().toLocaleDateString('en-CA');

/** Pays the whole credit left back to the customer from a cash or bank account. */
export function RefundDialog({ ret, loading, onClose, onSubmit }: Readonly<RefundDialogProps>) {
  const { t } = useTranslation('salesReturns');
  const accounts = useDepositAccounts();
  const [account, setAccount] = useState<string | null>(null);
  const [date, setDate] = useState(today());
  const [memo, setMemo] = useState('');
  const returnDay = (ret.transactionDate ?? '').slice(0, 10);
  const dateError =
    returnDay && date && date < returnDay ? t('validation.dateBeforeReturn') : undefined;

  return (
    <ModalFrame
      opened
      onClose={onClose}
      title={t('refund.title', { number: ret.transactionNumber })}
      description={t('refund.intro', { credit: formatIDR(ret.creditRemaining) })}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('refund.cancel')}
          </Button>
          <Button
            color="primary"
            loading={loading}
            disabled={!account || !date || Boolean(dateError)}
            onClick={() => account && onSubmit({ depositAccount: account, refundDate: date, memo })}
          >
            {t('refund.submit')}
          </Button>
        </>
      }
    >
      <Select
        label={t('refund.account')}
        placeholder={t('refund.accountPlaceholder')}
        data={(accounts.data ?? []).map((item) => ({ value: item.value, label: item.label }))}
        value={account}
        onChange={setAccount}
        searchable
        data-autofocus
      />
      <TextInput
        type="date"
        label={t('refund.date')}
        value={date}
        onChange={(event) => setDate(event.currentTarget.value)}
        error={dateError}
      />
      <Textarea
        label={t('refund.memo')}
        placeholder={t('refund.memoPlaceholder')}
        value={memo}
        onChange={(event) => setMemo(event.currentTarget.value)}
        minRows={2}
        autosize
      />
    </ModalFrame>
  );
}
