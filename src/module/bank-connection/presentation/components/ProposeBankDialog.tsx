import { useMemo, useState } from 'react';
import { Button, Group, Modal, Select, Stack, Text, Textarea } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { INDONESIA_BANKS } from '@/constants/banks';
import { useTranslation } from '@/i18n';
import { connectionErrorKey } from '@/module/bank-connection/domain/errorKey';
import { useProposeBank } from '@/module/bank-connection/presentation/hooks/useBankConnectionMutations';

const NOTE_MAX_LENGTH = 200;

/** Asks for a bank that is not offered: pick it from the bank master and say why, in a line. */
export function ProposeBankDialog({
  opened,
  onClose,
  shownCodes,
}: Readonly<{ opened: boolean; onClose: () => void; shownCodes: string[] }>) {
  const { t } = useTranslation('bankConnection');
  const propose = useProposeBank();
  const [bankCode, setBankCode] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(
    () =>
      INDONESIA_BANKS.filter((bank) => !shownCodes.includes(bank.code)).map((bank) => ({
        value: bank.code,
        label: bank.name,
      })),
    [shownCodes]
  );

  const close = () => {
    setBankCode(null);
    setNote('');
    setError(null);
    onClose();
  };

  const send = () => {
    if (!bankCode) {
      setError(t('propose.required'));
      return;
    }
    setError(null);
    const trimmed = note.trim();
    propose.mutate(
      { bankCode, ...(trimmed ? { note: trimmed } : {}) },
      {
        onSuccess: () => {
          notifications.show({ color: 'teal', message: t('propose.sent') });
          close();
        },
        onError: (failure) =>
          setError(
            failure.kind === 'unavailable'
              ? t('propose.unavailable')
              : t(connectionErrorKey(failure))
          ),
      }
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={t('propose.title')}
      centered
      transitionProps={{ duration: 0 }}
    >
      <Stack gap="md">
        <Text fz="sm" c="dimmed">
          {t('propose.body')}
        </Text>
        <Select
          label={t('propose.bank')}
          placeholder={t('propose.bankPlaceholder')}
          data={options}
          value={bankCode}
          onChange={(value) => {
            setBankCode(value);
            setError(null);
          }}
          searchable
          withAsterisk
          error={error && !bankCode ? error : undefined}
        />
        <Textarea
          label={t('propose.note')}
          placeholder={t('propose.notePlaceholder')}
          value={note}
          onChange={(event) => setNote(event.currentTarget.value)}
          maxLength={NOTE_MAX_LENGTH}
          rows={3}
        />
        {error && bankCode && (
          <Text fz="sm" c="red" role="alert">
            {error}
          </Text>
        )}
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={close}>
            {t('propose.cancel')}
          </Button>
          <Button onClick={send} loading={propose.isPending}>
            {t('propose.send')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
