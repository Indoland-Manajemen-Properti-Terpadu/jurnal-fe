import { useEffect, useRef, useState } from 'react';
import { Group, Select } from '@mantine/core';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { ReportSearchInput } from '@/module/reports';
import { useTranslation } from '@/i18n';
import type { JournalHistoryFilters } from '../../domain/journalHistory';

interface Props {
  filters: JournalHistoryFilters;
  /** Changes filters; the page goes back to 1 because the result set changed. */
  onChange: (patch: Partial<JournalHistoryFilters>) => void;
}

const SEARCH_DELAY = 400;

/** Search and account, shown inside the report toolbar beside the period; it owns the dates. */
export function JournalHistoryFilterBar({ filters, onChange }: Readonly<Props>) {
  const { t } = useTranslation('journalEntries');
  const { accounts } = useSimpleAccounts();

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

  const accountOptions = accounts
    .filter((account) => !account.isHead)
    .map((account) => ({ value: account.id, label: `${account.accountNumber} · ${account.name}` }));

  return (
    <Group gap="sm" wrap="wrap">
      <ReportSearchInput
        value={searchInput}
        onChange={handleSearch}
        placeholder={t('history.filter.search')}
      />
      <Select
        placeholder={t('history.filter.accounts')}
        aria-label={t('history.filter.accounts')}
        nothingFoundMessage={t('history.filter.accountsEmpty')}
        data={accountOptions}
        value={filters.accounts[0] ?? null}
        onChange={(value) => onChange({ accounts: value ? [value] : [] })}
        searchable
        clearable={filters.accounts.length > 0}
        w={{ base: '100%', xs: 280 }}
        radius="md"
        size="sm"
        comboboxProps={{ width: 320, position: 'bottom-start' }}
      />
    </Group>
  );
}
