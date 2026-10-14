import { isMatch } from 'date-fns';
import type { ReportPeriod } from '../../domain/entities/generalLedger';
import type { GeneralLedgerRepository } from '../../domain/repositories/generalLedgerRepository';

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export function validateReportPeriod(period: ReportPeriod): void {
  if (!DATE_ONLY.test(period.startDate) || !DATE_ONLY.test(period.endDate)
    || !isMatch(period.startDate, 'yyyy-MM-dd') || !isMatch(period.endDate, 'yyyy-MM-dd')
    || period.startDate > period.endDate) {
    throw new Error('Pilih rentang tanggal yang valid. Tanggal akhir harus setelah tanggal awal.');
  }
}

export function getGeneralLedger(repository: GeneralLedgerRepository, period: ReportPeriod) {
  validateReportPeriod(period);
  return repository.get(period);
}
