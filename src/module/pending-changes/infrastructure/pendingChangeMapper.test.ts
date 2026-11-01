import { toPendingChange, toPendingChangeList } from './pendingChangeMapper';
import type { PendingChangeDto } from './pendingChangeDto';

const dto = (overrides: Partial<PendingChangeDto> = {}): PendingChangeDto => ({
  id: 'c1',
  type: 'FINE',
  referenceModel: 'Sale',
  referenceId: 's1',
  status: 'APPROVED',
  payload: { newLateFeeAmount: 1500.5 },
  ...overrides,
});

describe('pending change mapper', () => {
  it('keeps the fields of the DTO', () => {
    expect(toPendingChange(dto())).toEqual({
      id: 'c1',
      type: 'FINE',
      referenceModel: 'Sale',
      referenceId: 's1',
      status: 'APPROVED',
      payload: { newLateFeeAmount: 1500.5 },
    });
  });

  it('replaces a missing payload with an empty object', () => {
    expect(toPendingChange(dto({ payload: null })).payload).toEqual({});
    expect(toPendingChange(dto({ payload: undefined })).payload).toEqual({});
  });

  it('maps an unknown status to pending', () => {
    expect(toPendingChange(dto({ status: 'WHATEVER' })).status).toBe('PENDING');
  });

  it('maps every item of a list and keeps the pagination', () => {
    const pagination = { total: 2, page: 1, limit: 10, totalPages: 1 };

    const result = toPendingChangeList({ data: [dto(), dto({ id: 'c2' })], pagination });

    expect(result.data.map((item) => item.id)).toEqual(['c1', 'c2']);
    expect(result.pagination).toBe(pagination);
  });
});
