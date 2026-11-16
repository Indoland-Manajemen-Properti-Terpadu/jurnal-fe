/** Shapes of `/v1/accounting-periods` as the server sends them. */

export interface ApiEnvelope<T> {
  code: number;
  message: string;
  data: T;
}

/** `createdBy` is an object on the list and detail, a bare id elsewhere. */
export type PeriodUserDto =
  | string
  | { id?: string; _id?: string; name?: string; email?: string }
  | null;

export interface PeriodChangeDto {
  field?: string;
  from?: unknown;
  to?: unknown;
}

export interface PeriodActivityDto {
  action?: string;
  performedBy?: PeriodUserDto;
  performedAt?: string | null;
  changes?: PeriodChangeDto[] | null;
}

export interface PeriodDto {
  id?: string;
  _id?: string;
  name?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
  /** `ACTIVE`, `INACTIVE`, `DELETED` or `REOPENED`; the only field the label is read from. */
  status?: string;
  notes?: string | null;
  createdBy?: PeriodUserDto;
  closedBy?: PeriodUserDto;
  closingJournalId?: string | null;
  reopenedBy?: PeriodUserDto;
  reopenedAt?: string | null;
  deactivatedBy?: PeriodUserDto;
  deactivatedAt?: string | null;
  deleted?: boolean;
  deletedBy?: PeriodUserDto;
  deletedAt?: string | null;
  /** Oldest first. Empty on locks changed before the log existed. */
  activities?: PeriodActivityDto[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface PeriodListDto {
  results?: PeriodDto[];
  page?: number;
  limit?: number;
  totalPages?: number;
  totalResults?: number;
}

export interface DateCheckDto {
  isLocked?: boolean;
  period?: PeriodDto | null;
}
