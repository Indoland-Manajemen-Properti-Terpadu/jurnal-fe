import type { Icon } from '@tabler/icons-react';
import {
  IconBuilding,
  IconFileText,
  IconReceipt,
  IconReportMoney,
  IconShieldCheck,
  IconShoppingCart,
} from '@tabler/icons-react';

export type PermissionAccess = 'full' | 'fullExport' | 'adminOnly';

export interface PermissionModule {
  /** Key under `roles.modules` in the `profile` i18n namespace. */
  key: string;
  icon: Icon;
  access: PermissionAccess;
  color: string;
}

export const PERMISSION_MODULES: PermissionModule[] = [
  { key: 'ledger', icon: IconFileText, access: 'full', color: 'blue' },
  { key: 'cashBank', icon: IconReportMoney, access: 'full', color: 'teal' },
  { key: 'sales', icon: IconReceipt, access: 'full', color: 'indigo' },
  { key: 'purchases', icon: IconShoppingCart, access: 'full', color: 'cyan' },
  { key: 'reports', icon: IconShieldCheck, access: 'fullExport', color: 'emerald' },
  { key: 'masterData', icon: IconBuilding, access: 'adminOnly', color: 'grape' },
];
