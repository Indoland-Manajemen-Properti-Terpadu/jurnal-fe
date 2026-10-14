import type { GeneralLedgerExportType, ReportPeriod } from '../../domain/entities/generalLedger';
import type { GeneralLedgerRepository } from '../../domain/repositories/generalLedgerRepository';
import { validateReportPeriod } from './getGeneralLedger';

export function exportGeneralLedger(
  repository: GeneralLedgerRepository,
  period: ReportPeriod,
  type: GeneralLedgerExportType
) {
  validateReportPeriod(period);
  return repository.export(period, type);
}
