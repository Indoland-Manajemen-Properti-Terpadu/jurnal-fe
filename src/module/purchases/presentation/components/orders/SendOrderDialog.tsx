import { useEffect, useState } from 'react';
import { Alert, Button, Radio, Stack, TagsInput, Text, Textarea, TextInput } from '@mantine/core';
import { IconAlertCircle, IconInfoCircle } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { PurchaseOrder } from '@/module/purchases/domain/purchaseDocuments';
import { sendOrderInput, validateSend } from '@/module/purchases/domain/orderSend';
import type { SendMode } from '@/module/purchases/domain/orderSend';
import { usePurchaseErrorMessage } from '@/module/purchases/presentation/hooks/purchaseErrorMessage';
import { useSendOrder } from '@/module/purchases/presentation/hooks/usePurchaseMutations';

interface SendOrderDialogProps {
  order: PurchaseOrder;
  opened: boolean;
  resend?: boolean;
  onClose: () => void;
}

/** Drafts can be marked sent or emailed; a resend always emails the existing order PDF. */
export const SendOrderDialog = ({
  order,
  opened,
  resend = false,
  onClose,
}: Readonly<SendOrderDialogProps>) => {
  const { t } = useTranslation('purchases');
  const describe = usePurchaseErrorMessage();
  const send = useSendOrder();
  const [mode, setMode] = useState<SendMode>(resend ? 'email' : 'mark');
  const [to, setTo] = useState('');
  const [cc, setCc] = useState<string[]>([]);
  const [note, setNote] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const vendorEmail = order.vendorEmails[0] ?? '';

  useEffect(() => {
    if (!opened) return;
    setMode(resend ? 'email' : 'mark');
    setTo(resend ? vendorEmail : '');
    setCc([]);
    setNote('');
    setShowErrors(false);
    send.reset();
  }, [opened, order.id, resend, vendorEmail]);

  const values = { mode, to, cc, note };
  const errors = validateSend(values, order.vendorEmails);

  const submit = () => {
    if (errors.to || errors.cc) {
      setShowErrors(true);
      return;
    }
    send.mutate({ id: order.id, input: sendOrderInput(values) }, { onSuccess: onClose });
  };

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size={resend ? 'md' : 'lg'}
      title={
        resend
          ? t('orders.send.resendTitle', { label: order.documentLabel })
          : t('orders.send.title', { label: order.documentLabel })
      }
      description={
        resend
          ? t('orders.send.resendDescription', {
              number: order.number,
              vendor: order.vendor.name,
            })
          : t('orders.send.description')
      }
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={send.isPending}>
            {t('common.cancel')}
          </Button>
          <Button loading={send.isPending} onClick={submit}>
            {t(mode === 'email' ? 'orders.send.confirmEmail' : 'orders.send.confirmMark')}
          </Button>
        </>
      }
    >
      {send.isError && (
        <Alert color="red" variant="light" radius="md" icon={<IconAlertCircle size={18} />}>
          {describe(send.error)}
        </Alert>
      )}
      {resend && (
        <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={18} />}>
          {t('orders.send.resendNotice')}
        </Alert>
      )}
      {!resend && (
        <Radio.Group value={mode} onChange={(value) => setMode(value as SendMode)}>
          <Stack gap="sm">
            <Radio
              value="mark"
              label={t('orders.send.markLabel')}
              description={t('orders.send.markHint')}
            />
            <Radio
              value="email"
              label={t('orders.send.emailLabel')}
              description={t('orders.send.emailHint')}
            />
          </Stack>
        </Radio.Group>
      )}
      {(resend || mode === 'email') && (
        <Stack gap="sm">
          <TextInput
            radius="md"
            label={t('orders.send.to')}
            placeholder={t('orders.send.toPlaceholder')}
            description={
              !resend && order.vendorEmails.length > 0
                ? t('orders.send.toHint', { email: order.vendorEmails[0] })
                : order.vendorEmails.length === 0
                  ? t('orders.send.noVendorEmail')
                  : undefined
            }
            value={to}
            onChange={(event) => setTo(event.currentTarget.value)}
            error={showErrors && errors.to ? t(`orders.send.error.${errors.to}`) : undefined}
          />
          <TagsInput
            radius="md"
            label={t('orders.send.cc')}
            placeholder={t('orders.send.ccPlaceholder')}
            value={cc}
            onChange={setCc}
            error={showErrors && errors.cc ? t(`orders.send.error.${errors.cc}`) : undefined}
          />
        </Stack>
      )}
      <Textarea
        radius="md"
        autosize
        minRows={2}
        label={t('orders.send.note')}
        placeholder={t('orders.send.notePlaceholder')}
        value={note}
        onChange={(event) => setNote(event.currentTarget.value)}
      />
      <Text size="xs" c="dimmed">
        {t(
          resend
            ? 'orders.send.resendFootnote'
            : mode === 'email'
              ? 'orders.send.emailFootnote'
              : 'orders.send.markFootnote'
        )}
      </Text>
    </ModalFrame>
  );
};
