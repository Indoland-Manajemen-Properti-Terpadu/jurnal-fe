import type { NavChild, NavItem, NavSection } from '@/components/Navbar/navigationRegistry';

/** Whether the signed-in person can read a server menu. `null` means their rights are not known. */
export type CanReadMenu = ((menuId: string) => boolean) | null;

const allowed = (menus: readonly string[] | undefined, canRead: CanReadMenu): boolean =>
  !canRead || !menus || menus.length === 0 || menus.some(canRead);

const visibleChildren = (children: NavChild[], canRead: CanReadMenu): NavChild[] =>
  children.filter((child) => allowed(child.menus, canRead));

const visibleItem = (item: NavItem, canRead: CanReadMenu): NavItem | null => {
  if (!allowed(item.menus, canRead)) return null;
  if (!item.children) return item;
  const children = visibleChildren(item.children, canRead);
  return children.length > 0 ? { ...item, children } : null;
};

/**
 * Hides what the person cannot use: items and sub-items whose menus they cannot read, and groups left
 * empty. With unknown rights (`null`) nothing is hidden, so a failed rights request never locks the
 * sidebar; the server still refuses what they may not do.
 */
export function filterNavigation(sections: NavSection[], canRead: CanReadMenu): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.flatMap((item) => visibleItem(item, canRead) ?? []),
    }))
    .filter((section) => section.items.length > 0);
}
