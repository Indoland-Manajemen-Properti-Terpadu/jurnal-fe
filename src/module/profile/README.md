# profile

Account page of the signed-in user: an identity card, personal details, a password change and a read-only view of the user's roles and menu rights. It is a protected page rendered inside `AppShellLayout`.

- **Route:** `routes.profile` (`/profile`, see `src/router/routes.ts`); the page is exported from `index.ts` as `ProfilePage`.
- **Layout:** `IdentityCard` (cover, initials avatar, status and verification badges, roles, site, dates) beside a pill-tab panel with `AccountTab`, `SecurityTab` and `AccessTab`. Sections use the local `SectionCard`.

## Endpoints (`infrastructure/profileApi.ts`)

| Use                   | Call                                                            | Needs                     |
| --------------------- | --------------------------------------------------------------- | ------------------------- |
| The signed-in user    | `GET /v1/users/me`                                              | signed in                 |
| Rights per menu       | `GET /v1/users/me/permissions` (no envelope)                    | signed in                 |
| Change password       | `POST /v1/users/me/password` `{ currentPassword, newPassword }` | signed in; answers 204    |
| Change name and email | `PATCH /v1/users/:id` `{ name, email }`                         | the right to update users |

The page used to read `GET /v1/users/get-id` and save through `PATCH /v1/users/:id` for everything. Both now require User Management rights, so a regular user got 403 on load and on save. Checked against the live API on 2026-11-01 with a user that has no such right: `get-id` and `PATCH` answer 403, `me`, `me/permissions` and `me/password` work.

## Domain rules

- `domain/profile.ts`: name must not be blank and the email must look valid (both trimmed before sending); a new password needs 8+ characters with a letter and a number, must differ from the current one and match its confirmation, and the current password is required; initials come from the first two words of the name; dates follow the active language (`id-ID` or `en-US`).
- `domain/access.ts`: a menu with no right at all is folded under "menus without access"; a legacy `superadmin` is shown as having every right on every menu; name and email are editable only when the user is a superadmin or may update users (`JP-SETT-UM`), otherwise the fields are read-only with a short explanation.
- After a password change the API signs the user out of every device, so the page clears the tokens and goes to the sign-in page. A wrong current password and a repeated password are shown next to their own field (`infrastructure/passwordError.ts`).

## State

Server data is in TanStack Query: `['profile']` for the user and `['profile', 'access']` for the rights. A successful save invalidates the user. Form inputs are local state. Nothing is mirrored in Zustand (`useAuthStore` only holds tokens and the name for the header).

## i18n

Namespace `profile` (`id` primary, `en`); `src/i18n/locales/profile.test.ts` checks that both languages have the same keys, placeholders and no empty values.

## Known gaps

- A regular user cannot change their own name or email: the API has no self-service call for it. The fields are read-only with a note to contact an administrator. Adding one needs a backend change.
- The API sends no avatar, phone number, last sign-in or active-session list, so the page does not show them.
- `import/no-cycle` still reports the module because `@/lib/http/apiClient` imports `@/router`.
