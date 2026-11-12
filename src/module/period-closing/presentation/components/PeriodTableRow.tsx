import { Badge, Group, Stack, Table, Text } from '@mantine/core';
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

export function PeriodTypeBadge({ type }: Readonly<{ type: AccountingPeriod['type'] }>) {
  const { t } = useTranslation('periodClosing');
  const isLock = type === 'LOCK';
  return (
    <Badge
      variant="light"
      color={isLock ? 'orange' : 'primary'}
      radius="sm"
      tt="none"
      leftSection={isLock ? <IconLock size={12} /> : <IconBook2 size={12} />}
    >
      {t(`types.${type}`)}
    </Badge>
  );
}

function StatusBadge({ period }: Readonly<{ period: AccountingPeriod }>) {
  const { t } = useTranslation('periodClosing');
  if (period.isActive) {
    return (
      <Badge variant="dot" color="teal" radius="sm" tt="none">
        {t('table.active')}
      </Badge>
    );
  }
  const reopened = period.type === 'CLOSE';
  return (
    <Badge variant="dot" color={reopened ? 'orange' : 'gray'} radius="sm" tt="none">
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
              <Badge size="xs" variant="outline" color="primary" radius="sm" tt="none">
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
