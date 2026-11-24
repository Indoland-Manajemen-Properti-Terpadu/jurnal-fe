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
| `settings.departments`     | `/settings/departments`            | `DepartmentPage` (menu `JP-SETT-DEPT`)              |
| `settings.company`         | `/settings/company-setting`        | `CompanySettingPage`                                |

`/settings/approval-setting` redirects to pending changes (the old approval stub page was removed). `index.ts` exports the pages (the eight settings pages and `PaymentTermFormPage`) and `SettingsLayout`, which `UserManagement` renders inside. The payment term form sits in the app shell without the settings side menu (full width, Standard B).

## Endpoints (`API_SETTINGS`, `infrastructure/settingApi.ts`)

`/v1/settings/general-settings` (read, update), `/v1/settings/account-mappings` (read, `/seed`, `/:id`, `/batch`), `/v1/settings/number-formats` (list, create, update, delete), `/v1/payment-methods`, `/v1/taxes`, `/v1/tags` (each list, create, update, delete). Payment terms have their own client, `infrastructure/paymentTermApi.ts` (`/v1/settings/payment-terms`: list with `q`, `appliesTo`, `isActive`, `page`; detail; create; `PUT`; `PATCH /:id/status` with `{ isActive }`; delete). The API is camelCase in query and body; snake_case is rejected with 400. Account choices come from `@/module/chart-of-accounts` (`getJournalAccounts`); the tax form uses `useSimpleAccounts({ type: 'tax_sales' })` and `{ type: 'tax_purchase' }` for its sales and purchase account dropdowns.

### Departments (`/v1/departments`)

The master that a purchase request picks its department from (revamp 1/9). Verified live on 2026-11-21 (Demo Site):

- List takes `page`, `limit` (1 to 200), `search`, `isActive`; it answers `{ results, page, limit, totalPages, totalResults }`. `search` matches the **name only**, not the code or description. A new site starts with Engineering, Housekeeping, Security, Management and Keuangan.
- Body: `name` (required, at most 100, trimmed by the server), `code` (at most 20), `description` (at most 500), `isActive` (boolean). An unknown field, an empty or blank name or a longer value is a 400 with an English field list (never shown). A name already used on the site, compared without case, is a 400 with the Indonesian `Nama departemen sudah dipakai`; Indonesian readers see it, English readers see a generic sentence. A missing id is 404, a malformed id is 400.
- Delete answers `200`; a department that a purchase request uses is refused (400, Indonesian message) and the dialog then offers to deactivate it (`isActive: false`). Rights on the menu `JP-SETT-DEPT` (create, update, delete) hide the add, edit, switch and delete controls; the page reads them with its own request because `user-management` cannot be imported here without an import cycle.
- Files: `domain/department`, `infrastructure/departmentApi` and `myRightsApi`, `hooks/useDepartments`, `components/departments/`, `pages/DepartmentPage`, locale `settingsDepartments` (merged into the `settings` namespace). Errors go through the shared `src/lib/http/apiError`, which purchasing now uses too.

## Layers

- `domain/`: `paymentTerm` (term types, form values, which fields apply, validation, payload), `settingTypes` (API shapes), `settingRules` (validators that return an i18n key, `previewNumber`, `buildTaxPayload`, `DEFAULT_TAX_RATE`), `accountOptions` (select options of accounts). All have tests.
- `infrastructure/`: `settingApi` (the HTTP calls), `paymentTermApi` and `paymentTermMapper` (payment terms).
- `presentation/`: pages, components (`SettingsLayout`, `DeleteConfirmModal`, `PaymentMethodFormModal`, `NumberFormatFormModal`), hooks (one file per resource, `settingKeys`, `useAccountOptions`; payment terms: `usePaymentTermQueries`, `usePaymentTermListParams`, `usePaymentTermForm`), `components/paymentTerms/` (filters, table, row, delete dialog, form sections). The categories (General, Accounting, Transactions & Documents, Users & Access) are defined in `src/components/Navbar/settingsMenu.ts`, the single source for the side menu and the breadcrumbs. An item with `status: 'soon'` is shown with a badge (without a `path` it cannot be opened); items are hidden when the person cannot read their server menu (`menus`).

