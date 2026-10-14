import type { GeneralLedgerExportType, GeneralLedgerReport, ReportPeriod } from '../entities/generalLedger';

export interface GeneralLedgerRepository {
  get: (period: ReportPeriod) => Promise<GeneralLedgerReport>;
  export: (period: ReportPeriod, type: GeneralLedgerExportType) => Promise<Blob>;
}
