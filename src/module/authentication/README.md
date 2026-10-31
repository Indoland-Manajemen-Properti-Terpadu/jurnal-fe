# authentication

Sign-in: the login page (email and password, with a forgot-password view and a branded side panel) and the OAuth callback page. Formerly `Authentication`. Token storage and refresh live outside this module (`src/store/useAuthentications`, `src/lib/http/apiClient`).

## Routes (`src/router/routes.ts`)

| Constant | Path | Page |
| --- | --- | --- |
| `routes.login` | `/login` | `LoginPage` (also the forgot-password view for paths containing `forgot-password`) |
| `routes.oauthCallback` | `/callback` | `OAuthCallbackPage` (exchanges the `?code=` for tokens) |

`index.ts` exports the two pages.

## Endpoints

`POST API_AUTH.POST_LOGIN` (email and password) and `POST API_AUTH.POST_OAUTH_EXCHANGE` (`{ code }`) in `infrastructure/authApi.ts`, through the default client (an HTTP error rejects). Both answer `{ user, tokens }`.

## Layers

- `domain/`: `loginTypes` (response shapes) and `credentialRules` (`validateEmail`, `validatePassword`, minimum 6 characters), tested.
- `infrastructure/`: `authApi`.
- `presentation/`: pages, components (`LoginForm`, `ForgotPasswordForm`, `AuthVisualSide`) and hooks (`useLogin`, `useOAuthExchange`).

## Flow

A successful login or OAuth exchange stores the access and refresh tokens and the user name in the auth store, shows a welcome notification and goes to the dashboard. A failed login shows "Access Denied" and stays; a failed OAuth exchange shows a message and goes back to the login page. The OAuth exchange runs once per page load even if the effect re-runs.

## i18n

Namespace `authentication` (`id` and `en`) with parity tests in `src/i18n/locales/authentication.test.ts` and a hard-coded-text guard. The login success and error notifications keep their original English text in both languages.

## Known gaps (kept as is)

- **Forgot password is switched off** (`FORGOT_PASSWORD_ENABLED = false` in `domain/authFeatures.ts`): there is no backend endpoint yet, and the form only pretended to send an email. The login link is hidden and `/forgot-password` shows the login view. When the endpoint exists, call it from `ForgotPasswordForm` (show the real error on failure) and flip the flag.
- "Remember me" is collected but never used.
- The login page claims "SSL 256-bit encrypted connection", "audit trail and data encryption" and "100% balanced" as static marketing text, not measured values.
- No component tests for the pages; the credential rules and `useLogin` (success and denied) are covered.
