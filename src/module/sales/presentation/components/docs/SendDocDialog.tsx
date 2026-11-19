import { useState } from 'react';
import { Button, TagsInput, Textarea } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import {
  DOC_MAX_EMAILS,
  DOC_MAX_MESSAGE,
  type SaleDocCustomer,
} from '@/module/sales/domain/saleDocument';
import type { SendDocInput } from '@/module/sales/infrastructure/saleDocPayloads';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendDocDialogProps {
  /** Whose copy: quotes and orders word the dialog in their own namespace. */
  ns: 'salesQuotes' | 'salesOrders';
  opened: boolean;
  doc: { transactionNumber: string; emails: string[]; customer: SaleDocCustomer | null } | null;
  /** The document was already sent; only its email goes out again. */
  resend: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: SendDocInput) => void;
}

/** Choose who gets a quote or an order by email, or mark it as sent without one. */
export function SendDocDialog({
  ns,
  opened,
  doc,
  resend,
  loading,
  onClose,
  onSubmit,
}: Readonly<SendDocDialogProps>) {
  const { t } = useTranslation(ns);
  const suggested = doc ? (doc.emails.length ? doc.emails : (doc.customer?.emails ?? [])) : [];
  const [emails, setEmails] = useState<string[]>(suggested);
  const [message, setMessage] = useState('');

  const clean = emails.map((email) => email.trim()).filter(Boolean);
  const invalid = clean.some((email) => !EMAIL.test(email));
  const tooMany = clean.length > DOC_MAX_EMAILS;
  const error = invalid ? t('send.emailInvalid') : tooMany ? t('send.emailTooMany') : undefined;
  // A resend with no address falls back to the saved ones; a first send without any is a plain mark.
  const submitLabel = resend
    ? t('send.resendSubmit')
    : clean.length
      ? t('send.submitWithEmail')
      : t('send.submitNoEmail');

  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={t(resend ? 'send.resendTitle' : 'send.title', {
        number: doc?.transactionNumber ?? '',
      })}
      description={t(resend ? 'send.resendIntro' : 'send.intro')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('send.cancel')}
          </Button>
          <Button
            color="primary"
            loading={loading}
            disabled={invalid || tooMany}
            onClick={() => onSubmit({ emails: clean, message })}
          >
            {submitLabel}
          </Button>
        </>
      }
    >
      <TagsInput
        label={t('send.emailsLabel')}
        placeholder={t('send.emailsPlaceholder')}
        description={resend ? t('send.resendHint') : t('send.emailsHint', { max: DOC_MAX_EMAILS })}
        inputWrapperOrder={['label', 'input', 'description', 'error']}
        value={emails}
        onChange={setEmails}
        error={error}
        data-autofocus
      />
      <Textarea
        label={t('send.messageLabel')}
        description={t('send.messageHint', { max: DOC_MAX_MESSAGE })}
        inputWrapperOrder={['label', 'input', 'description', 'error']}
        value={message}
        onChange={(event) => setMessage(event.currentTarget.value)}
        maxLength={DOC_MAX_MESSAGE}
        minRows={3}
        autosize
      />
    </ModalFrame>
  );
}
