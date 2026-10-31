import React, { useState } from 'react';
import { Modal, Button, Group, Text, Stack, Alert, List, ThemeIcon } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconInfoCircle, IconArrowRight, IconScale } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { notifications } from '@mantine/notifications';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { dateFormatV1 } from '@/utils/formatDate';
import { useTranslation } from '@/i18n';
import { useInitialBalanceStore } from '../store/useInitialBalanceStore';

interface BeginningBalanceModalProps {
  opened: boolean;
  onClose: () => void;
}

export const BeginningBalanceModal: React.FC<BeginningBalanceModalProps> = ({
  opened,
  onClose,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation('beginningBalances');
  const { setConversionDate, conversionDate } = useInitialBalanceStore();
  const [selectedDate, setSelectedDate] = useState<string | null>(
    conversionDate ? dayjs(conversionDate).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD')
  );

  const handleConfirm = () => {
    if (!selectedDate) {
      notifications.show({
        color: 'red',
        title: t('toast.dateRequiredTitle'),
        message: t('toast.dateRequiredMessage'),
      });
      return;
    }

    setConversionDate(new Date(selectedDate));
    onClose();
    navigate(routes.generalJournal.beginningBalance);
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      centered
      size="lg"
      radius="lg"
      title={
        <Group gap="xs">
          <ThemeIcon size={32} radius="md" variant="light" color="primary">
            <IconScale size={18} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz="var(--jurnal-text-md)" c="dark.8">
              {t('startModal.title')}
            </Text>
            <Text size="xs" c="dimmed">
              {t('startModal.subtitle')}
            </Text>
          </div>
        </Group>
      }
      styles={{
        header: {
          padding: '16px 20px',
          borderBottom: '1px solid var(--mantine-color-gray-2)',
        },
        body: {
          padding: '20px',
        },
      }}
    >
      <Stack gap="md">
        <DatePickerInput
          label={t('startModal.dateLabel')}
          description={
            selectedDate
              ? t('startModal.dateEffective', { date: dateFormatV1(selectedDate) })
              : t('startModal.datePrompt')
          }
          placeholder={t('startModal.datePlaceholder')}
          valueFormat="DD/MM/YYYY"
          size="sm"
          radius="md"
          leftSection={<IconCalendar size={18} />}
          value={selectedDate}
          onChange={setSelectedDate}
          withAsterisk
          clearable={false}
        />

        <Alert
          variant="light"
          color="blue"
          title={t('startModal.guideTitle')}
          icon={<IconInfoCircle size={18} />}
          radius="md"
        >
          <List size="xs" spacing={6} c="dark.7">
            <List.Item>{t('startModal.guide1')}</List.Item>
            <List.Item>{t('startModal.guide2')}</List.Item>
            <List.Item>
              {t('startModal.guide3Before')} <strong>{t('startModal.guide3Debit')}</strong>{' '}
              {t('startModal.guide3And')} <strong>{t('startModal.guide3Credit')}</strong>{' '}
              {t('startModal.guide3After')}
            </List.Item>
          </List>
        </Alert>

        <Group justify="flex-end" gap="sm" mt="sm">
          <Button variant="default" onClick={onClose} radius="md">
            {t('startModal.cancel')}
          </Button>
          <Button
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
            onClick={handleConfirm}
            radius="md"
            rightSection={<IconArrowRight size={16} />}
          >
            {t('startModal.continue')}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default BeginningBalanceModal;