## Domain rules

- Names (tax, term, method, tag) and the number format prefix are required; a tax rate and an admin fee must be at least 0; a number format starts at 1 or more.
- Accounting rule: a payment method with an admin fee above 0 needs an admin expense account, so the journal knows where to debit the fee.
- The tax form starts at 11 (`DEFAULT_TAX_RATE`); an unchosen account is sent as `undefined`.
- A payment term has an advance (none, partial 1-99 %, full 100 %), a billing split (single, several installments of at least 2, recurring with a unit and at least 2 periods), an optional due date (days of 0 or more, counted from the vendor invoice or the receipt) and, for installments only, a retention (percent and maintenance months). `visiblePaymentTermFields` decides which fields apply; the form shows only those, validates only those and sends only those. `PUT` replaces the whole term, so a field left out is reset by the API.
- The due line of a term is the server's own `summary.dueLabel`. It says "faktur vendor" in the Settings list even for a term used on sales invoices; the backend words it for sales only through `context=sale` on the options endpoints, and the Settings list is unchanged. The screen does not rewrite it (PRO-96, left to the backend, 2026-11-20).
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

`SitesPage`, `AccountingPeriodsPage` and `ApprovalFlowPage` (`presentation/pages/PlannedSettingsPages.tsx`) render the shared planned-module content inside `SettingsLayout`, so their menu items open a real page with the side menu.

## Company profile (PRO-118)

`CompanySettingPage` edits the identity printed in the header of the purchasing PDFs (PO/SPK, request, receipt/BAPP, purchase bill): logo, name, address, city, postal code, NPWP, phone, email and website. One profile per site; the service creates it on the first read, named after the site.

- **Endpoints** (`infrastructure/companyProfileApi.ts`): `GET /v1/settings/company-profile`, `PUT` the same path (every text field, trimmed, so a cleared field is really cleared), `POST /v1/settings/company-profile/logo` (multipart, one file in the field `logo`; a new logo replaces the old one) and `PUT { logo: null }` to remove it. Every call answers the whole profile, which replaces what the page holds. The logo path is relative to the API host, so the page puts `BASE_URL` in front (`resolveLogoUrl`).
- **Rights:** menu `JP-SETT-COMPANY` (`COMPANY_MENU`): read opens the page (the settings side menu uses `NAV_MENU.company`, so a role with settings but without this right does not see the entry), update shows Save and the logo buttons. Without update the fields are read-only and a note says who to ask. Super Admin and Admin inherit it; other roles get it in Settings > Roles.
- **Rules** (`domain/companyProfile.ts`, no field is required by the service): the company name stays filled on the form because it names the initials box and the tax-invoice sentence; email must look like an email (the service answers 400 otherwise); texts stop at the service limits (`maxLength`, so an over-long text cannot be typed); the logo is PNG, JPG or WEBP up to 1 MB (SVG is refused) and is checked before it is sent, with the reason shown under the logo.
- **Layout (Standard B):** three cards on the left (identity, address, logo), and on the right a sticky live preview of the document header plus the one primary action. The preview is the printed header: logo box of about 34 x 16 mm (or the initials box without a logo), the name, the line "alamat, kota kode pos" and the line "NPWP … - Telp …", each left out when blank. It follows every keystroke. Save and Discard sit under it and stay off until something changed; leaving with unsaved changes asks first (`UnsavedChangesGuard`).
- **Not printed yet:** email and website are saved but the PDFs do not print them yet (said on the fields). The financial reports still print the site name, not this profile. Both are backend matters.
- **Moved here:** the company address, NPWP and phone that once lived on the general settings page are no longer there (the service ignores them in `PUT /settings/general-settings`); their old values are carried into the profile when it is first opened.
