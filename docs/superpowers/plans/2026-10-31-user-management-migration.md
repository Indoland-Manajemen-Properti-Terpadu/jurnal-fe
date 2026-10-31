# User-Management Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (the user chose native, inline execution). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate `src/module/SettingMenu/UserManagement` to `src/module/user-management` with English names, i18n, README and tests, the second module of Milestone 4 (release R4).

**Architecture:** One branch `refactor/user-management`, one PR into `develop-frontend`, following the Module Migration Procedure of `2026-10-29-m1-small-modules.md`. Behavior is preserved, including the parts that are still prototypes (role creation and user creation do not call the API, user deletion only logs): they are documented as known gaps, not completed here.

**Tech Stack:** React 18, TypeScript strict, Vite 5, Mantine 8, TanStack Query 5, Vitest, ESLint ratchet, Yarn 4.

**Spec:** [`../specs/2026-10-29-codebase-restructure-design.md`](../specs/2026-10-29-codebase-restructure-design.md) sections 4, 5, 8.1, 8.3, 11.

## Global Constraints

Same as the earlier module plans: English identifiers and paths, kebab-case folders, PascalCase component files, `@/` imports only, no `any`, no `console.*`, files at most 400 lines, no `Layout.tsx` wrappers, no change to API payloads or endpoints, ratchet only goes down, commit 1 is a pure move, Conventional Commits ending with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Gate: `yarn typecheck`, `rtk proxy npm run lint`, `npm run prettier:changed`, `yarn vitest --run`, `yarn build`.

## Review Focus

- **Permission toggling (access control):** ticking a child permission ticks the parent for that permission; unticking every child unticks the parent; ticking a parent ticks only the children that support that permission; a permission a menu does not support stays disabled and unchecked.
- **Lists:** the user table filters by name and email text and shows the empty and error states; the role tabs show default and additional roles.
- **Consumers:** the chart-of-accounts add and edit pages keep their user and role lookups through `@/module/user-management`.
- **No false success:** nothing in the migration adds a success message to an action that does not call the API.
- **Language switch:** every label, placeholder and message in `id` and `en`.

## Rulings made while planning

- **R1:** Unreferenced files are deleted after a `git grep` re-check in Task 1: `Role/store/RoleStore.ts` (only commented references), `TableRolePermission.tsx` with `TableRP.module.css` and `DataAsync.ts` (an entirely commented file), `Role/components/DeleteModal.tsx`, the empty `EditUserForm/EditUser.tsx`, the unused `GetAdditionalRole` hook and the three `Layout.tsx` wrappers. Cost if wrong: restore from git.
- **R2:** Prototype behavior is kept: `handleAddRole` only builds the payload (the API call stays commented out in the source, so it is dropped as dead code and documented), the user delete confirmation does nothing, and `AddUserForm` has no submit. The legacy `get`/`post` helpers stay (spec 11.2). All of it goes into the README known gaps and the final audit.
- **R3:** Hooks are renamed to the convention: `useGetAllUser` to `useUsers`, `GetUserByEmail` to `useUserByEmail`, `GetRoles` to `useRoles`, `GetDefaultRole` to `useDefaultRoles`, `useAddRole` stays. The module index exports `useUsers` and `useRoles` for chart-of-accounts, and its tests update their mocks.
- **R4:** Permission toggling moves from `AddRoleForm` to `domain/rolePermissions.ts`, characterized by tests first.
- **R5:** The hard-coded role template id `66a789a72130a2814424b25c` is moved into `infrastructure/` as a named constant, unchanged (changing it is a backend decision).

## Target tree

```text
src/module/user-management/
  README.md
  index.ts                         pages + useUsers + useRoles
  domain/                          userTypes.ts, rolePermissions.ts (+ tests)
  infrastructure/                  userApi.ts, roleApi.ts, menuApi.ts
  presentation/
    pages/                         UserManagementPage, AddUserPage, EditUserPage, AddRolePage (+ css)
    components/                    user-table/, roles/ (DefaultRole, AdditionalRole, SelectorRoleAccess, ListRole)
    hooks/                         useUsers, useUserByEmail, useRoles, useDefaultRoles, useAddRole, useRoleMenus
```

---

### Task 1: Branch, dead code, pure move
### Task 2: Rename, index, router, chart-of-accounts consumers
### Task 3: Domain types and permission rules (tests first)
### Task 4: Infrastructure and hooks
### Task 5: i18n, cleanup, split oversized files
### Task 6: README, status, ratchet, gate, PR
