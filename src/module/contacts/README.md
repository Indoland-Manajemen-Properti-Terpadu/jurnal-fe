# contacts

Contact master data (customers, vendors, employees and other parties): list with stats, create, edit, archive, detail with a read-only profile, and a per-contact sales transaction view. It also manages contact groups and Excel import, export and template download.

## Routes (`src/router/routes.ts`)

| Constant | Path | Page |
| --- | --- | --- |
| `routes.contacts.main` | `/contact` | `ContactMainPage` (list, form modal, groups modal, import modal, archive confirm) |
| `routes.contacts.add` | `/contact/add` | `AddContactPage` |
| `routes.contacts.detail` | `/contact/:idAccount` | `DetailContactPage` (view and edit) |
| `routes.contacts.transactions` | `/contact/:idAccount/transaction-detail` | `TransactionDetailByContactPage` |

`/kontak` (`routes.legacyPaths.contacts`) redirects to `/contact`. `index.ts` exports the four pages plus `fetchContacts` and `fetchPaymentTerms` (used by sales).

## Endpoints (`CONTACT_ENDPOINTS` in `infrastructure/contactApi.ts`)

`/v1/contacts` (list, create), `/v1/contacts/:id` (read, update), `/v1/contacts/:id/archive`, `/v1/contacts/groups` and `/groups/:id`, `/v1/contacts/export`, `/v1/contacts/template/download`, `/v1/contacts/import`, `/v1/payment-terms`, `/v1/accounts/filtered?category=AP|AR`, `/v1/sales/customer/:id` and `/export`. Chart-of-accounts options come from `@/module/chart-of-accounts` (`getJournalAccounts`). `contactSync` is declared but unused.

## Layers

- `domain/`: pure types and rules, with tests. `contactFormat` (display helpers), `contactForm` (default form values and validation), `contactRegion` (province and city options, an unknown saved value stays selectable at the top), `contactAccount`/`contactAccountOptions` (account id extraction and option building), `contactTransactions` (sales filtering for the transaction view).
- `infrastructure/`: `contactApi` (HTTP), `contactDto` (wire types), `contactMapper` (`mapContact`, `mapPagination`, `buildContactPayload`).
- `presentation/`: pages, components (`form`, `detail`, `tables`, `stats`, `transactions`) and hooks.

## Domain rules

- Credit limits (`maxReceivable`, `maxPayable`) are money: a non-number or non-finite amount becomes 0, otherwise it is rounded half up to the cent (`roundToCents`).
- Payload: text fields are trimmed and empty strings become `null`; blank emails are dropped; bank accounts need both a bank name and an account number; when shipping is "same as billing" it copies billing; `external_id` is sent on create only; the payment term falls back to 0.
- Mapper fallbacks accept both camelCase and snake_case from the server; a missing display name becomes the translated "unnamed".
- Pagination falls back to `pages`, then to `ceil(total / limit)` with a minimum of 1.
- Transaction view: status tabs and overdue/paid derivation live in `useContactTransactionView` (covered by tests).

## State

TanStack Query. Keys are in `contactKeys` (`useContactQueries.ts`); all contact queries sit under `['contacts', ...]`, so saving, archiving or importing invalidates `contactKeys.all` and group mutations invalidate only `contactKeys.groups`. Account options and payment terms use their own keys (`contact-account-options`, `contact-payment-terms`). Form state is local (`useContactForm`), nothing is persisted client-side.

## i18n

Namespaces `contacts` (spread from `contactsForm.ts` in each locale) and `contactDetail`, both `id` and `en`, with key-parity tests under `src/i18n/locales`.

## Deep-import exceptions (sales)

Four imports reach into `@/module/sales` internals and trip `import/no-restricted-paths`:
`infrastructure/contactApi.ts` (`saleMapper`), `infrastructure/contactMapper.ts` (`saleMoney`), `presentation/components/tables/TransactionTableRow.tsx` and `presentation/components/transactions/formatAmount.ts` (`saleFormat`). `sales` already imports `@/module/contacts` (`fetchContacts`, `fetchPaymentTerms`), and its index also exports pages, so switching to `@/module/sales` for values would add an `import/no-cycle` edge. The clean fix is moving the pure helpers (`saleMoney`, `saleFormat`) and the sale mapper to a shared location in a later milestone.

## Known gaps

- The empty `catch {}` blocks around `mutateAsync` swallow the rejection on purpose, because the mutation hooks already show an error notification: `ContactGroupsModal` (create, update, delete) and `ContactImportModal`. Note that `ContactMainPage` (save, archive), `DetailContactPage` (save, archive) and `AddContactPage` call `mutateAsync` with no catch, so a failure there is an unhandled rejection (the notification still shows and the modal stays open). Left unchanged to keep behavior.
- Groups and import modals are covered at hook level only (`useContactQueries.test.tsx`); there are no component tests.
- `contactSync` endpoint constant is unused.
