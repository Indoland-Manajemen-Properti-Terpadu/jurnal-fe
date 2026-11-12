import type {
  AccountingPeriod,
  DateLockCheck,
  PeriodPage,
  PeriodUser,
} from '@/module/period-closing/domain/accountingPeriod';
import type { DateCheckDto, PeriodDto, PeriodListDto, PeriodUserDto } from './periodDto';

/** The calendar day of a date the server stores at UTC midnight; no time zone is applied. */
export const toCalendarDay = (value: string | undefined): string => (value ?? '').slice(0, 10);

const mapUser = (dto: PeriodUserDto | undefined): PeriodUser | null => {
  if (!dto || typeof dto === 'string') return null;
  const id = dto.id ?? dto._id ?? '';
  return id || dto.name ? { id, name: dto.name ?? dto.email ?? '' } : null;
};

export const mapPeriod = (dto: PeriodDto): AccountingPeriod => ({
  id: dto.id ?? dto._id ?? '',
  name: dto.name ?? '',
  type: dto.type === 'CLOSE' ? 'CLOSE' : 'LOCK',
  startDate: toCalendarDay(dto.startDate),
  endDate: toCalendarDay(dto.endDate),
  isActive: dto.isActive !== false,
  notes: dto.notes ?? '',
  createdBy: mapUser(dto.createdBy),
  closingJournalId: dto.closingJournalId || null,
  reopenedAt: dto.reopenedAt ?? null,
  reopenedBy: mapUser(dto.reopenedBy),
  createdAt: dto.createdAt ?? null,
  updatedAt: dto.updatedAt ?? null,
});

export const mapPeriodPage = (
  dto: PeriodListDto | undefined,
  fallbackLimit: number
): PeriodPage => {
  const items = (dto?.results ?? []).map(mapPeriod);
  const page = dto?.page ?? 1;
  const limit = dto?.limit ?? fallbackLimit;
  // The server's count also takes deleted periods (seen 2026-11-12: `totalResults: 1` with no
  // results). A page that is not full is the last one, so its own rows give the exact total.
  const isLastPage = items.length < limit;
  const total = isLastPage
    ? (page - 1) * limit + items.length
    : (dto?.totalResults ?? items.length);
  return {
    items,
    pagination: {
      page,
      limit,
      totalPages: isLastPage ? page : Math.max(dto?.totalPages ?? 1, page),
      total,
    },
  };
};

export const mapDateCheck = (dto: DateCheckDto | undefined): DateLockCheck => ({
  isLocked: Boolean(dto?.isLocked),
  period: dto?.period ? mapPeriod(dto.period) : null,
});
