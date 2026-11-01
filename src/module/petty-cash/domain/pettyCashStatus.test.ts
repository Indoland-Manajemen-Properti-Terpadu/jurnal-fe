import {
  VOUCHER_STATUSES,
  voucherActionsFor,
  voucherStatusTone,
} from '@/module/petty-cash/domain/pettyCashStatus';

describe('voucherActionsFor', () => {
  it('lets a draft be edited, submitted and given attachments', () => {
    expect(voucherActionsFor('DRAFT', 'DIRECT')).toEqual([
      'edit',
      'submit',
      'uploadAttachment',
      'deleteAttachment',
    ]);
  });

  it('sends a rejected voucher back through edit before it can be submitted again', () => {
    expect(voucherActionsFor('REJECTED', 'DIRECT')).toEqual([
      'edit',
      'uploadAttachment',
      'deleteAttachment',
    ]);
  });

  it('offers approval decisions and void while approval is pending', () => {
    expect(voucherActionsFor('PENDING_APPROVAL', 'DIRECT')).toEqual([
      'approve',
      'reject',
      'void',
      'uploadAttachment',
    ]);
  });

  it('allows void and attachments while waiting for reimbursement', () => {
    expect(voucherActionsFor('PENDING_REIMBURSE', 'DIRECT')).toEqual(['void', 'uploadAttachment']);
  });

  it('never voids or attaches to a voucher that came from a kasbon settlement', () => {
    expect(voucherActionsFor('PENDING_REIMBURSE', 'ADVANCE')).toEqual([]);
  });

  it('offers nothing once the voucher is in or past reimbursement, or void', () => {
    expect(voucherActionsFor('IN_REIMBURSEMENT', 'DIRECT')).toEqual([]);
    expect(voucherActionsFor('REIMBURSED', 'DIRECT')).toEqual([]);
    expect(voucherActionsFor('VOID', 'DIRECT')).toEqual([]);
  });
});

describe('voucherStatusTone', () => {
  it('has a tone for every status', () => {
    VOUCHER_STATUSES.forEach((status) => expect(voucherStatusTone[status]).toBeDefined());
  });

  it('keeps red for rejection only, never for a normal expense', () => {
    expect(voucherStatusTone.REJECTED).toBe('danger');
    expect(voucherStatusTone.PENDING_REIMBURSE).not.toBe('danger');
    expect(voucherStatusTone.REIMBURSED).toBe('success');
  });
});
