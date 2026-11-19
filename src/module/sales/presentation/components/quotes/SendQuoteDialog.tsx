import { useState } from 'react';
import { Button, Group, Modal, Stack, TagsInput, Text, Textarea } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  QUOTE_MAX_EMAILS,
  QUOTE_MAX_MESSAGE,
  type SaleQuote,
} from '@/module/sales/domain/saleQuote';
import type { SendQuoteInput } from '@/module/sales/infrastructure/saleQuotePayloads';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface SendQuoteDialogProps {
  opened: boolean;
  quote: SaleQuote | null;
  /** The quote was already sent; only its email goes out again. */
  resend: boolean;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (input: SendQuoteInput) => void;
}

/** Choose who gets the quote by email, or mark it as sent without one. */
export function SendQuoteDialog({
  opened,
  quote,
  resend,
  loading,
  onClose,
  onSubmit,
}: Readonly<SendQuoteDialogProps>) {
  const { t } = useTranslation('salesQuotes');
  const suggested = quote
    ? quote.emails.length
      ? quote.emails
      : (quote.customer?.emails ?? [])
    : [];
  const [emails, setEmails] = useState<string[]>(suggested);
  const [message, setMessage] = useState('');

  const clean = emails.map((email) => email.trim()).filter(Boolean);
  const invalid = clean.some((email) => !EMAIL.test(email));
  const tooMany = clean.length > QUOTE_MAX_EMAILS;
  const error = invalid ? t('send.emailInvalid') : tooMany ? t('send.emailTooMany') : undefined;
  // A resend with no address falls back to the saved ones; a first send without any is a plain mark.
  const submitLabel = resend
    ? t('send.resendSubmit')
    : clean.length
      ? t('send.submitWithEmail')
      : t('send.submitNoEmail');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      title={t(resend ? 'send.resendTitle' : 'send.title', {
        number: quote?.transactionNumber ?? '',
      })}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('send.intro')}
        </Text>
        <TagsInput
          label={t('send.emailsLabel')}
          placeholder={t('send.emailsPlaceholder')}
          description={
            resend ? t('send.resendHint') : t('send.emailsHint', { max: QUOTE_MAX_EMAILS })
          }
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          value={emails}
          onChange={setEmails}
          error={error}
          data-autofocus
        />
        <Textarea
          label={t('send.messageLabel')}
          description={t('send.messageHint', { max: QUOTE_MAX_MESSAGE })}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          value={message}
          onChange={(event) => setMessage(event.currentTarget.value)}
          maxLength={QUOTE_MAX_MESSAGE}
          minRows={3}
          autosize
        />
        <Group justify="flex-end" gap="sm">
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
        </Group>
      </Stack>
    </Modal>
  );
}
