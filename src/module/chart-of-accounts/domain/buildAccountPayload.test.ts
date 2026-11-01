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

  it('sends the allowed users or roles for a restricted single account', () => {
    expect(
      buildAccountPayload(values, { ...single, accessScope: 'SpecialUsers', specialUsers: ['u1'] })
    ).toMatchObject({ isAllUser: false, allowedUsers: ['u1'] });
    expect(
      buildAccountPayload(values, { ...single, accessScope: 'CertainRoles', certainRoles: ['r1'] })
    ).toMatchObject({ isAllUser: false, allowedRoles: ['r1'] });
  });

  it('a Sub account sends headAccountId and stays visible to all', () => {
    const payload = buildAccountPayload(values, {
      ...single,
      accountType: 'SubAccount',
      parentId: 'h1',
      accessScope: 'SpecialUsers',
      specialUsers: ['u1'],
    });
    expect(payload).toMatchObject({ headAccountId: 'h1', isAllUser: true });
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
