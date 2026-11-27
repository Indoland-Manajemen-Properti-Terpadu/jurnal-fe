import { useState } from 'react';
import { Button, Group, List, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { IconAlertTriangle, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { Procurement } from '@/module/purchases/domain/procurement';

interface ProcurementSubmitProps {
  procurement: Procurement;
  /** The person may submit now: everything required is filled. */
  ready: boolean;
  /** What else blocks submitting, in the same words as the service's own list. */
  extraErrors?: string[];
  loading: boolean;
  onSubmit: () => void;
}

/** The foot of the bidding and single-vendor forms: what is still missing, and the submit button. */
export const ProcurementSubmit = ({
  procurement,
  ready,
  extraErrors = [],
  loading,
  onSubmit,
}: Readonly<ProcurementSubmitProps>) => {
  const { t } = useTranslation('purchases');
  const [confirming, setConfirming] = useState(false);
  const single = procurement.route === 'SINGLE';
  const label =
    procurement.status === 'REJECTED'
      ? t('procurement.resubmit')
      : t(single ? 'procurement.bidding.submitSingle' : 'procurement.bidding.submit');

  return (
    <>
      {!ready && procurement.submitErrors.length + extraErrors.length > 0 && (
        <List size="xs" spacing={2} c="dimmed">
          {[...procurement.submitErrors, ...extraErrors].map((message) => (
            <List.Item key={message}>{message}</List.Item>
          ))}
        </List>
      )}
      <Group justify={ready ? 'flex-end' : 'space-between'} wrap="wrap" gap="sm">
        {!ready && (
          <Group gap={6} wrap="nowrap">
            <IconAlertTriangle size={14} color="var(--mantine-color-orange-7)" />
            <Text size="xs" c="orange.8">
              {t('procurement.bidding.completeFirst')}
            </Text>
          </Group>
        )}
        <Button
          leftSection={<IconSend size={16} />}
          disabled={!ready}
          loading={loading}
          onClick={() => (single ? setConfirming(true) : onSubmit())}
        >
          {label}
        </Button>
      </Group>
      <ModalFrame
        opened={confirming}
        onClose={loading ? () => undefined : () => setConfirming(false)}
        title={t('procurement.confirmSingleTitle')}
        footer={
          <>
            <Button variant="default" disabled={loading} onClick={() => setConfirming(false)}>
              {t('common.cancel')}
            </Button>
            <Button
              loading={loading}
              onClick={() => {
                setConfirming(false);
                onSubmit();
              }}
            >
              {label}
            </Button>
          </>
        }
      >
        <Text size="sm">{t('procurement.confirmSingleBody')}</Text>
      </ModalFrame>
    </>
  );
};
