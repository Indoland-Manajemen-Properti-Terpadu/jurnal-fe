import { Badge, Button, Group, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { ModalFrame } from '@/components/Modals/ModalFrame';
import { useTranslation } from '@/i18n';
import type { RequestFormValues } from '@/module/purchases/domain/requestForm';
import {
  formatDay,
  formatQuantity,
} from '@/module/purchases/presentation/components/shared/format';

interface SubmitRequestDialogProps {
  opened: boolean;
  values: RequestFormValues;
  departmentName: string;
  loading: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

/**
 * "Ajukan permintaan?": the last look before the request goes to Accounting, as in the reference
 * web: what it is for, when it is needed, and the lines. Once submitted it is locked until verified.
 */
export const SubmitRequestDialog = ({
  opened,
  values,
  departmentName,
  loading,
  onClose,
  onConfirm,
}: Readonly<SubmitRequestDialogProps>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const items = values.items.filter((item) => item.productName || item.description);
  const fact = (label: string, value: string) => (
    <Paper radius="md" p="sm" bg="primary.7" style={{ minWidth: 0 }}>
      <Text size="xs" c="primary.1">
        {label}
      </Text>
      <Text size="sm" fw={700} c="white">
        {value}
      </Text>
    </Paper>
  );
  return (
    <ModalFrame
      opened={opened}
      onClose={onClose}
      size="lg"
      title={t('requests.submitDialog.title')}
      description={t('requests.submitDialog.description')}
      footer={
        <>
          <Group gap={6} mr="auto" wrap="nowrap">
            <IconInfoCircle size={16} color="var(--mantine-color-dimmed)" />
            <Text size="xs" c="dimmed">
              {t('requests.submitDialog.locked')}
            </Text>
          </Group>
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('requests.submitDialog.back')}
          </Button>
          <Button loading={loading} onClick={onConfirm}>
            {t('requests.submitDialog.confirm')}
          </Button>
        </>
      }
    >
      <Paper radius="lg" p="lg" bg="primary.8">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <div>
            <Text size="xs" tt="uppercase" c="primary.1" style={{ letterSpacing: '0.04em' }}>
              {t('requests.submitDialog.purpose')}
            </Text>
            <Text fz={20} fw={700} c="white" lh={1.3}>
              {values.purpose}
            </Text>
            <Text size="xs" c="primary.1" mt="md">
              {t('requests.submitDialog.neededOn')}
            </Text>
            <Text fz={26} fw={700} c="white">
              {formatDay(values.requiredDate, currentLanguage)}
            </Text>
          </div>
          <Badge variant="white" color="primary" radius="xl">
            {t('requests.submitDialog.itemCount', { count: items.length })}
          </Badge>
        </Group>
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="sm" mt="md">
          {fact(t('common.department'), departmentName || '-')}
          {fact(
            t('requests.submitDialog.requestDate'),
            formatDay(values.transactionDate, currentLanguage)
          )}
        </SimpleGrid>
      </Paper>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text size="sm" fw={700}>
            {t('requests.submitDialog.items')}
          </Text>
        </Group>
        {items.map((item) => (
          <Paper key={item.key} withBorder radius="md" p="sm">
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" fw={700}>
                {item.productName || item.description}
              </Text>
              <Text size="xs" c="dimmed">
                {formatQuantity(Number(item.quantity) || 0)}
              </Text>
            </Group>
          </Paper>
        ))}
      </Stack>
    </ModalFrame>
  );
};
