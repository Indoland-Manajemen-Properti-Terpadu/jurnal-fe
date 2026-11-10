import { useEffect, useRef, useState } from 'react';
import { Group } from '@mantine/core';
import { ReportSearchInput } from '@/module/reports';
import { useTranslation } from '@/i18n';
import type { JournalHistoryFilters } from '../../domain/journalHistory';

interface Props {
  filters: JournalHistoryFilters;
  /** Changes filters; the page goes back to 1 because the result set changed. */
  onChange: (patch: Partial<JournalHistoryFilters>) => void;
}

const SEARCH_DELAY = 400;

/** The search of the journal list, shown inside the report toolbar beside the period. */
export function JournalHistoryFilterBar({ filters, onChange }: Readonly<Props>) {
  const { t } = useTranslation('journalEntries');

  // The box keeps what is typed; the address (and the request) follow after a pause.
  const [searchInput, setSearchInput] = useState(filters.search);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);
  // A back/forward move changes the address from outside the box.
  useEffect(() => {
    setSearchInput(filters.search);
  }, [filters.search]);

  const handleSearch = (value: string) => {
    setSearchInput(value);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      if (value.trim() !== filters.search) onChange({ search: value.trim() });
    }, SEARCH_DELAY);
  };

  return (
    <Group gap="sm" wrap="wrap">
      <ReportSearchInput
        value={searchInput}
        onChange={handleSearch}
        placeholder={t('history.filter.search')}
      />
    </Group>
  );
}
