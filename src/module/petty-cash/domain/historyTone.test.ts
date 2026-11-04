import { auditActionTone } from '@/module/petty-cash/domain/historyTone';

describe('auditActionTone', () => {
  it('marks refusals and cancellations as danger', () => {
    expect(auditActionTone('REJECT')).toBe('danger');
    expect(auditActionTone('CUSTODIAN_REJECT')).toBe('danger');
    expect(auditActionTone('FINANCE_REJECT')).toBe('danger');
    expect(auditActionTone('VOID')).toBe('danger');
    expect(auditActionTone('CANCEL')).toBe('danger');
    expect(auditActionTone('CLOSE')).toBe('danger');
  });

  it('marks completed steps as success', () => {
    expect(auditActionTone('APPROVE_BM')).toBe('success');
    expect(auditActionTone('DISBURSE')).toBe('success');
    expect(auditActionTone('FINANCE_VERIFY')).toBe('success');
    expect(auditActionTone('UNBLOCK')).toBe('success');
  });

  it('marks creation and submission as info', () => {
    expect(auditActionTone('CREATE')).toBe('info');
    expect(auditActionTone('SUBMIT_SETTLEMENT')).toBe('info');
    expect(auditActionTone('ADD_POCKET')).toBe('info');
  });

  it('keeps other and unknown actions neutral', () => {
    expect(auditActionTone('UPDATE')).toBe('neutral');
    expect(auditActionTone('SOMETHING_NEW')).toBe('neutral');
  });
});
