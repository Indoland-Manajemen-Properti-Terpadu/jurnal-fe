import { toDecimalPrecision } from '@/utils/formatMoney';
import { useGeneralSettings } from '@/module/settings/presentation/hooks/useGeneralSettings';

/** Decimal places of the site; 2 until the general settings are loaded. Shares the settings cache. */
export const useDecimalPrecision = (): number =>
  toDecimalPrecision(useGeneralSettings().data?.decimalPrecision);
