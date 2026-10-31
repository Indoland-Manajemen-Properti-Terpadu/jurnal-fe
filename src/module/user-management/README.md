# user-management

Users and access roles: a user list and role tabs (default and additional) under the settings layout, plus add user, edit user and add role screens. Formerly `SettingMenu/UserManagement`. **Most of it is still a dummy UI**: only the lists read the real API; the forms do not save.

## Routes (`src/router/routes.ts`)

| Constant | Path | Page |
| --- | --- | --- |
| `userManagement.main` / `list` | `/settings/user-management` | `UserManagementPage` (users tab, roles tab) |
| `userManagement.addUser` | `/settings/user-management/add-user-form` | `AddUserPage` |
| `userManagement.editUser` | `/settings/user-management/edit-user/:email` | `EditUserPage` |
| `userManagement.addRole` | `/settings/user-management/add-role-form` | `AddRolePage` |

`index.ts` exports the four pages plus `useUsers` and `useRoles`, which the chart-of-accounts add and edit pages use to pick users and roles.

## Endpoints

`GET API_USERS.GET_ALL_USER` and `GET_USER_DETAIL` (`infrastructure/userApi.ts`), `GET API_ACCESS_ROLE.GET_ROLE` and `POST API_ACCOUNT.POST_ADD_ROLE` (`roleApi.ts`), `GET /v1/menus` (`menuApi.ts`). The first three groups use the legacy `get`/`post` helpers, which return the error response instead of throwing.

## Layers

- `domain/`: `userTypes`, `rolePayload`, and `rolePermissions` (create the permission matrix, tick a child or a parent, build the role payload), tested.
- `infrastructure/`: `userApi`, `roleApi`, `menuApi`.
- `presentation/`: pages, components (`user-table`, `roles`) and hooks (`useUsers`, `useUserByEmail`, `useRoles`, `useDefaultRoles`, `useAddRole`, `useRoleMenus`).

## Domain rules

- A permission is available on a menu only when the menu's `enabled` letters (r, c, u, d) contain its first letter.
- Ticking a submenu permission ticks the parent for it; unticking the last ticked child unticks the parent. Ticking a parent sets only the children that support that permission.

## i18n

Namespace `userManagement` (`id` and `en`), with parity tests in `src/i18n/locales/userManagement.test.ts` and a hard-coded-text guard. The text is the old English copy in both languages; real Indonesian copy waits for the real implementation.

## Known gaps (kept as is, the module is a dummy)

- Add Role builds the payload but does not call the API; `useAddRole` exists for when it does (and uses the legacy `post`, which hides failures).
- Add User has no submit; Edit User's Finish only navigates; deleting a user from the table does nothing after the confirmation.
- The row menu opens the edit URL with a literal `:email`.
- The user table search state is never changed (no search box is rendered).
- Chart-of-accounts reads users and roles through the legacy helpers too.
