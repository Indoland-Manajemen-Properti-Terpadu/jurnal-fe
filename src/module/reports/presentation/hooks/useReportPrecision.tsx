import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_DECIMAL_PRECISION } from '@/utils/formatMoney';
import { useDecimalPrecision } from '@/module/settings';

const ReportPrecisionContext = createContext<number>(DEFAULT_DECIMAL_PRECISION);

/**
 * Gives the report below the `precision` its API response came with (rounded by the server);
 * the site setting while the response has none (older server, or not loaded yet).
 */
export function ReportPrecisionProvider({
  precision,
  children,
}: {
  precision: number | undefined;
  children: ReactNode;
}) {
  const fromSettings = useDecimalPrecision();
  return (
    <ReportPrecisionContext.Provider value={precision ?? fromSettings}>
      {children}
    </ReportPrecisionContext.Provider>
  );
}

export const useReportPrecision = (): number => useContext(ReportPrecisionContext);
