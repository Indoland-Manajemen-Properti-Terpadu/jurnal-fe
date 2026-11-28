import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_DECIMAL_PRECISION, DEFAULT_NEGATIVE_NUMBER_FORMAT } from '@/utils/formatMoney';
import {
  useDecimalPrecision,
  useGeneralSettings,
  type NegativeNumberFormat,
} from '@/module/settings';

const ReportPrecisionContext = createContext<number>(DEFAULT_DECIMAL_PRECISION);
const ReportNegativeFormatContext = createContext<NegativeNumberFormat>(
  DEFAULT_NEGATIVE_NUMBER_FORMAT
);

/**
 * Gives the report below the `precision` its API response came with (rounded by the server);
 * the site setting while the response has none (older server, or not loaded yet).
 */
export function ReportPrecisionProvider({
  precision,
  negativeFormat,
  children,
}: {
  precision: number | undefined;
  negativeFormat?: NegativeNumberFormat;
  children: ReactNode;
}) {
  const fromSettings = useDecimalPrecision();
  const general = useGeneralSettings();
  const resolvedNegativeFormat =
    general.data?.negativeNumberFormat ?? negativeFormat ?? DEFAULT_NEGATIVE_NUMBER_FORMAT;
  return (
    <ReportNegativeFormatContext.Provider value={resolvedNegativeFormat}>
      <ReportPrecisionContext.Provider value={precision ?? fromSettings}>
        {children}
      </ReportPrecisionContext.Provider>
    </ReportNegativeFormatContext.Provider>
  );
}

export const useReportPrecision = (): number => useContext(ReportPrecisionContext);
export const useReportNegativeFormat = (): NegativeNumberFormat =>
  useContext(ReportNegativeFormatContext);
