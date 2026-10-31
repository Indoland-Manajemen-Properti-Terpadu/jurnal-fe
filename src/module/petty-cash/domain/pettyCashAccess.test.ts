import {
  allowedCountActions,
  allowedReimbursementActions,
  allowedVoucherActions,
  canCountFund,
  canRequestReplenishment,
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

const profileWith = (userId: string, rights: Record<string, ReturnType<typeof right>>) =>
  ({ userId, isSuperAdmin: false, rights }) as PettyCashAccessProfile;

describe('cash count rights', () => {
  const counter = profileWith('u-counter', { 'JP-PC-CNT': right(true, true) });
  const approverOnly = profileWith('u-approver', { 'JP-PC-APR': right(false, true, true) });

  it('lets someone other than the custodian with the count right count a fund', () => {
    expect(canCountFund(counter, { custodianId: 'u-custodian' })).toBe(true);
    expect(canCountFund(counter, { custodianId: 'u-counter' })).toBe(false);
    expect(canCountFund(approverOnly, { custodianId: 'u-custodian' })).toBe(false);
  });

  it('offers a draft only to its counter, to submit', () => {
    const draft = {
      status: 'DRAFT' as const,
      countedById: 'u-counter',
      custodianId: 'u-custodian',
    };
    expect(allowedCountActions(counter, draft)).toEqual(['submit']);
    expect(allowedCountActions(approverOnly, draft)).toEqual([]);
  });

  it('offers a submitted count to an independent approver, not to the counter or the custodian', () => {
    const submitted = {
      status: 'SUBMITTED' as const,
      countedById: 'u-counter',
      custodianId: 'u-custodian',
    };
    expect(allowedCountActions(approverOnly, submitted)).toEqual(['approve', 'reject']);
    const counterAlsoApprover = profileWith('u-counter', { 'JP-PC-APR': right(false, true, true) });
    expect(allowedCountActions(counterAlsoApprover, submitted)).toEqual([]);
    const custodianApprover = profileWith('u-custodian', { 'JP-PC-APR': right(false, true, true) });
    expect(allowedCountActions(custodianApprover, submitted)).toEqual([]);
  });

  it('offers nothing once a count is decided', () => {
    const done = {
      status: 'APPROVED' as const,
      countedById: 'u-counter',
      custodianId: 'u-custodian',
    };
    expect(allowedCountActions(approverOnly, done)).toEqual([]);
  });
});

describe('replenishment rights', () => {
  const custodianProfile = profileWith('u-custodian', {
    'JP-PC-RMB': right(true, true, false, true),
  });
  const approverUser = profileWith('u-approver', { 'JP-PC-APR': right(false, true, true) });
  const disburser = profileWith('u-disburser', { 'JP-PC-DSB': right(false, true, true) });
  const request = {
    status: 'SUBMITTED' as const,
    submittedById: 'u-custodian',
    approvedById: null,
  };

  it('lets only the custodian with the replenishment right ask for one', () => {
    expect(canRequestReplenishment(custodianProfile, fund)).toBe(true);
    expect(canRequestReplenishment(approverUser, fund)).toBe(false);
  });

  it('offers approve and reject to an approver other than the submitter', () => {
    expect(allowedReimbursementActions(approverUser, request)).toEqual(['approve', 'reject']);
    const selfApprover = profileWith('u-custodian', { 'JP-PC-APR': right(false, true, true) });
    expect(allowedReimbursementActions(selfApprover, request)).toEqual([]);
  });

  it('lets the submitter cancel before the money is paid out', () => {
    expect(allowedReimbursementActions(custodianProfile, request)).toEqual(['cancel']);
    expect(
      allowedReimbursementActions(custodianProfile, {
        ...request,
        status: 'APPROVED',
        approvedById: 'u-approver',
      })
    ).toEqual(['cancel']);
    expect(
      allowedReimbursementActions(custodianProfile, { ...request, status: 'DISBURSED' })
    ).toEqual([]);
  });

  it('offers disburse only on an approved request, to someone who neither submitted nor approved it', () => {
    const approved = {
      status: 'APPROVED' as const,
      submittedById: 'u-custodian',
      approvedById: 'u-approver',
    };
    expect(allowedReimbursementActions(disburser, approved)).toEqual(['disburse']);
    expect(allowedReimbursementActions(disburser, request)).toEqual([]);
    const approverWhoDisburses = profileWith('u-approver', {
      'JP-PC-DSB': right(false, true, true),
    });
    expect(allowedReimbursementActions(approverWhoDisburses, approved)).toEqual([]);
  });
});
