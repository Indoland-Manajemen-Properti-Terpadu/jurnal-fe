import {
  IconBuildingStore,
  IconClock,
  IconCreditCard,
  IconHash,
  IconPercentage,
  IconSettings,
  IconSitemap,
  IconTag,
  IconUsers,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { routes } from '@/router/routes';

export type SettingsItem = { key: string; path: string; icon: Icon };
export type SettingsGroup = { key: string; items: SettingsItem[] };

/**
 * Single source of truth for the settings sub-menus. The app sidebar renders one
 * expandable menu per group; a group with a single item renders as a direct link.
 */
export const settingsGroups: SettingsGroup[] = [
  {
    key: 'general',
    items: [
      { key: 'company', path: routes.settings.company, icon: IconBuildingStore },
      { key: 'general', path: routes.settings.general, icon: IconSettings },
    ],
  },
  {
    key: 'accounting',
    items: [
      { key: 'accountMapping', path: routes.settings.accountMapping, icon: IconSitemap },
      { key: 'taxes', path: routes.settings.taxes, icon: IconPercentage },
    ],
  },
  {
    key: 'transactions',
    items: [
      { key: 'paymentTerms', path: routes.settings.paymentTerms, icon: IconClock },
      { key: 'paymentMethods', path: routes.settings.paymentMethods, icon: IconCreditCard },
      { key: 'numberFormats', path: routes.settings.numberFormats, icon: IconHash },
      { key: 'tags', path: routes.settings.tags, icon: IconTag },
    ],
  },
  {
    key: 'access',
    items: [{ key: 'users', path: routes.userManagement.main, icon: IconUsers }],
  },
];

export const defaultSettingsPath = settingsGroups[0].items[0].path;

/** Finds the settings page (and its category) that owns the given pathname. */
export function findSettingsEntry(
  pathname: string
): { group: SettingsGroup; item: SettingsItem } | undefined {
  for (const group of settingsGroups) {
    const item = group.items.find(
      (candidate) => pathname === candidate.path || pathname.startsWith(`${candidate.path}/`)
    );
    if (item) return { group, item };
  }
  return undefined;
}
