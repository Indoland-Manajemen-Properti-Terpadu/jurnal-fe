import { Group, Select, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import {
  APPLIES_TO_FILTERS,
  STATUS_FILTERS,
  type usePaymentTermListParams,
} from '@/module/settings/presentation/hooks/usePaymentTermListParams';

type Props = { filters: ReturnType<typeof usePaymentTermListParams> };

/** Search, "Untuk" and status filters on one line. */
export function PaymentTermFilters({ filters }: Readonly<Props>) {
  const { t: st } = useTranslation('settings');

  return (
    <Group gap="sm" wrap="wrap">
      <TextInput
        placeholder={st('paymentTerm.search')}
        aria-label={st('paymentTerm.search')}
        leftSection={<IconSearch size={16} />}
        value={filters.searchInput}
        onChange={(event) => filters.setSearchInput(event.currentTarget.value)}
        w={{ base: '100%', sm: 260 }}
        radius="md"
      />
      <Select
        aria-label={st('paymentTerm.filterAppliesTo')}
        placeholder={`${st('paymentTerm.filterAppliesTo')}: ${st('paymentTerm.filterAll')}`}
        data={APPLIES_TO_FILTERS.map((value) => ({
          value,
          label: st(`paymentTerm.appliesTo.${value}`),
        }))}
        value={filters.appliesTo ?? null}
        onChange={filters.setAppliesTo}
        clearable
        radius="md"
        w={{ base: '100%', sm: 190 }}
      />
      <Select
        aria-label={st('paymentTerm.filterStatus')}
        placeholder={`${st('paymentTerm.filterStatus')}: ${st('paymentTerm.filterAll')}`}
        data={STATUS_FILTERS.map((value) => ({
          value,
          label: st(`paymentTerm.status.${value}`),
        }))}
        value={filters.status ?? null}
        onChange={filters.setStatus}
        clearable
        radius="md"
        w={{ base: '100%', sm: 190 }}
      />
    </Group>
  );
}

export default PaymentTermFilters;
