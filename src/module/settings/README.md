# settings

Company and accounting settings: a hub with a configuration overview, decimal precision, default account mapping, taxes, payment terms, payment methods, document number formats, transaction tags and the company profile page. Formerly `SettingMenu` (user management is a separate module, `SettingMenu/UserManagement` until it migrates).

## Routes (`src/router/routes.ts`)

| Constant | Path | Page |
| --- | --- | --- |
| `settings.main` | `/settings` | `SettingsHubPage` |
| `settings.general` | `/settings/general` | `GeneralSettingPage` (decimal precision, read only) |
| `settings.accountMapping` | `/settings/account-mapping` | `AccountMappingPage` |
| `settings.taxes` | `/settings/taxes` | `TaxSettingPage` |
| `settings.paymentTerms` | `/settings/payment-terms` | `PaymentTermPage` |
| `settings.paymentMethods` | `/settings/payment-methods` | `PaymentMethodPage` |
| `settings.numberFormats` | `/settings/number-formats` | `NumberFormatPage` |
| `settings.tags` | `/settings/tags` | `TagSettingPage` |
| `settings.company` | `/settings/company-setting` | `CompanySettingPage` |

`/settings/approval-setting` redirects to pending changes (the old approval stub page was removed). `index.ts` exports the nine pages and `SettingsLayout`, which `UserManagement` renders inside.

## Endpoints (`API_SETTINGS`, `infrastructure/settingApi.ts`)

`/v1/settings/general-settings` (read, update), `/v1/settings/account-mappings` (read, `/seed`, `/:id`, `/batch`), `/v1/settings/number-formats` (list, create, update, delete), `/v1/payment-terms`, `/v1/payment-methods`, `/v1/taxes`, `/v1/tags` (each list, create, update, delete). Account choices come from `@/module/chart-of-accounts` (`getJournalAccounts`).

## Layers

- `domain/`: `settingTypes` (API shapes), `settingRules` (validators that return an i18n key, `previewNumber`, `buildTaxPayload`, `DEFAULT_TAX_RATE`), `accountOptions` (select options of accounts). All have tests.
- `infrastructure/`: `settingApi` (the HTTP calls).
- `presentation/`: pages, components (`SettingsLayout`, `DeleteConfirmModal`, `PaymentMethodFormModal`, `NumberFormatFormModal`), hooks (one file per resource, `settingKeys`, `useAccountOptions`, `useSettingsOverview`) and `settingsNavigation`.

## Domain rules

- Names (tax, term, method, tag) and the number format prefix are required; a tax rate, due days and an admin fee must be at least 0; a number format starts at 1 or more.
- Accounting rule: a payment method with an admin fee above 0 needs an admin expense account, so the journal knows where to debit the fee.
- The tax form starts at 11 (`DEFAULT_TAX_RATE`); an unchosen account is sent as `undefined`.
- The number preview is the prefix, the number padded to six digits and the suffix, joined with slashes (`PRO/INV/000001`).

## State

TanStack Query. `settingKeys` gives `['settings', <resource>]` keys; every create, update or delete invalidates its list and shows a success or error notification. Form state is local.

## i18n

Namespace `settings` is the existing hub and layout keys plus `settingsPages` (forms, tables, notifications, validation messages), both `id` and `en`, with parity tests in `src/i18n/locales/settingsPages.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`.

## Known gaps

- A tax rate has no upper bound (`1100` is accepted), and due days and the admin fee accept decimals; kept as before.
- The account loading in the forms swallows errors and leaves the selectors empty instead of showing a message.
- The payment method account selector falls back to the hard-coded Indonesian category label `Kas & Bank` for bank and cash accounts without a type.
- No component tests for the pages; the hooks, rules and option builder are covered.
