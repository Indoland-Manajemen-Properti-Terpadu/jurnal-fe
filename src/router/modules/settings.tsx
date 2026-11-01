import type { RouteObject } from 'react-router-dom';
import {
  AccountMappingPage,
  CompanySettingPage,
  GeneralSettingPage,
  NumberFormatPage,
  PaymentMethodPage,
  PaymentTermPage,
  SettingsHubPage,
  TagSettingPage,
  TaxSettingPage,
} from '@/module/settings';
import { routes } from '../routes';

export const settingsRoutes: RouteObject[] = [
  { path: routes.settings.main, element: <SettingsHubPage /> },
  { path: routes.settings.general, element: <GeneralSettingPage /> },
  { path: routes.settings.company, element: <CompanySettingPage /> },
  { path: routes.settings.accountMapping, element: <AccountMappingPage /> },
  { path: routes.settings.taxes, element: <TaxSettingPage /> },
  { path: routes.settings.paymentTerms, element: <PaymentTermPage /> },
  { path: routes.settings.paymentMethods, element: <PaymentMethodPage /> },
  { path: routes.settings.numberFormats, element: <NumberFormatPage /> },
  { path: routes.settings.tags, element: <TagSettingPage /> },
];
