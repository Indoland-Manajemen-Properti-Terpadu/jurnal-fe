import { Navigate } from 'react-router-dom';
import type { RouteObject } from 'react-router-dom';
import { routes } from '../routes';

/** Old URLs that people may have bookmarked; each redirects to the current page. */
export const legacyRoutes: RouteObject[] = [
  { path: routes.legacyPaths.contacts, element: <Navigate to={routes.contacts.main} replace /> },
  { path: routes.legacyPaths.purchases, element: <Navigate to={routes.purchases.main} replace /> },
  { path: routes.legacyPaths.assets, element: <Navigate to={routes.assets.main} replace /> },
  {
    path: routes.legacyPaths.approvalSetting,
    element: <Navigate to={routes.pendingChanges.main} replace />,
  },
  {
    path: routes.legacyPaths.reportsBusinessSumary,
    element: <Navigate to={routes.reports.businessSummary} replace />,
  },
];
