# Journal Account Query Ownership Plan

**Goal:** Make TanStack Query the only live source of remote journal-account data while preserving existing consumers.

**Architecture:** Keep the existing feature hook and API service boundaries for this incremental refactor. The API service will use the shared Axios client, and the presentation hook will read account data only from its TanStack Query cache. Remove account-specific Zustand caches after confirming they have no live consumers.

**Tech Stack:** React 18, TypeScript, TanStack Query 5, Zustand, Axios, Mantine 8.

**Spec:** `.codex/PROJECT_CONTEXT.md`

## Global Constraints

- TanStack Query v5 owns remote/server state, request lifecycle, caching, retries, and invalidation.
- Zustand owns client-only shared state such as cross-page interaction state. Do not mirror server responses in Zustand or maintain two competing sources of truth.
- Route all HTTP traffic through the configured shared client and feature-specific infrastructure adapters. Never call HTTP directly from a page or UI component.
- Do not guess endpoints, permissions, tenant/site scoping, accounting rules, or request/response shapes. Verify them from available project/backend documentation or an authorized Postman collection. If evidence is missing, state the assumption and ask before implementing a contract-dependent change.
- Preserve the existing `/v1/accounts` endpoint, `results` response envelope, `showArchived` query parameter, query-key prefix, and hook return shape.
- Preserve unrelated working-tree changes; do not change shared API-client behavior.

---

### Task 1: Type the journal-account API boundary

**Files:**
- Modify: `src/module/GeneralJournal/JournalAccount/services/AccountJournal.service.ts`

**Interfaces:**
- Consumes: `API_ACCOUNT.GET_ALL_ACCOUNT` and `JournalAccounts`.
- Produces: `getJournalAccounts(params?: { showArchived?: 1 }): Promise<JournalAccounts[]>`.

- [x] Use the shared `apiClient` instance with Axios response typing for the existing `{ results: JournalAccounts[] }` envelope.
- [x] Keep HTTP failures rejected so TanStack Query can expose its error state; reject malformed `results` values with a feature-level error.

### Task 2: Make the query cache the account-list source

**Files:**
- Modify: `src/module/GeneralJournal/JournalAccount/hooks/useJournalAccounts.ts`

**Interfaces:**
- Consumes: `getJournalAccounts` from Task 1.
- Produces: the existing return shape: `accounts`, `isLoading`, `isError`, `isEmpty`, and `refetch`.

- [x] Remove Zustand reads/writes and the callback stored in query `meta`.
- [x] Keep the existing `['accounts', showArchived]` key and return an empty array while that key has no data.
- [x] Mark the result empty only after a successful query finishes with no accounts.

### Task 3: Remove obsolete account-only caches

**Files:**
- Delete: `src/store/GeneralJournal/useJournalAccount.tsx`
- Delete: `src/module/GeneralJournal/JournalAccount/services/CreateTransactionJournal.service.ts` (commented-out obsolete query/store prototype)
- Modify: `src/store/index.ts`
- Modify: `src/module/GeneralJournal/Main/pages/GeneralJournalPage.tsx`
- Modify: `src/module/BankCash/ReceiveMoney/store/ReceiveMoneyStore.ts`

- [x] Remove only the confirmed-unused account-list store and its barrel export/imports.
- [x] Remove the confirmed-unused account-list cache from the Receive Money store; preserve transaction-form state.

### Task 4: Review the scoped diff

- [x] Search for live `useJournalAccountStore` and account-cache references and confirm all account-list consumers still use `useJournalAccounts`.
- [x] Review the diff to confirm no unrelated working-tree changes were altered.
- [x] Do not run automated tests or builds unless requested; report verification limits clearly.
