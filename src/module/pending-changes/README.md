# pending-changes

Approval queue for changes that ProApps (the operational system) sends to the books: late-payment fines, incoming sale payments, voids and other adjustments. An accountant reviews each change and approves it one by one or in bulk. There is no reject action by design.

- **Route:** `routes.pendingChanges.main` (`/pending-changes`, see `src/router/routes.ts`).
- **Public API (`index.ts`):** `PendingChangesPage` and `usePendingChangesCount`. The Navbar badge uses the count hook. `src/module/Dashboard` has its own separate count hook; it is not shared.
- **Endpoints** (constants in `src/lib/http/endpoints.ts`, `API_PENDING_CHANGES`):
  - `GET /v1/pending-changes` with `page`, `limit`, `type`, `status`, `search`; the response is either `{ data, pagination }` or a bare array.
  - `GET /v1/pending-changes/count`
  - `PUT /v1/pending-changes/:id/approve`
  - `PUT /v1/pending-changes/approve-all` with `{ type }` or `{}`
- **Layers:** `domain/` (types, status vocabulary, rules, formatting), `infrastructure/` (API calls, DTOs, mapper, API error message), `presentation/hooks` (TanStack Query hooks and notifications), `presentation/components` (stats cards, tab list, filters, table, row, details, pagination, two confirm modals), `presentation/pages/PendingChangesPage.tsx`.

## Domain rules

- Status vocabulary: `PENDING`, `APPROVED`, `REJECTED` (`PendingChangeStatus`). The mapper turns any other value into `PENDING`. A change can be approved unless it is `APPROVED` (`canApprove`).
- Type: `FINE` and `SALE_PAYMENT` are known; any other string is shown as is. A change counts as a deletion when its type contains `DELETE` or `VOID`, its payload action is `DELETE`, or `deleted` is true. The details column checks fine, then payment, then deletion; the type badge checks deletion first.
- Notes of the form `Invoice: X, Pelanggan: Y free text` are split into invoice number, customer code and description (`parseChangeNotes`).
- Amounts are only displayed (`formatIDR`, two decimals, `Rp` prefix). Nothing is summed here, so `@/lib/money` is not used.

## State

- Server data: TanStack Query (`pendingChangesKeys`; the count refetches every 30 seconds). Approving invalidates the `pending-changes`, `sales` and `dashboard` query keys.
- Local state: active tab, search text, page, page size and the two modals live in the page.

## i18n

Namespace `pendingChanges` (`id` primary, `en`), in `src/i18n/locales/{id,en}/pendingChanges.ts`. `src/i18n/locales/pendingChanges.test.ts` checks the same keys, placeholders and no empty values. Notification texts of the hooks use the imperative `t` from `@/i18n`.

## Known gaps

- `src/components/Navbar/page.tsx` (a shared component) imports this feature module for the badge count, which breaks the rule that `src/components` never imports `src/module`. The page itself does not render `AppShellLayout`: the router wraps it, which keeps `AppShellLayout -> Navbar -> this module -> page -> AppShellLayout` from becoming an import cycle. To be fixed properly with the layout move in M4.
- The stat cards and tab counts for fines and payments only count the items of the current page, not the whole queue (unchanged behavior).
- The `status` filter exists in the API call but the page never sets it.
- The invoice link navigates to a hard-coded `/sales/:id` instead of a route constant.
