import brandIcon from '@/assets/images/brand/icon.svg';

/**
 * The apps of the ProApps family, for the app switcher in the header. Adding a product is one more
 * entry here plus its texts in the `navigation` namespace (`app<Id>Name`, `app<Id>Desc`).
 */
export type AppIcon = 'accounting' | 'property';

export interface AppEntry {
  id: string;
  /** The app's logo. ProApps and Jurnal ProApps share the brand icon for now. */
  logo: string;
  icon: AppIcon;
  /** Mantine color the app's card is tinted with. */
  color: 'primary' | 'teal' | 'orange' | 'violet';
  /** The app the user is in now. */
  current?: boolean;
  /** Where the app lives; the current app has none. */
  href?: string;
}

export const APP_CATALOG: AppEntry[] = [
  { id: 'jurnal', logo: brandIcon, icon: 'accounting', color: 'primary', current: true },
  { id: 'proapps', logo: brandIcon, icon: 'property', color: 'teal', href: 'https://proapps.id' },
];
