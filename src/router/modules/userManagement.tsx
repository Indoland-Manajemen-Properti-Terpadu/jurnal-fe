import type { RouteObject } from 'react-router-dom';
import {
  AddRolePage,
  AddUserPage,
  EditUserPage,
  UserManagementPage,
} from '@/module/user-management';
import { routes } from '../routes';

export const userManagementRoutes: RouteObject[] = [
  { path: routes.userManagement.main, element: <UserManagementPage /> },
  { path: routes.userManagement.addUser, element: <AddUserPage /> },
  { path: routes.userManagement.editUser, element: <EditUserPage /> },
  { path: routes.userManagement.addRole, element: <AddRolePage /> },
];
