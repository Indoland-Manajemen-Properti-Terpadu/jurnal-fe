import {
  useAccountMappings,
  useGeneralSettings,
  useNumberFormats,
  useTaxes,
} from '../hooks/useSettingQueries';

export type OverviewStatus =
  | { state: 'loading' }
  | { state: 'error' }
  | { state: 'ready'; count: number };

export function useSettingsOverview() {
  const general = useGeneralSettings();
  const mappings = useAccountMappings();
  const formats = useNumberFormats();
  const taxes = useTaxes();

  const mappingItems = Object.values(mappings.data ?? {}).flatMap((items) => items ?? []);
  const missingMappings = mappingItems.filter((item) => !item.account).length;

  const toStatus = (
    query: { isPending: boolean; isError: boolean },
    count: number
  ): OverviewStatus => {
    if (query.isPending) return { state: 'loading' };
    if (query.isError) return { state: 'error' };
    return { state: 'ready', count };
  };

  return {
    precision: toStatus(general, general.data?.decimalPrecision ?? 0),
    mappings: toStatus(mappings, missingMappings),
    mappingTotal: mappingItems.length,
    activeFormats: toStatus(
      formats,
      formats.data?.filter((item) => item.status === 'active').length ?? 0
    ),
    taxRates: toStatus(taxes, taxes.data?.length ?? 0),
  };
}
