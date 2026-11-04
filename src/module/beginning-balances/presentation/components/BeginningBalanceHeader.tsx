import React from 'react';
import { Button, Group, Stack, Text, Tooltip } from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconDeviceFloppy,
  IconHistory,
  IconScale,
} from '@tabler/icons-react';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { dateFormatV1 } from '@/utils/formatDate';

type Props = {
  statusLabel: string;
  isPublished: boolean;
  hasUnsavedChanges: boolean;
  selectedDate: string | null;
  canSaveDraft: boolean;
  saveDraftHint: string | null;
  canPublish: boolean;
  publishHint: string | null;
  isSavingDraft: boolean;
  isPublishing: boolean;
  onBack: () => void;
  onOpenLogs: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
};

/** A disabled button gets no hover events, so the tooltip with the reason sits on a wrapper. */
const WithReason: React.FC<{ reason: string | null; children: React.ReactNode }> = ({
  reason,
  children,
}) => (
  <Tooltip label={reason} disabled={!reason} withArrow>
    <span>{children}</span>
  </Tooltip>
);

const BeginningBalanceHeader: React.FC<Props> = ({
  statusLabel,
  isPublished,
  hasUnsavedChanges,
  selectedDate,
  canSaveDraft,
  saveDraftHint,
  canPublish,
  publishHint,
  isSavingDraft,
  isPublishing,
  onBack,
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
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
          >
            {t('page.back')}
          </Button>
          <Button
            variant="default"
            size="sm"
            leftSection={<IconHistory size={16} />}
            onClick={onOpenLogs}
          >
            {t('page.changeHistory')}
          </Button>
          {!isPublished && (
            <WithReason reason={saveDraftHint}>
              <Button
                variant="default"
                size="sm"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={onSaveDraft}
                loading={isSavingDraft}
                disabled={!canSaveDraft}
              >
                {t('page.saveDraft')}
              </Button>
            </WithReason>
          )}
          <WithReason reason={publishHint}>
            <Button
              size="sm"
              leftSection={<IconCheck size={16} />}
              onClick={onPublish}
              loading={isPublishing}
              disabled={!canPublish}
            >
              {isPublished ? t('page.updateAndPublish') : t('page.publish')}
            </Button>
          </WithReason>
        </Group>
      }
    />
  );
};

export default BeginningBalanceHeader;
