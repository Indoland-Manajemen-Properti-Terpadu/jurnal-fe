import {
  IconBuildingStore,
  IconCalendar,
  IconClock,
  IconCreditCard,
  IconHash,
  IconHistory,
  IconLayoutGrid,
  IconLock,
  IconPercentage,
  IconSettings,
  IconSitemap,
  IconTag,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react';
import type { Icon } from '@tabler/icons-react';
import { routes } from '@/router/routes';

export type SettingsItem = { key: string; path?: string; icon: Icon };
export type SettingsGroup = { key: string; items: SettingsItem[] };

export const settingsGroups: SettingsGroup[] = [
  { key: 'overview', items: [{ key: 'hub', path: routes.settings.main, icon: IconLayoutGrid }] },
  {
    key: 'organization',
    items: [
      { key: 'company', path: routes.settings.company, icon: IconBuildingStore },
      { key: 'regional', icon: IconWorld },
    ],
  },
  {
    key: 'accounting',
    items: [
      { key: 'general', path: routes.settings.general, icon: IconSettings },
      { key: 'fiscalYear', icon: IconCalendar },
      { key: 'lockDate', icon: IconLock },
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
    items: [
      { key: 'users', path: routes.userManagement.main, icon: IconUsers },
      { key: 'auditLog', icon: IconHistory },
    ],
  },
];
