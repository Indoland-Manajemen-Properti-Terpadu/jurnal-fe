import { Badge } from '@mantine/core';
import { useTranslation } from '@/i18n';

const COLORS: Record<string, string> = { ACTIVE: 'teal', VOID: 'red', REVERSAL: 'gray' };

/** Status of a journal entry: active, voided, or the reversal that voided another. */
export function JournalStatusBadge({ status }: Readonly<{ status: string }>) {
  const { t } = useTranslation('journalEntries');
  const known = status in COLORS;
  return (
    <Badge variant="light" color={COLORS[status] ?? 'gray'} radius="sm" size="sm">
      {known ? t(`history.statusOption.${status}`) : status || '—'}
    </Badge>
  );
}
