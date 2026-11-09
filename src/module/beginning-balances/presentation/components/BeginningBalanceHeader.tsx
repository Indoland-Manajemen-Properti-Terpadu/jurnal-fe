import React from 'react';
import { Button, Group, Stack, Text } from '@mantine/core';
import { IconCheck, IconDeviceFloppy, IconHistory, IconScale } from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  statusLabel: string;
  isPublished: boolean;
  hasUnsavedChanges: boolean;
  selectedDate: string | null;
  canSaveDraft: boolean;
  canPublish: boolean;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onOpenLogs: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

const BeginningBalanceHeader: React.FC<Props> = ({
  statusLabel,
  isPublished,
  hasUnsavedChanges,
  selectedDate,
  canSaveDraft,
  canPublish,
  isSavingDraft,
  isPublishing,
  onOpenLogs,
  onSaveDraft,
  onPublish,
}) => {
  const { t } = useTranslation('beginningBalances');

  return (
    <ModuleHeader
      icon={IconScale}
      title={t('page.title')}
      description={
        <Stack gap={4}>
          <Text fz="var(--jurnal-text-sm)" c="dimmed">
            {t('page.subtitle')}
          </Text>
          <Text fz="var(--jurnal-text-sm)" c="dimmed">
            <Text span fw={600} c="dark.7" fz="inherit">
              {statusLabel}
            </Text>
            {` · ${t('header.conversionDate', { date: dateFormatV1(selectedDate || new Date()) })}`}
            {hasUnsavedChanges && (
              <Text span c="orange.8" fz="inherit">
                {` · ${t('status.unsaved')}`}
              </Text>
            )}
          </Text>
        </Stack>
      }
      actions={
        <Group gap="xs" wrap="wrap">
          <Button
            variant="default"
            size="sm"
            leftSection={<IconHistory size={16} />}
            onClick={onOpenLogs}
          >
            {t('page.changeHistory')}
          </Button>
          {!isPublished && canSaveDraft && (
            <Button
              variant="default"
              size="sm"
              leftSection={<IconDeviceFloppy size={16} />}
              onClick={onSaveDraft}
              loading={isSavingDraft}
            >
              {t('page.saveDraft')}
            </Button>
          )}
          {canPublish && (
            <Button
              size="sm"
              leftSection={<IconCheck size={16} />}
              onClick={onPublish}
              loading={isPublishing}
            >
              {isPublished ? t('page.updateAndPublish') : t('page.publish')}
            </Button>
          )}
        </Group>
      }
    />
  );
};

export default BeginningBalanceHeader;
