import {
  allowedVoucherActions,
  canAccess,
  isFundCustodian,
  type PettyCashAccessProfile,
} from '@/module/petty-cash/domain/pettyCashAccess';

const right = (create = false, read = false, update = false, remove = false) => ({
  create,
  read,
  update,
  delete: remove,
});

const custodian: PettyCashAccessProfile = {
  userId: 'u-custodian',
  isSuperAdmin: false,
  rights: { 'JP-PC': right(false, true), 'JP-PC-VCH': right(true, true, true, true) },
};

const approver: PettyCashAccessProfile = {
  userId: 'u-approver',
  isSuperAdmin: false,
  rights: { 'JP-PC': right(false, true), 'JP-PC-APR': right(false, true, true) },
};

const superAdmin: PettyCashAccessProfile = { userId: 'u-admin', isSuperAdmin: true, rights: {} };

const fund = { custodianId: 'u-custodian', singleUserOverride: false };

describe('canAccess', () => {
  it('reads the menu right for the action', () => {
    expect(canAccess(custodian, 'JP-PC-VCH', 'create')).toBe(true);
    expect(canAccess(approver, 'JP-PC-VCH', 'create')).toBe(false);
  });

  it('grants a superadmin every menu right', () => {
    expect(canAccess(superAdmin, 'JP-PC-DSB', 'update')).toBe(true);
  });
});

describe('isFundCustodian', () => {
  it('matches the fund custodian by user id', () => {
    expect(isFundCustodian(custodian, fund)).toBe(true);
    expect(isFundCustodian(approver, fund)).toBe(false);
  });

  it('treats a superadmin as custodian, as the backend does', () => {
    expect(isFundCustodian(superAdmin, fund)).toBe(true);
  });
});

describe('allowedVoucherActions', () => {
  const pending = {
    status: 'PENDING_APPROVAL' as const,
    source: 'DIRECT' as const,
    requestedById: 'u-custodian',
  };

  it('gives the approver the decision but not the custodian actions', () => {
    expect(allowedVoucherActions(approver, pending, fund)).toEqual(['approve', 'reject']);
  });

  it('keeps the creator from approving their own voucher', () => {
    const selfMade = { ...pending, requestedById: 'u-admin' };
    expect(allowedVoucherActions(superAdmin, selfMade, fund)).not.toContain('approve');
    expect(allowedVoucherActions(superAdmin, selfMade, fund)).toContain('void');
  });

  it('lets the creator approve when the fund allows a single user', () => {
    const selfMade = { ...pending, requestedById: 'u-admin' };
    const relaxed = { ...fund, singleUserOverride: true };
    expect(allowedVoucherActions(superAdmin, selfMade, relaxed)).toContain('approve');
  });

  it('lets the custodian edit and submit a draft but not someone without the voucher menu', () => {
    const draft = {
      status: 'DRAFT' as const,
      source: 'DIRECT' as const,
      requestedById: 'u-custodian',
    };
    expect(allowedVoucherActions(custodian, draft, fund)).toEqual([
      'edit',
      'submit',
      'uploadAttachment',
      'deleteAttachment',
    ]);
    expect(allowedVoucherActions(approver, draft, fund)).toEqual([]);
  });
});
