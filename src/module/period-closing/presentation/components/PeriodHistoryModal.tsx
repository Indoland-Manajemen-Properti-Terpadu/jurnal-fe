import { Group, Modal, Stack, Text, ThemeIcon, Timeline } from '@mantine/core';
import {
  IconCircleCheck,
  IconCirclePlus,
  IconLockOff,
  IconLockOpen,
  IconPencil,
  IconPower,
  IconRotate2,
  IconTrash,
  IconHistory,
} from '@tabler/icons-react';
import type { ReactNode } from 'react';
import { useTranslation } from '@/i18n';
import type {
  AccountingPeriod,
  PeriodActivity,
  PeriodActivityAction,
  PeriodChange,
} from '@/module/period-closing/domain/accountingPeriod';
import { formatDay, formatTimestamp } from '@/module/period-closing/presentation/periodFormat';

interface PeriodHistoryModalProps {
  period: AccountingPeriod;
  onClose: () => void;
}

const ACTION_ICON: Record<PeriodActivityAction, ReactNode> = {
  CREATE: <IconCirclePlus size={14} />,
  UPDATE: <IconPencil size={14} />,
  ACTIVATE: <IconPower size={14} />,
  DEACTIVATE: <IconLockOff size={14} />,
  DELETE: <IconTrash size={14} />,
  CLOSE: <IconCircleCheck size={14} />,
  REOPEN: <IconRotate2 size={14} />,
  OTHER: <IconLockOpen size={14} />,
};

const DATE_FIELDS = new Set(['startDate', 'endDate']);

/** Every change of a period, oldest first, with who made it and what it changed. */
export function PeriodHistoryModal({ period, onClose }: Readonly<PeriodHistoryModalProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');

  const fieldLabel = (field: string) =>
    t(
      `history.fields.${['name', 'notes', 'startDate', 'endDate', 'isActive'].includes(field) ? field : 'other'}`
    );

  const valueText = (change: PeriodChange, value: string) => {
    if (!value) return t('history.empty');
    if (DATE_FIELDS.has(change.field)) return formatDay(value, currentLanguage);
    if (change.field === 'isActive') {
      return value === 'true' ? t('table.status_ACTIVE') : t('table.status_INACTIVE');
    }
    return value;
  };

  const renderItem = (activity: PeriodActivity, index: number) => (
    <Timeline.Item
      key={`${activity.action}-${activity.performedAt ?? index}`}
      bullet={ACTION_ICON[activity.action]}
      title={
        <Text size="sm" fw={600}>
          {t(`history.actions.${activity.action}`)}
        </Text>
      }
    >
      <Text size="xs" c="dimmed">
        {[
          activity.performedAt ? formatTimestamp(activity.performedAt, currentLanguage) : '',
          activity.performedBy?.name ? t('history.by', { name: activity.performedBy.name }) : '',
        ]
          .filter(Boolean)
          .join(' · ')}
      </Text>
      {activity.changes.map((change) => (
        <Text key={change.field} size="sm" mt={4}>
          {t('history.change', {
            field: fieldLabel(change.field),
            from: valueText(change, change.from),
            to: valueText(change, change.to),
          })}
        </Text>
      ))}
    </Timeline.Item>
  );

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      size="lg"
      radius="lg"
      title={
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={36} radius="md" variant="light" color="gray">
            <IconHistory size={20} />
          </ThemeIcon>
          <Stack gap={0}>
            <Text fw={700}>{t('history.title')}</Text>
            <Text size="xs" c="dimmed" lineClamp={1}>
              {period.name}
            </Text>
          </Stack>
        </Group>
      }
    >
      <Timeline active={period.activities.length} bulletSize={24} lineWidth={2} color="gray">
        {period.activities.map(renderItem)}
      </Timeline>
    </Modal>
  );
}
