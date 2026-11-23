import { Alert, Button, List, Stack, Text } from '@mantine/core';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';

interface SwitchToSingleDialogProps {
  opened: boolean;
  quoteCount: number;
  hasWinner: boolean;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * Going from bidding to a single vendor with several quotes entered throws them away: one vendor
 * means one quote. The dialog says what goes before it happens.
 */
export const SwitchToSingleDialog = ({
  opened,
  quoteCount,
  hasWinner,
  loading,
  onClose,
  onConfirm,
}: Readonly<SwitchToSingleDialogProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      title={t('procurement.switchSingle.title')}
      description={t('procurement.switchSingle.description')}
      footer={
        <>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('common.cancel')}
          </Button>
          <Button color="red" loading={loading} onClick={onConfirm}>
            {t('procurement.switchSingle.confirm')}
          </Button>
        </>
      }
    >
      <Stack gap="sm">
        <Alert
          color="red"
          variant="light"
          radius="md"
          title={t('procurement.switchSingle.willDelete')}
        >
          <List size="sm" spacing={2}>
            <List.Item>{t('procurement.switchSingle.quotes', { count: quoteCount })}</List.Item>
            <List.Item>{t('procurement.switchSingle.scores')}</List.Item>
            {hasWinner && <List.Item>{t('procurement.switchSingle.winner')}</List.Item>}
          </List>
        </Alert>
        <Text size="sm" c="dimmed">
          {t('procurement.switchSingle.redo')}
        </Text>
      </Stack>
    </ModalFrame>
  );
};
