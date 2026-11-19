# settings

Company and accounting settings, reached from one "Settings" entry in the app sidebar and a side menu next to every settings page (`SettingsLayout`, `SettingsNav`; no settings hub page): decimal precision, default account mapping, taxes, payment terms, payment methods, document number formats, transaction tags and the company profile page. Formerly `SettingMenu` (user management is a separate module, `SettingMenu/UserManagement` until it migrates).

## Routes (`src/router/routes.ts`)

| Constant                   | Path                               | Page                                                |
| -------------------------- | ---------------------------------- | --------------------------------------------------- |
| `settings.main`            | `/settings`                        | redirects to the first settings page                |
| `settings.general`         | `/settings/general`                | `GeneralSettingPage` (decimal precision, read only) |
| `settings.accountMapping`  | `/settings/account-mapping`        | `AccountMappingPage`                                |
| `settings.taxes`           | `/settings/taxes`                  | `TaxSettingPage`                                    |
| `settings.paymentTerms`    | `/settings/payment-terms`          | `PaymentTermPage` (list, filters, status, delete)   |
| `settings.paymentTermNew`  | `/settings/payment-terms/new`      | `PaymentTermFormPage` (add)                         |
| `settings.paymentTermEdit` | `/settings/payment-terms/:id/edit` | `PaymentTermFormPage` (edit)                        |
| `settings.paymentMethods`  | `/settings/payment-methods`        | `PaymentMethodPage`                                 |
| `settings.numberFormats`   | `/settings/number-formats`         | `NumberFormatPage`                                  |
| `settings.tags`            | `/settings/tags`                   | `TagSettingPage`                                    |
| `settings.company`         | `/settings/company-setting`        | `CompanySettingPage`                                |

`/settings/approval-setting` redirects to pending changes (the old approval stub page was removed). `index.ts` exports the pages (the eight settings pages and `PaymentTermFormPage`) and `SettingsLayout`, which `UserManagement` renders inside. The payment term form sits in the app shell without the settings side menu (full width, Standard B).

## Endpoints (`API_SETTINGS`, `infrastructure/settingApi.ts`)

`/v1/settings/general-settings` (read, update), `/v1/settings/account-mappings` (read, `/seed`, `/:id`, `/batch`), `/v1/settings/number-formats` (list, create, update, delete), `/v1/payment-methods`, `/v1/taxes`, `/v1/tags` (each list, create, update, delete). Payment terms have their own client, `infrastructure/paymentTermApi.ts` (`/v1/settings/payment-terms`: list with `q`, `appliesTo`, `isActive`, `page`; detail; create; `PUT`; `PATCH /:id/status` with `{ isActive }`; delete). The API is camelCase in query and body; snake_case is rejected with 400. Account choices come from `@/module/chart-of-accounts` (`getJournalAccounts`); the tax form uses `useSimpleAccounts({ type: 'tax_sales' })` and `{ type: 'tax_purchase' }` for its sales and purchase account dropdowns.

## Layers

- `domain/`: `paymentTerm` (term types, form values, which fields apply, validation, payload), `settingTypes` (API shapes), `settingRules` (validators that return an i18n key, `previewNumber`, `buildTaxPayload`, `DEFAULT_TAX_RATE`), `accountOptions` (select options of accounts). All have tests.
- `infrastructure/`: `settingApi` (the HTTP calls), `paymentTermApi` and `paymentTermMapper` (payment terms).
- `presentation/`: pages, components (`SettingsLayout`, `DeleteConfirmModal`, `PaymentMethodFormModal`, `NumberFormatFormModal`), hooks (one file per resource, `settingKeys`, `useAccountOptions`; payment terms: `usePaymentTermQueries`, `usePaymentTermListParams`, `usePaymentTermForm`), `components/paymentTerms/` (filters, table, row, delete dialog, form sections). The categories (General, Accounting, Transactions & Documents, Users & Access) are defined in `src/components/Navbar/settingsMenu.ts`, the single source for the side menu and the breadcrumbs. An item with `status: 'soon'` is shown with a badge (without a `path` it cannot be opened); items are hidden when the person cannot read their server menu (`menus`).

## Domain rules

- Names (tax, term, method, tag) and the number format prefix are required; a tax rate and an admin fee must be at least 0; a number format starts at 1 or more.
- Accounting rule: a payment method with an admin fee above 0 needs an admin expense account, so the journal knows where to debit the fee.
- The tax form starts at 11 (`DEFAULT_TAX_RATE`); an unchosen account is sent as `undefined`.
- A payment term has an advance (none, partial 1-99 %, full 100 %), a billing split (single, several installments of at least 2, recurring with a unit and at least 2 periods), an optional due date (days of 0 or more, counted from the vendor invoice or the receipt) and, for installments only, a retention (percent and maintenance months). `visiblePaymentTermFields` decides which fields apply; the form shows only those, validates only those and sends only those. `PUT` replaces the whole term, so a field left out is reset by the API.
- Terms are shared by purchases and sales. "In use" (`usageCount`, `canDelete`) counts purchase orders, purchase bills and sales invoices that are not deleted (the backend confirmed this on PRO-92, 2026-11-19). Deleting a used term answers 409 with `{ code: 409, message: "Termin sudah dipakai, nonaktifkan saja" }` and deletes nothing; the backend confirmed it and the dialog follows it (not run against the live Net 30 term on purpose). `pagination.total` no longer counts deleted terms (fixed and checked live). A term in use (`canDelete: false`) cannot be deleted from the UI, only deactivated; if the API still answers 409 on delete, the dialog shows its message and offers to deactivate. Editing a term in use is allowed and only affects later documents.
- The number preview is the prefix, the number padded to six digits and the suffix, joined with slashes (`PRO/INV/000001`).

## State

TanStack Query. `settingKeys` gives `['settings', <resource>]` keys; every create, update or delete invalidates its list and shows a success or error notification. Form state is local. The payment term list keeps its search, filters and page in the address (`q`, `appliesTo`, `status`, `page`) and asks the API after a short pause in typing; the add and edit page asks before leaving with unsaved changes.

## i18n

Namespace `settings` is the existing hub and layout keys plus `settingsPages` (forms, tables, notifications, validation messages), both `id` and `en`, with parity tests in `src/i18n/locales/settingsPages.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`.

## Known gaps

- A tax rate has no upper bound (`1100` is accepted), and due days and the admin fee accept decimals; kept as before.
- The account loading in the forms swallows errors and leaves the selectors empty instead of showing a message.
- The payment method account selector falls back to the hard-coded Indonesian category label `Kas & Bank` for bank and cash accounts without a type.
- Component tests cover the payment term pages only; the other settings pages are covered through their hooks, rules and option builder.
- The Purchases and Sales term dropdowns still use `/v1/payment-terms` and list inactive terms and terms of any `appliesTo`; the settings screen does not filter them.
- The retention percent has no upper bound on the frontend; the API decides.

## Planned pages

`SitesPage`, `AccountingPeriodsPage` and `ApprovalFlowPage` (`presentation/pages/PlannedSettingsPages.tsx`) render the shared planned-module content inside `SettingsLayout`, so their menu items open a real page with the side menu. The company profile page is a notice that the company data is not connected yet.
