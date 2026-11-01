import {
  Alert,
  Badge,
  Button,
  Divider,
  Group,
  Modal,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { PendingChangeItem } from '../../domain/pendingChange';
import { formatIDR } from '../../domain/pendingChangeFormat';
import { isFineChange, isPaymentChange } from '../../domain/pendingChangeRules';

type ApproveChangeModalProps = {
  opened: boolean;
  change: PendingChangeItem | null;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ApproveChangeModal({
  opened,
  change,
  loading,
  onClose,
  onConfirm,
}: ApproveChangeModalProps) {
  const { t } = useTranslation('pendingChanges');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="primary" variant="light">
            <IconCheck size={16} />
          </ThemeIcon>
          <Text fw={700} c="dark.8">
            {t('singleModalTitle')}
          </Text>
        </Group>
      }
      radius="md"
    >
      {change && (
        <Stack gap="md">
          <Text size="sm">{t('singleModalPrompt')}</Text>

          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Stack gap={4}>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('typeLabel')}
                </Text>
                <Badge size="sm" color={isFineChange(change) ? 'red' : 'teal'}>
                  {change.type}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="xs" c="dimmed">
                  {t('targetDocLabel')}
                </Text>
                <Text size="xs" fw={600}>
                  {change.referenceModel}
                </Text>
              </Group>
              {isFineChange(change) && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('fineAmountLabel')}
                  </Text>
                  <Text size="xs" fw={700} c="red.8">
                    +{formatIDR(change.payload?.newLateFeeAmount)}
                  </Text>
                </Group>
              )}
              {isPaymentChange(change) && (
                <Group justify="space-between">
                  <Text size="xs" c="dimmed">
                    {t('paymentAmountLabel')}
                  </Text>
                  <Text size="xs" fw={700} c="teal.9">
                    {formatIDR(change.payload?.amount)}
                  </Text>
                </Group>
              )}
              {change.notes && (
                <Group justify="space-between" align="flex-start">
                  <Text size="xs" c="dimmed">
                    {t('notesLabel')}
                  </Text>
                  <Text size="xs" fw={600} style={{ maxWidth: '75%', textAlign: 'right' }}>
                    {change.notes}
                  </Text>
                </Group>
              )}
            </Stack>
          </Paper>

          <Alert icon={<IconAlertTriangle size={16} />} color="orange" radius="md">
            {t('singleModalAlert')}
          </Alert>

          <Divider />

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose}>
              {t('cancel')}
            </Button>
            <Button
              color="primary"
              leftSection={<IconCheck size={16} />}
              onClick={onConfirm}
              loading={loading}
            >
              {t('confirmApproveSingle')}
            </Button>
          </Group>
        </Stack>
      )}
    </Modal>
  );
}
