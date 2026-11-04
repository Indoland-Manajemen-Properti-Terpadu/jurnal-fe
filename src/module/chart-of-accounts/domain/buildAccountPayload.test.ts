import { buildAccountPayload } from './buildAccountPayload';

const values = {
  name: '  Kas Kecil ',
  accountNumber: ' 1-10001 ',
  category: 'c1',
  taxType: '',
  isBankAndCash: true,
  isContra: false,
  desc: '  ',
};
const single = {
  accountType: 'SingleAccount',
  parentId: null,
  childId: null,
  accessScope: 'AllUsers',
  specialUsers: [],
  certainRoles: [],
};

describe('buildAccountPayload', () => {
  it('trims text, drops empty optionals and defaults to all users', () => {
    expect(buildAccountPayload(values, single)).toEqual({
      name: 'Kas Kecil',
      accountNumber: '1-10001',
      category: 'c1',
      taxType: undefined,
      isBankAndCash: true,
      isContra: false,
      desc: undefined,
      isAllUser: true,
    });
  });

  it('omits isBankAndCash for account creation', () => {
    const payload = buildAccountPayload(values, single, { includeBankCash: false });
    expect(payload).not.toHaveProperty('isBankAndCash');
  });

  it('sends the allowed users or roles for a restricted single account', () => {
    expect(
      buildAccountPayload(values, { ...single, accessScope: 'SpecialUsers', specialUsers: ['u1'] })
    ).toMatchObject({ isAllUser: false, allowedUsers: ['u1'] });
    expect(
      buildAccountPayload(values, { ...single, accessScope: 'CertainRoles', certainRoles: ['r1'] })
    ).toMatchObject({ isAllUser: false, allowedRoles: ['r1'] });
  });

  it('a Sub account sends headAccountId and defaults to all users', () => {
    const sub = { ...single, accountType: 'SubAccount', parentId: 'h1' };
    expect(buildAccountPayload(values, sub)).toMatchObject({
      headAccountId: 'h1',
      isAllUser: true,
    });
  });

  it('a Sub account can be restricted to users or roles', () => {
    const sub = { ...single, accountType: 'SubAccount', parentId: 'h1' };
    expect(
      buildAccountPayload(values, { ...sub, accessScope: 'SpecialUsers', specialUsers: ['u1'] })
    ).toMatchObject({ headAccountId: 'h1', isAllUser: false, allowedUsers: ['u1'] });
    expect(
      buildAccountPayload(values, { ...sub, accessScope: 'CertainRoles', certainRoles: ['r1'] })
    ).toMatchObject({ headAccountId: 'h1', isAllUser: false, allowedRoles: ['r1'] });
  });

  it('a Header account ignores the access choice and stays visible to all', () => {
    const payload = buildAccountPayload(values, {
      ...single,
      accountType: 'HeaderAccount',
      accessScope: 'SpecialUsers',
      specialUsers: ['u1'],
    });
    expect(payload.isAllUser).toBe(true);
    expect(payload.allowedUsers).toBeUndefined();
  });

  it('a Header account sends subAccountId only when one is linked', () => {
    const header = { ...single, accountType: 'HeaderAccount' };
    expect(buildAccountPayload(values, header).subAccountId).toBeUndefined();
    expect(buildAccountPayload(values, { ...header, childId: 's1' })).toMatchObject({
      subAccountId: 's1',
      isAllUser: true,
    });
  });
});
