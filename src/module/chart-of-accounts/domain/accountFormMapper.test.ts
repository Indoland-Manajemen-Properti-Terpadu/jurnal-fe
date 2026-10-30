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
