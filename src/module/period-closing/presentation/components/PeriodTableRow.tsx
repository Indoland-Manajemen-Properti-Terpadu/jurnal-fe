import { Badge, Group, Stack, Table, Text, ThemeIcon, Tooltip } from '@mantine/core';
import { IconBook2, IconLock } from '@tabler/icons-react';
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

function StatusBadge({ period }: Readonly<{ period: AccountingPeriod }>) {
  const { t } = useTranslation('periodClosing');
  if (period.isActive) {
    return (
      <Badge variant="light" color="teal" c="teal.9" radius="sm" tt="none">
        {t('table.active')}
      </Badge>
    );
  }
  const reopened = period.type === 'CLOSE';
  return (
    <Badge
      variant="light"
      color={reopened ? 'orange' : 'gray'}
      c={reopened ? 'orange.9' : 'gray.8'}
      radius="sm"
      tt="none"
    >
      {reopened ? t('table.reopened') : t('table.inactive')}
    </Badge>
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
        {period.type === 'CLOSE' && !period.isActive && period.reopenedAt && (
          <Text size="xs" c="dimmed" mt={2}>
            {period.reopenedBy?.name
              ? t('table.reopenedByOn', {
                  date: formatDay(timestampDay(period.reopenedAt), currentLanguage),
                  name: period.reopenedBy.name,
                })
              : t('table.reopenedOn', {
                  date: formatDay(timestampDay(period.reopenedAt), currentLanguage),
                })}
          </Text>
        )}
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
        <PeriodRowActions
          period={period}
          access={access}
          isLatestClosing={isLatestClosing}
          onAction={onAction}
        />
      </Table.Td>
    </Table.Tr>
  );
}
