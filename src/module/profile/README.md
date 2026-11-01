# profile

Account page of the signed-in user: personal data, password change, a read-only access matrix and the active site. It is a protected page rendered inside `AppShellLayout`.

- **Route:** `routes.profile` (`/profile`, see `src/router/routes.ts`); the page is exported from `index.ts` as `ProfilePage`.
- **Endpoints:** `GET /v1/users/get-id` (current user) and `PATCH /v1/users/{id}` with `{ name, email }` or `{ password }`. Both go through the default `apiClient` in `infrastructure/profileApi.ts`; `profileMapper.ts` maps the DTO to the `Profile` entity and builds the request body.
- **Domain rules (`domain/profile.ts`):** name and email must not be blank (they are trimmed before sending); a new password needs at least 8 characters and an identical confirmation; the password checklist (length, letter, number, match) is advisory and only length plus match enable the submit button; the "Master Data" permission reads `Administrator` for `admin` and `superadmin`, otherwise `Terbatas`; dates use the `id-ID` long format and `-` when missing.
- **State:** the profile is server data in TanStack Query under the key `['profile']`, via `useGetProfile` and `useUpdateProfile` in `presentation/hooks/useProfileQueries.ts` (a successful update invalidates the key and shows a notification). Form inputs are local React state inside `PersonalInfoTab` and `SecurityTab`. Nothing is mirrored in Zustand.
- **i18n namespace:** `profile` (`id` primary, `en`); `src/i18n/locales/profile.test.ts` checks that both languages have the same keys, placeholders and no empty values.
- **Components (`presentation/components`):** `ProfileHero` with `ProfileMetricsBar`, `PersonalInfoTab`, `SecurityTab` with `PasswordChecklist`, `RolesTab` (data in `permissionModules.ts`), `SiteTab`, and the shared `CopyIdField`.

## Known gaps

- The access matrix is static text; it is not derived from the user's `accessRole` data.
- "Status koneksi site", "Lingkup pembukuan" and the session panel (JWT HS256, auto refresh) are fixed labels, not live data.
- Dates always format with `id-ID`, also when the language is `en`.
- `@/store` (`useAuthStore`) only holds tokens and `userName`; the page does not keep a second copy of the user, it reads the profile query.
- `import/no-cycle` still reports the module because `@/lib/http/apiClient` imports `@/router`.
