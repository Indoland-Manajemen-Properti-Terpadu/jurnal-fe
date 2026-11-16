import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import {
  AccountMappingPage,
  ApprovalFlowPage,
  CompanySettingPage,
  GeneralSettingPage,
  NumberFormatPage,
  PaymentMethodPage,
  PaymentTermPage,
  SitesPage,
  TagSettingPage,
  TaxSettingPage,
} from '@/module/settings';
import { defaultSettingsPath } from '@/components/Navbar/settingsMenu';
import { routes } from '../routes';

export const settingsRoutes: RouteObject[] = [
  // No settings landing page: each category is a sub-menu in the sidebar.
  { path: routes.settings.main, element: <Navigate to={defaultSettingsPath} replace /> },
  { path: routes.settings.general, element: <GeneralSettingPage /> },
  { path: routes.settings.company, element: <CompanySettingPage /> },
  { path: routes.settings.sites, element: <SitesPage /> },
  { path: routes.settings.approvalFlow, element: <ApprovalFlowPage /> },
  { path: routes.settings.accountMapping, element: <AccountMappingPage /> },
  { path: routes.settings.taxes, element: <TaxSettingPage /> },
  { path: routes.settings.paymentTerms, element: <PaymentTermPage /> },
  { path: routes.settings.paymentMethods, element: <PaymentMethodPage /> },
  { path: routes.settings.numberFormats, element: <NumberFormatPage /> },
  { path: routes.settings.tags, element: <TagSettingPage /> },
];
