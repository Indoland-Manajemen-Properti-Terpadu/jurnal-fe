# authentication

Sign-in: the login page (email and password, with a forgot-password view and a branded side panel) and the OAuth callback page. Formerly `Authentication`. Token storage and refresh live outside this module (`src/store/useAuthentications`, `src/lib/http/apiClient`).

## Routes (`src/router/routes.ts`)

| Constant               | Path        | Page                                                                               |
| ---------------------- | ----------- | ---------------------------------------------------------------------------------- |
| `routes.login`         | `/login`    | `LoginPage` (also the forgot-password view for paths containing `forgot-password`) |
| `routes.oauthCallback` | `/callback` | `OAuthCallbackPage` (exchanges the `?code=` for tokens)                            |

`index.ts` exports the two pages.

## Endpoints

`POST API_AUTH.POST_LOGIN` (email and password) and `POST API_AUTH.POST_OAUTH_EXCHANGE` (`{ code }`) in `infrastructure/authApi.ts`, through the default client (an HTTP error rejects). Both answer `{ user, tokens }`.

## Layers

- `domain/`: `loginTypes` (response shapes) and `credentialRules` (`validateEmail`, `validatePassword`, minimum 6 characters), tested.
- `infrastructure/`: `authApi`.
- `presentation/`: pages, components (`LoginForm`, `ForgotPasswordForm`, `AuthShowcase`) and hooks (`useLogin`, `useOAuthExchange`).

## Flow

A successful login or OAuth exchange stores the access and refresh tokens and the user name in the auth store, shows a welcome notification and goes to the dashboard. A failed login shows "Access Denied" and stays; a failed OAuth exchange shows a message and goes back to the login page. The OAuth exchange runs once per page load even if the effect re-runs.

## i18n

Namespace `authentication` (`id` and `en`) with parity tests in `src/i18n/locales/authentication.test.ts` and a hard-coded-text guard. The login success and error notifications keep their original English text in both languages.

## Known gaps (kept as is)

- Google and ProApps sign-in and password recovery are visual placeholders. The sign-in buttons have no action. The recovery screen can be opened from login, but its submit button is disabled until an endpoint exists. None of these paths sends a request or claims an email was sent.
- "Remember me" is collected but never used.
- The login showcase uses three conceptual 3D artworks for accounting, reports, and reconciliation. It contains no simulated balances or product screenshots. Navigation has named topic buttons and a pause/play control. Manual topic selection stops rotation; hover, keyboard focus, reduced motion, and small screens also suspend rotation. Artwork provenance is in `src/assets/images/auth/README.md`.
- No component tests for the pages; the credential rules and `useLogin` (success and denied) are covered.
