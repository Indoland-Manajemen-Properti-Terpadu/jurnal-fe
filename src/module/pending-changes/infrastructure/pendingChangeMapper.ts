import type {
  PendingChangeItem,
  PendingChangeListResult,
  PendingChangePayload,
} from '../domain/pendingChange';
import { toPendingChangeStatus } from '../domain/pendingChangeStatus';
import type { PendingChangeDto, PendingChangeListDto } from './pendingChangeDto';

export const toPendingChange = (dto: PendingChangeDto): PendingChangeItem => ({
  ...dto,
  payload: (dto.payload ?? {}) as PendingChangePayload,
  status: toPendingChangeStatus(dto.status),
});

export const toPendingChangeList = (dto: PendingChangeListDto): PendingChangeListResult => ({
  data: dto.data.map(toPendingChange),
  pagination: dto.pagination,
});
