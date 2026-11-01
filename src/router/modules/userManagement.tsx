import type { RouteObject } from 'react-router-dom';
import { RoleFormPage, UserFormPage, UserManagementPage } from '@/module/user-management';
import { routes } from '../routes';

export const userManagementRoutes: RouteObject[] = [
  { path: routes.userManagement.main, element: <UserManagementPage /> },
  { path: routes.userManagement.addUser, element: <UserFormPage mode="add" /> },
  { path: routes.userManagement.editUser, element: <UserFormPage mode="edit" /> },
  { path: routes.userManagement.addRole, element: <RoleFormPage mode="add" /> },
  { path: routes.userManagement.roleDetail, element: <RoleFormPage mode="view" /> },
  { path: routes.userManagement.editRole, element: <RoleFormPage mode="edit" /> },
];
