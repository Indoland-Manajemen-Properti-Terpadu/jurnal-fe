import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '@/pages/LandingPage/LandingPage';
import LoginPage from '@/pages/Auth/Login/page';
import MainDashboard from '@/pages/Dashboard/MainDashboard/page';
import UserManagement from '@/pages/SettingMenu/UserManagement/UserManagement';
import { NotFound } from '@/components/ErrorPage/NotFound';
import AddUserForm from '@/pages/SettingMenu/UserManagement/AddUserForm/AddUserForm';

export const routes = {
  notFound: '*',
  landingPage: '/',
  login: '/login',
  dashboard: '/dashboard',
  resultReport: '/result-report',
  userManagement: '/settings/user-management',
  addUserForm: '/settings/user-management/add-user-form',
};

const router = createBrowserRouter([
  {
    path: routes.notFound,
    element: <NotFound />,
  },
  {
    path: routes.landingPage,
    element: <LandingPage />,
  },
  {
    path: routes.login,
    element: <LoginPage />,
  },
  {
    path: routes.dashboard,
    element: <MainDashboard />,
  },
  {
    path: routes.resultReport,
    element: <LandingPage />,
  },

  // * Setting Menu Routes
  {
    path: routes.userManagement,
    element: <UserManagement />,
  },
  {
    path: routes.addUserForm,
    element: <AddUserForm />,
  },
]);

export function Router() {
  return <RouterProvider router={router} />;
}
