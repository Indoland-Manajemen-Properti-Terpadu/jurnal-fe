import { mapAccountDetailToFormState, unwrapAccountDetail } from './accountFormMapper';

describe('unwrapAccountDetail', () => {
  it('reads both the plain and the { data } shape', () => {
    expect(unwrapAccountDetail({ name: 'A' })).toEqual({ name: 'A' });
    expect(unwrapAccountDetail({ data: { name: 'A' } })).toEqual({ name: 'A' });
    expect(unwrapAccountDetail(undefined)).toBeUndefined();
  });
});

describe('mapAccountDetailToFormState', () => {
  it('maps a plain account', () => {
    expect(
      mapAccountDetailToFormState({
        name: 'Kas',
        accountNumber: '1-1',
        categoryId: 'c',
        isAllUser: true,
      })
    ).toEqual({
      values: {
        name: 'Kas',
        accountNumber: '1-1',
        category: 'c',
        taxType: '',
        isBankAndCash: false,
        isContra: false,
        desc: '',
      },
      accountType: 'SingleAccount',
      accessScope: 'AllUsers',
    });
  });

  it('detects Sub and Header accounts', () => {
    expect(mapAccountDetailToFormState({ headAccountId: 'h' })).toMatchObject({
      accountType: 'SubAccount',
      parentId: 'h',
    });
    expect(mapAccountDetailToFormState({ subAccountId: 's' })).toMatchObject({
      accountType: 'HeaderAccount',
      childId: 's',
    });
  });

  it('prefers category.id and reads member ids from strings or objects', () => {
    const state = mapAccountDetailToFormState({
      category: { id: 'x' },
      categoryId: 'y',
      allowedUsers: ['u1', { id: 'u2' }, { _id: 'u3' }],
    });
    expect(state.values.category).toBe('x');
    expect(state.accessScope).toBe('SpecialUsers');
    expect(state.specialUsers).toEqual(['u1', 'u2', 'u3']);
    expect(mapAccountDetailToFormState({ allowedRoles: ['r'] })).toMatchObject({
      accessScope: 'CertainRoles',
      certainRoles: ['r'],
    });
  });

  it('leaves the scope unset when nothing says otherwise', () => {
    expect(mapAccountDetailToFormState({}).accessScope).toBeUndefined();
  });
});

describe('mapAccountDetailToFormState with the real detail shape', () => {
  it('reads a Sub account and its parent from headerAccount', () => {
    expect(
      mapAccountDetailToFormState({
        level: 'sub',
        subAccount: [],
        headerAccount: { id: 'h1', name: 'Induk', accountNumber: '1-1000' },
      })
    ).toMatchObject({ accountType: 'SubAccount', parentId: 'h1' });
  });

  it('keeps a sub level account without a parent as Sub, with no parent chosen', () => {
    const state = mapAccountDetailToFormState({ level: 'sub', headerAccount: null });
    expect(state.accountType).toBe('SubAccount');
    expect(state.parentId).toBeUndefined();
  });

  it('reads a Header account from its children and preselects no child', () => {
    const state = mapAccountDetailToFormState({
      level: 'master',
      headerAccount: null,
      subAccount: [{ id: 's1' }, { id: 's2' }],
    });
    expect(state.accountType).toBe('HeaderAccount');
    expect(state.childId).toBeUndefined();
  });

  it('a top level account without children stays a Single account', () => {
    expect(
      mapAccountDetailToFormState({ level: 'master', headerAccount: null, subAccount: [] })
        .accountType
    ).toBe('SingleAccount');
  });
});
