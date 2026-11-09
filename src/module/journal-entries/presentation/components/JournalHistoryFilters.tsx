import { useEffect, useRef, useState } from 'react';
import { Group, Select, TextInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconCalendar, IconSearch } from '@tabler/icons-react';
import { useSimpleAccounts } from '@/module/chart-of-accounts';
import { useTranslation } from '@/i18n';
import type { JournalHistoryFilters } from '../../domain/journalHistory';

interface Props {
  filters: JournalHistoryFilters;
  /** Changes filters; the page goes back to 1 because the result set changed. */
  onChange: (patch: Partial<JournalHistoryFilters>) => void;
}

const SEARCH_DELAY = 400;

/** Search, account and date range: the same one-row toolbar as the account list. */
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
      <TextInput
        placeholder={t('history.filter.search')}
        aria-label={t('history.filter.search')}
        leftSection={<IconSearch size={16} />}
        value={searchInput}
        onChange={(event) => handleSearch(event.currentTarget.value)}
        w={{ base: '100%', sm: 280 }}
        radius="md"
        size="sm"
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
        w={{ base: '100%', sm: 280 }}
        radius="md"
        size="sm"
        comboboxProps={{ width: 320, position: 'bottom-start' }}
      />
      <DatePickerInput
        type="range"
        placeholder={t('history.filter.dateRange')}
        aria-label={t('history.filter.dateRange')}
        valueFormat="DD MMM YYYY"
        leftSection={<IconCalendar size={16} />}
        clearable
        value={[filters.startDate || null, filters.endDate || null]}
        onChange={([from, to]) =>
          onChange({
            startDate: from ? String(from).slice(0, 10) : '',
            endDate: to ? String(to).slice(0, 10) : '',
          })
        }
        w={{ base: '100%', sm: 260 }}
        radius="md"
        size="sm"
      />
    </Group>
  );
}
