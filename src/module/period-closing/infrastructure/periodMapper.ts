import type {
  AccountingPeriod,
  DateLockCheck,
  PeriodActivity,
  PeriodActivityAction,
  PeriodChange,
  PeriodPage,
  PeriodStatus,
  PeriodUser,
} from '@/module/period-closing/domain/accountingPeriod';
import type {
  DateCheckDto,
  PeriodActivityDto,
  PeriodChangeDto,
  PeriodDto,
  PeriodListDto,
  PeriodUserDto,
} from './periodDto';

/** The calendar day of a date the server stores at UTC midnight; no time zone is applied. */
export const toCalendarDay = (value: string | undefined): string => (value ?? '').slice(0, 10);

const mapUser = (dto: PeriodUserDto | undefined): PeriodUser | null => {
  if (!dto || typeof dto === 'string') return null;
  const id = dto.id ?? dto._id ?? '';
  return id || dto.name ? { id, name: dto.name ?? dto.email ?? '' } : null;
};

const STATUSES: readonly PeriodStatus[] = ['ACTIVE', 'INACTIVE', 'DELETED', 'REOPENED'];

const ACTIONS: readonly PeriodActivityAction[] = [
  'CREATE',
  'UPDATE',
  'ACTIVATE',
  'DEACTIVATE',
  'DELETE',
  'CLOSE',
  'REOPEN',
];

/** The server's `status`; for a row without one (an older response) it is worked out from the flags. */
const mapStatus = (dto: PeriodDto): PeriodStatus => {
  const known = STATUSES.find((status) => status === dto.status);
  if (known) return known;
  if (dto.deleted) return 'DELETED';
  if (dto.isActive === false) return dto.type === 'CLOSE' ? 'REOPENED' : 'INACTIVE';
  return 'ACTIVE';
};

/** A stored date arrives as an ISO timestamp, a sent one as `YYYY-MM-DD`; both read as a day. */
const changeText = (field: string, value: unknown): string => {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') {
    return field === 'startDate' || field === 'endDate' ? toCalendarDay(value) : value;
  }
  return String(value);
};

const mapChange = (dto: PeriodChangeDto): PeriodChange => {
  const field = dto.field ?? '';
  return { field, from: changeText(field, dto.from), to: changeText(field, dto.to) };
};

const mapActivity = (dto: PeriodActivityDto): PeriodActivity => ({
  action: ACTIONS.find((action) => action === dto.action) ?? 'OTHER',
  performedBy: mapUser(dto.performedBy),
  performedAt: dto.performedAt ?? null,
  changes: (dto.changes ?? []).map(mapChange).filter((change) => change.field),
});

/** Who did the last `action`, from the log; used when the row's own `…By` field comes empty. */
const performerOf = (activities: PeriodActivity[], action: PeriodActivityAction) =>
  [...activities].reverse().find((activity) => activity.action === action)?.performedBy ?? null;

export const mapPeriod = (dto: PeriodDto): AccountingPeriod => {
  const activities = (dto.activities ?? []).map(mapActivity);
  return {
    id: dto.id ?? dto._id ?? '',
    name: dto.name ?? '',
    type: dto.type === 'CLOSE' ? 'CLOSE' : 'LOCK',
    startDate: toCalendarDay(dto.startDate),
    endDate: toCalendarDay(dto.endDate),
    isActive: dto.isActive !== false,
    status: mapStatus(dto),
    notes: dto.notes ?? '',
    createdBy: mapUser(dto.createdBy),
    closingJournalId: dto.closingJournalId || null,
    reopenedAt: dto.reopenedAt ?? null,
    reopenedBy: mapUser(dto.reopenedBy),
    deactivatedAt: dto.deactivatedAt ?? null,
    deactivatedBy: mapUser(dto.deactivatedBy) ?? performerOf(activities, 'DEACTIVATE'),
    deletedAt: dto.deletedAt ?? null,
    deletedBy: mapUser(dto.deletedBy) ?? performerOf(activities, 'DELETE'),
    activities,
    createdAt: dto.createdAt ?? null,
    updatedAt: dto.updatedAt ?? null,
  };
};

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
