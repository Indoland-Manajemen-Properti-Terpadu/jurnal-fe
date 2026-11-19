import { useState } from 'react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { IconCalendar } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface CreateOrderDialogProps {
  opened: boolean;
  quoteNumber: string;
  /** The earliest the target can be: the quote's own date is not enough, the order is dated today. */
  loading?: boolean;
  onClose: () => void;
  onSubmit: (targetDate?: string) => void;
}

/** Makes an order from an accepted quote; the target date may be left empty. */
export function CreateOrderDialog({
  opened,
  quoteNumber,
  loading,
  onClose,
  onSubmit,
}: Readonly<CreateOrderDialogProps>) {
  const { t } = useTranslation('salesOrders');
  const [target, setTarget] = useState('');

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      radius="lg"
      title={t('fromQuote.title', { number: quoteNumber })}
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          {t('fromQuote.intro')}
        </Text>
        <TextInput
          type="date"
          label={t('fromQuote.targetLabel')}
          description={t('fromQuote.targetHint')}
          inputWrapperOrder={['label', 'input', 'description', 'error']}
          leftSection={<IconCalendar size={16} />}
          value={target}
          onChange={(event) => setTarget(event.currentTarget.value)}
          data-autofocus
        />
        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {t('fromQuote.cancel')}
          </Button>
          <Button color="primary" loading={loading} onClick={() => onSubmit(target || undefined)}>
            {t('fromQuote.submit')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
