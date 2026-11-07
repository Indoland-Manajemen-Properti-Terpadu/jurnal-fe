import type { RouteObject } from 'react-router-dom';
import {
  AccessHistoryPage,
  RoleFormPage,
  RolesPage,
  UserFormPage,
  UsersPage,
} from '@/module/user-management';
import { routes } from '../routes';

export const userManagementRoutes: RouteObject[] = [
  { path: routes.userManagement.main, element: <UsersPage /> },
  { path: routes.userManagement.roles, element: <RolesPage /> },
  { path: routes.userManagement.history, element: <AccessHistoryPage /> },
  { path: routes.userManagement.addUser, element: <UserFormPage mode="add" /> },
  { path: routes.userManagement.editUser, element: <UserFormPage mode="edit" /> },
  { path: routes.userManagement.addRole, element: <RoleFormPage mode="add" /> },
  { path: routes.userManagement.roleDetail, element: <RoleFormPage mode="view" /> },
  { path: routes.userManagement.editRole, element: <RoleFormPage mode="edit" /> },
];
