import { ActionIcon, Badge, Group, Stack, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconBook2, IconHistory, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { countDays } from '@/module/period-closing/domain/periodRules';
import type { PeriodAccess } from '@/module/period-closing/presentation/hooks/usePeriodAccess';
import {
  formatDay,
  formatRange,
  timestampDay,
} from '@/module/period-closing/presentation/periodFormat';
import { PeriodRowActions, type PeriodAction } from './PeriodRowActions';

interface PeriodTableRowProps {
  period: AccountingPeriod;
  access: PeriodAccess;
  isLatestClosing: boolean;
  onAction: (action: PeriodAction, period: AccountingPeriod) => void;
}

/** The type as an icon alone (closed lock or closed book); the name is its tooltip and screen reader label. */
export function PeriodTypeBadge({ type }: Readonly<{ type: AccountingPeriod['type'] }>) {
  const { t } = useTranslation('periodClosing');
  const isLock = type === 'LOCK';
  const label = t(`types.${type}`);
  return (
    <Tooltip label={label} withArrow>
      <ThemeIcon
        size={32}
        radius="md"
        variant="light"
        color={isLock ? 'orange' : 'primary'}
        role="img"
        aria-label={label}
      >
        {isLock ? <IconLock size={18} /> : <IconBook2 size={18} />}
      </ThemeIcon>
    </Tooltip>
  );
}

const STATUS_STYLE = {
  ACTIVE: { color: 'teal', text: 'teal.9' },
  INACTIVE: { color: 'gray', text: 'gray.8' },
  REOPENED: { color: 'orange', text: 'orange.9' },
  DELETED: { color: 'red', text: 'red.9' },
} as const;

function StatusBadge({ period }: Readonly<{ period: AccountingPeriod }>) {
  const { t } = useTranslation('periodClosing');
  const style = STATUS_STYLE[period.status];
  return (
    <Badge variant="light" color={style.color} c={style.text} radius="sm" tt="none">
      {t(`table.status_${period.status}`)}
    </Badge>
  );
}

/** Who did what and when, under the status: the delete, the switch off, or the reopening. */
function StatusDetail({ period }: Readonly<{ period: AccountingPeriod }>) {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const detail = (() => {
    switch (period.status) {
      case 'DELETED':
        return { at: period.deletedAt, by: period.deletedBy?.name, key: 'deleted' };
      case 'INACTIVE':
        return { at: period.deactivatedAt, by: period.deactivatedBy?.name, key: 'deactivated' };
      case 'REOPENED':
        return { at: period.reopenedAt, by: period.reopenedBy?.name, key: 'reopened' };
      default:
        return null;
    }
  })();
  if (!detail?.at) return null;
  const date = formatDay(timestampDay(detail.at), currentLanguage);
  return (
    <Text size="xs" c="dimmed" mt={2}>
      {detail.by
        ? t(`table.${detail.key}ByOn`, { date, name: detail.by })
        : t(`table.${detail.key}On`, { date })}
    </Text>
  );
}

export function PeriodTableRow({
  period,
  access,
  isLatestClosing,
  onAction,
}: Readonly<PeriodTableRowProps>) {
  const { t, currentLanguage } = useTranslation('periodClosing');

  return (
    <Table.Tr>
      <Table.Td>
        <Stack gap={2}>
          <Group gap={6} wrap="nowrap">
            <Text size="sm" fw={600} lineClamp={1}>
              {period.name}
            </Text>
            {isLatestClosing && (
              <Badge size="xs" variant="filled" color="primary" radius="sm" tt="none">
                {t('table.latestClosing')}
              </Badge>
            )}
          </Group>
          {period.notes && (
            <Text size="xs" c="dimmed" lineClamp={1}>
              {period.notes}
            </Text>
          )}
        </Stack>
      </Table.Td>
      <Table.Td>
        <PeriodTypeBadge type={period.type} />
      </Table.Td>
      <Table.Td>
        <Text size="sm" style={{ whiteSpace: 'nowrap' }}>
          {formatRange(period, currentLanguage)}
        </Text>
        <Text size="xs" c="dimmed">
          {t('table.days', { count: countDays(period) })}
        </Text>
      </Table.Td>
      <Table.Td>
        <StatusBadge period={period} />
        <StatusDetail period={period} />
      </Table.Td>
      <Table.Td>
        <Text size="sm" lineClamp={1}>
          {period.createdBy?.name || '—'}
        </Text>
        {period.createdAt && (
          <Text size="xs" c="dimmed">
            {formatDay(timestampDay(period.createdAt), currentLanguage)}
          </Text>
        )}
      </Table.Td>
      <Table.Td ta="center">
        <Group gap={4} justify="center" wrap="nowrap">
          {period.activities.length > 0 && (
            <Tooltip label={t('history.open')} withArrow>
              <ActionIcon
                variant="subtle"
                color="gray"
                aria-label={t('history.openFor', { name: period.name })}
                onClick={() => onAction('history', period)}
              >
                <IconHistory size={18} />
              </ActionIcon>
            </Tooltip>
          )}
          <PeriodRowActions
            period={period}
            access={access}
            isLatestClosing={isLatestClosing}
            onAction={onAction}
          />
        </Group>
      </Table.Td>
    </Table.Tr>
  );
}
