import {
  IconBuildingSkyscraper,
  IconBuildingStore,
  IconCalendarStats,
  IconClock,
  IconCreditCard,
  IconHash,
  IconHistory,
  IconPercentage,
  IconRoute,
  IconSettings,
  IconShieldLock,
  IconSitemap,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { routes } from '@/router/routes';
import { NAV_MENU } from '@/components/Navbar/navigationMenus';
import type { CanReadMenu } from '@/components/Navbar/navigationAccess';

export type SettingsItem = {
  key: string;
  path: string;
  /** Other addresses that belong to the item (its forms and detail pages). */
  also?: string[];
  icon: Icon;
  /** Server menu ids that unlock the page; the page shows when any of them can be read. */
  menus: readonly string[];
};
export type SettingsGroup = { key: string; items: SettingsItem[] };

/**
 * Single source of truth for the settings pages. The settings area shows them as a side menu next to
 * the page; the app sidebar has one "Settings" entry.
 */
export const settingsGroups: SettingsGroup[] = [
  {
    key: 'general',
    items: [
      {
        key: 'company',
        path: routes.settings.company,
        icon: IconBuildingStore,
        menus: NAV_MENU.settings,
      },
      {
        key: 'general',
        path: routes.settings.general,
        icon: IconSettings,
        menus: NAV_MENU.settings,
      },
      {
        key: 'sites',
        path: routes.settings.sites,
        icon: IconBuildingSkyscraper,
        menus: NAV_MENU.sites,
      },
    ],
  },
  {
    key: 'accounting',
    items: [
      {
        key: 'accountMapping',
        path: routes.settings.accountMapping,
        icon: IconSitemap,
        menus: NAV_MENU.settings,
      },
      { key: 'taxes', path: routes.settings.taxes, icon: IconPercentage, menus: NAV_MENU.settings },
      {
        key: 'accountingPeriods',
        path: routes.settings.accountingPeriods,
        icon: IconCalendarStats,
        menus: NAV_MENU.ledger,
      },
    ],
  },
  {
    key: 'transactions',
    items: [
      {
        key: 'paymentTerms',
        path: routes.settings.paymentTerms,
        icon: IconClock,
        menus: NAV_MENU.settings,
      },
      {
        key: 'paymentMethods',
        path: routes.settings.paymentMethods,
        icon: IconCreditCard,
        menus: NAV_MENU.settings,
      },
      {
        key: 'numberFormats',
        path: routes.settings.numberFormats,
        icon: IconHash,
        menus: NAV_MENU.settings,
      },
      { key: 'tags', path: routes.settings.tags, icon: IconTag, menus: NAV_MENU.settings },
    ],
  },
  {
    key: 'access',
    items: [
      {
        key: 'users',
        path: routes.userManagement.main,
        also: [routes.userManagement.addUser, '/settings/user-management/edit-user'],
        icon: IconUsers,
        menus: NAV_MENU.userAccess,
      },
      {
        key: 'roles',
        path: routes.userManagement.roles,
        also: [routes.userManagement.addRole],
        icon: IconShieldLock,
        menus: NAV_MENU.roleAccess,
      },
      {
        key: 'approvalFlow',
        path: routes.settings.approvalFlow,
        icon: IconRoute,
        menus: NAV_MENU.approvalFlow,
      },
      {
        key: 'accessHistory',
        path: routes.userManagement.history,
        icon: IconHistory,
        menus: NAV_MENU.users,
      },
    ],
  },
];

/** The page a bare `/settings` opens: the first item. */
export const defaultSettingsPath = settingsGroups[0].items[0].path;

const matches = (pathname: string, prefix: string) =>
  pathname === prefix || pathname.startsWith(`${prefix}/`);

/** Finds the settings page (and its category) that owns the given pathname; the longest address wins. */
export function findSettingsEntry(
  pathname: string
): { group: SettingsGroup; item: SettingsItem } | undefined {
  let best: { group: SettingsGroup; item: SettingsItem; length: number } | undefined;
  for (const group of settingsGroups) {
    for (const item of group.items) {
      const prefixes = [item.path, ...(item.also ?? [])];
      for (const prefix of prefixes) {
        if (matches(pathname, prefix) && (!best || prefix.length > best.length)) {
          best = { group, item, length: prefix.length };
        }
      }
    }
  }
  return best && { group: best.group, item: best.item };
}

/** Groups and items the person may open; with unknown rights (`null`) nothing is hidden. */
export function visibleSettingsGroups(canRead: CanReadMenu): SettingsGroup[] {
  return settingsGroups
    .map((group) => ({
      ...group,
      items: group.items.filter(
        (item) => !canRead || item.menus.length === 0 || item.menus.some(canRead)
      ),
    }))
    .filter((group) => group.items.length > 0);
}
