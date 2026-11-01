import type { RouteObject } from 'react-router-dom';
import { LoginPage, OAuthCallbackPage } from '@/module/authentication';
import { DashboardPage } from '@/module/dashboard';
import { LandingPage } from '@/module/landing';
import { ProfilePage } from '@/module/profile';
import { routes } from '../routes';

export const appRoutes: RouteObject[] = [
  { path: routes.landing, element: <LandingPage /> },
  { path: routes.login, element: <LoginPage initialMode="login" /> },
  { path: routes.forgotPassword, element: <LoginPage initialMode="forgot" /> },
  { path: routes.oauthCallback, element: <OAuthCallbackPage /> },
  { path: routes.dashboard, element: <DashboardPage /> },
  { path: routes.profile, element: <ProfilePage /> },
];
