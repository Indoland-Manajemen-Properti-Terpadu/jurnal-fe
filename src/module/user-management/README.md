# user-management

Users and access roles under the settings layout: a user list, a role list (built-in and custom), a change history, a user form (add and edit) and a role form (add, view and edit). Formerly `SettingMenu/UserManagement`. Everything saves to the API; there is no dummy UI left.

Contract source: the Postman collection **Jurnal Proapps** (folders Menu, Access Roles, Users). The site comes from the signed-in user's token; no header or parameter selects it.

## Routes (`src/router/routes.ts`)

| Constant                    | Path                                          | Page                                       |
| --------------------------- | --------------------------------------------- | ------------------------------------------ |
| `userManagement.main`       | `/settings/user-management`                   | `UserManagementPage` (3 tabs)              |
| `userManagement.addUser`    | `/settings/user-management/add-user-form`     | `UserFormPage mode="add"`                  |
| `userManagement.editUser`   | `/settings/user-management/edit-user/:userId` | `UserFormPage mode="edit"` (id, not email) |
| `userManagement.addRole`    | `/settings/user-management/add-role-form`     | `RoleFormPage mode="add"`                  |
| `userManagement.roleDetail` | `/settings/user-management/roles/:id`         | `RoleFormPage mode="view"`                 |
| `userManagement.editRole`   | `/settings/user-management/roles/:id/edit`    | `RoleFormPage mode="edit"`                 |

`index.ts` exports the three pages plus `useUsers` and `useRoles`; the chart-of-accounts add and edit pages read `results[].{id,name,email}` and `[{id,name}]` from them, so keep those shapes.

## Endpoints (`src/lib/http/endpoints.ts`)

| Use               | Call                                                                                             | Needs                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ |
| Menu catalog      | `GET /v1/menus`                                                                                  | Role Management read                                               |
| Roles             | `GET /v1/access-role?isDefault=`, `GET/PATCH/DELETE /v1/access-role/:id`, `POST /v1/access-role` | User or Role Management read; Role Management create/update/delete |
| Users             | `GET /v1/users?page&limit&sortBy`, `POST /v1/users`, `PATCH /v1/users/:id`                       | User Management read/create/update                                 |
| Own rights and id | `GET /v1/users/me/permissions` (no envelope), `GET /v1/users/me`                                 | signed in                                                          |
| History           | `GET /v1/rbac-audit-logs?page&limit&action&targetType`                                           | User or Role Management read                                       |

The default client rejects on an HTTP error. `infrastructure/apiError.ts` turns a failure into a kind (`forbidden`, `notFound`, `conflict`, `invalid`, `duplicateEmail`, `network`, `unknown`) and the notifier shows a plain sentence for it.

## Layers

- `domain/`: `rolePermissions` (permission matrix, payload, letters), `grantRules` (what the signed-in person may hand out), `userRules` (password policy, who cannot be switched off), `auditLog` (snapshot comparison). All pure and tested.
- `infrastructure/`: API adapters, `dto.ts`, `mappers.ts` (accepts `enabled` as a string or a list, a user's role as an id or an object, a missing `isActive` as active), `apiError.ts`.
- `presentation/`: hooks (queries, mutations, notifier, `userManagementKeys`), tabs, `PermissionMatrix`, `RoleSummaryCard`, `RolePicker`, `PasswordField`, `UnsavedChangesGuard`, three pages.

## Domain rules

- Every menu holds its own rights. A submenu (for example User Management under Settings) is grouped under its parent in the screen but is **not** tied to it: ticking a child never ticks the parent. The old parent-follows-child behaviour came from the previous menu catalog and would over-grant now.
- A menu supports a right only when its `enabled` letters (c, r, u, d) contain it; the payload never carries an unsupported right, and menus with no right are not sent (a menu that is not sent grants nothing).
- A role's description is optional but the API refuses an empty string, so an empty description is left out of the payload (on an update, leaving it out clears it).
- A person can only give rights they hold. The matrix disables a cell above their rights, except a right the role already had (an edit only checks newly added rights). A role holding a right above the person's own stays choosable for a user who already has it.
- The Super Admin role can only be given by a Super Admin.
- Default roles cannot be changed or deleted. A role still held by a user cannot be deleted (409, shown as a plain sentence).
- There is no delete-user call: **deactivate** is the only way. A person cannot deactivate themselves, and the last active Super Admin cannot be deactivated or lose the role (the screen blocks it; the API stays the judge).
- Passwords: at least 8 characters with a letter and a number. The administrator sets the first password (no invitation e-mail exists); resetting it signs the user out of every device.
- A user's effective rights on the user form are the union of the picked roles. The contract does not say this explicitly, so the screen labels it an estimate.

## State

Server data lives in TanStack Query under the `['user-management', ...]` keys. Create and update invalidate the lists and the history. Mutations are not optimistic. Form input is local state; leaving a form with unsaved changes asks first.

## i18n

Namespace `userManagement` (`id` and `en`), with parity tests in `src/i18n/locales/userManagement.test.ts`, a hard-coded-text guard and a missing-key guard in `presentation/`. The screens use the term "Peran" for role, matching the `settings` namespace.

## Known gaps

- The API has no single-user read: the edit page takes the row from the list click (router state) and otherwise looks it up in the first 100 users, so a user beyond that cannot be opened by a direct link.
- The API filters users only by exact name, so the list has no search box.
- On a phone the permission matrix scrolls sideways instead of turning into cards.
- The Postman examples for create/edit user and roles are in an older shape. Checked against the live API on 2026-11-01: responses carry no envelope, `enabled` is a list of letters, a created or edited user comes back with populated role objects while the list has role ids, and `accessRole` of the signed-in user can be empty for a legacy superadmin. The mappers accept all of these.
- The shape of `ROLE_DELETE` and `USER_PASSWORD_CHANGE` history entries is undocumented; the history shows them without a before/after when none is sent.
- Hiding menus and buttons across the rest of the app from `me/permissions`, and changing your own password, are out of scope here.
