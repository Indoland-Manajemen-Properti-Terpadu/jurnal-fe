import { PENDING_CHANGE_STATUSES } from './pendingChange';
import { canApprove, isPendingChangeStatus, toPendingChangeStatus } from './pendingChangeStatus';

describe('pending change status vocabulary', () => {
  it('lists pending, approved and rejected', () => {
    expect([...PENDING_CHANGE_STATUSES]).toEqual(['PENDING', 'APPROVED', 'REJECTED']);
  });

  it('recognises known statuses only', () => {
    expect(isPendingChangeStatus('APPROVED')).toBe(true);
    expect(isPendingChangeStatus('approved')).toBe(false);
    expect(isPendingChangeStatus(undefined)).toBe(false);
  });

  it('treats an unknown status as pending', () => {
    expect(toPendingChangeStatus('APPROVED')).toBe('APPROVED');
    expect(toPendingChangeStatus('SOMETHING_NEW')).toBe('PENDING');
    expect(toPendingChangeStatus(null)).toBe('PENDING');
  });

  it('allows approval of everything except an approved change', () => {
    expect(canApprove('PENDING')).toBe(true);
    expect(canApprove('REJECTED')).toBe(true);
    expect(canApprove('APPROVED')).toBe(false);
  });
});
