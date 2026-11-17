import { describe, expect, it } from 'vitest';
import { isNavigationChildActive, isNavigationLinkActive } from './activeNavigation';

describe('isNavigationLinkActive', () => {
  it('gives a nested path to the most specific navigation link', () => {
    const links = ['/bank-cash', '/bank-cash/petty-cash', '/sales'];

    expect(isNavigationLinkActive('/bank-cash/petty-cash', '/bank-cash', links)).toBe(false);
    expect(isNavigationLinkActive('/bank-cash/petty-cash', '/bank-cash/petty-cash', links)).toBe(
      true
    );
  });

  it('keeps the parent active when it is the only navigation owner', () => {
    const links = ['/bank-cash', '/sales'];

    expect(isNavigationLinkActive('/bank-cash/petty-cash/fund-hq', '/bank-cash', links)).toBe(true);
  });

  it('does not match paths that only share the same characters', () => {
    expect(isNavigationLinkActive('/bank-cashier', '/bank-cash', ['/bank-cash'])).toBe(false);
  });
});

describe('isNavigationChildActive', () => {
  it('selects the most specific child for petty cash detail routes', () => {
    const children = ['/bank-cash', '/bank-cash/petty-cash'];

    expect(isNavigationChildActive('/bank-cash/petty-cash/fund-hq', children[0], children)).toBe(
      false
    );
    expect(isNavigationChildActive('/bank-cash/petty-cash/fund-hq', children[1], children)).toBe(
      true
    );
  });
});
