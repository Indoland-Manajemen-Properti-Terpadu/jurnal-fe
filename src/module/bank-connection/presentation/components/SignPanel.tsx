import { useState } from 'react';
import { Anchor, Box, Button, Checkbox, Group, Paper, Stack, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { BankConnection } from '@/module/bank-connection/domain/connection';
import { fetchConsentDocument } from '@/module/bank-connection/infrastructure/bankConnectionApi';
import { MessagePanel } from '@/module/bank-connection/presentation/components/MessagePanel';

function Fact({ label, value }: Readonly<{ label: string; value?: string }>) {
  if (!value) return null;
  return (
    <Box>
      <Text fz={12} c="dimmed">
        {label}
      </Text>
      <Text fz="sm" fw={500}>
        {value}
      </Text>
    </Box>
  );
}

/** Step 3: the responsible person reads the permission and signs, here or on the page the backend names. */
export function SignPanel({
  connection,
  onSign,
  signing,
}: Readonly<{ connection: BankConnection; onSign: () => void; signing: boolean }>) {
  const { t } = useTranslation('bankConnection');
  const [agreed, setAgreed] = useState(false);
  const [opening, setOpening] = useState(false);

  const readLetter = async () => {
    setOpening(true);
    try {
      const url = URL.createObjectURL(await fetchConsentDocument(connection.id));
      window.open(url, '_blank', 'noopener');
    } catch {
      notifications.show({ color: 'red', message: t('detail.sign.letterError') });
    } finally {
      setOpening(false);
    }
  };

  return (
    <MessagePanel illustration="sign" title={t('detail.sign.title')} body={t('detail.sign.body')}>
      <Paper withBorder radius="md" p="md" bg="gray.0">
        <Text fw={600} fz="sm" mb="sm">
          {t('detail.sign.summaryTitle')}
        </Text>
        <Stack gap="xs">
          <Fact
            label={t('detail.sign.bank')}
            value={`${connection.bankName} · ${connection.accountNumberMasked}`}
          />
          <Fact label={t('detail.sign.holder')} value={connection.accountHolderName} />
          <Fact label={t('detail.sign.signatory')} value={connection.signatoryName} />
          <Fact label={t('detail.sign.scope')} value={t('detail.sign.scopeValue')} />
          <Fact label={t('detail.sign.revoke')} value={t('detail.sign.revokeValue')} />
        </Stack>
      </Paper>
      <Anchor
        component="button"
        type="button"
        fz="sm"
        onClick={readLetter}
        disabled={opening}
        w="fit-content"
      >
        {t('detail.sign.readLetter')}
      </Anchor>
      {connection.signingUrl ? (
        <Stack gap="xs">
          <Text fz="sm" c="dimmed">
            {t('detail.sign.externalHint')}
          </Text>
          <Group>
            <Button
              component="a"
              href={connection.signingUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {t('detail.sign.external')}
            </Button>
          </Group>
        </Stack>
      ) : (
        <>
          <Checkbox
            checked={agreed}
            onChange={(event) => setAgreed(event.currentTarget.checked)}
            label={t('detail.sign.agree')}
          />
          <Group>
            <Button disabled={!agreed} loading={signing} onClick={onSign}>
              {t('detail.sign.submit')}
            </Button>
          </Group>
        </>
      )}
    </MessagePanel>
  );
}
