# bank-connection

Connects a cash or bank account of Jurnal to a real bank account so its transactions arrive in the Bank Statement on their own. The product rules, the proposed API and the open decisions are in [docs/prd/bank-connection.md](../../../docs/prd/bank-connection.md); this README says what the frontend does with them.

**Status:** the frontend is built against the **proposed** contract of the PRD (section 7). The backend has no such resource yet (checked 2026-11-12: `GET /v1/bank-providers` and `/v1/bank-connections` answer 404), so on the Demo Site the chooser offers the banks that have a logo and the form cannot be sent yet. The contract is isolated in `infrastructure/`, so a change on the backend side touches only that folder.

## Routes (`src/router/routes.ts`)

| Constant                | Path                                       | Page                                                                            |
| ----------------------- | ------------------------------------------ | ------------------------------------------------------------------------------- |
| `bankConnection.main`   | `/bank-cash/connection`                    | `BankConnectionPage` (what the connection gives, then the banks; `?accountId=`) |
| `bankConnection.add`    | `/bank-cash/connection/new`                | `BankConnectionFormPage` (`?providerId=&accountId=`)                            |
| `bankConnection.detail` | `/bank-cash/connection/:connectionId`      | `BankConnectionDetailPage` (the panel follows the status)                       |
| `bankConnection.edit`   | `/bank-cash/connection/:connectionId/edit` | `BankConnectionFormPage` (a draft, or a request sent back)                      |

Entry point: the row menu of the Cash & bank list ("Hubungkan ke bank", or "Kelola koneksi bank" when the account already carries a `bankConnection`). There is no sidebar item: the task starts from an account. The sidebar highlights Cash & Bank (the page title comes from `extraTitles`).

## Public API (`index.ts`)

The three pages, `ConnectionStatusPill`, `CONNECTION_STATUSES` and the type `ConnectionStatus` (used by the account list).

## Endpoints (proposed, all in `infrastructure/bankConnectionApi.ts`)

`GET /v1/bank-providers`; `POST /v1/bank-provider-requests`; `POST /v1/bank-connections/:id/documents`; `GET|POST /v1/bank-connections`, `GET|PATCH /v1/bank-connections/:id`; `POST /:id/{submit,sign,cancel,revoke,sync}`; `GET /:id/{sync-runs,events,consent-document}`. Lists are read from `{ results }`, `{ data: { results } }`, `{ data: [] }` or a bare array; a single item from `{ data }` or the body.

## Layers

- `domain/`: `connectionStatus` (statuses, the four steps, `isEditable`, `isLive`, `isTerminal`, `blocksNewRequest`, `resolveNextAction`, tones), `connectionForm` (values, `validateConnectionForm`, `toConnectionBody`, `toDraftBody`, `maskAccountNumber`), `statementBalance` (`balanceGap` cent-exact, `ageOf`), `errorKey` (which sentence an error gets), `tokenSubject`, `connection` (entities). All have tests.
- `infrastructure/`: the API functions, DTO mappers tolerant of the envelope shapes, and `BankConnectionError` (`unavailable`, `notFound`, `validation`, `refused`, `conflict`, `rateLimited`, `forbidden`, `network`, `unknown`; the server stack is never kept).
- `presentation/`: hooks (TanStack Query; every key starts with the signed-in user so one user never sees another's cache), pages, and components (`Illustration` with 14 line drawings in brand tokens, `ConnectionStepper`, `ConnectionStatusPill`, `ProviderCard`, `MessagePanel`, `SignPanel`, `ConnectedView`, `ConnectionTimeline`, `FormAside`).

## Rules the screens follow

- **The banks come only from the backend.** No bank list, fee or logo in the frontend. A bank that is not `AVAILABLE` cannot be chosen.
- **The backend's bank list wins.** `useAvailableProviders` offers the backend's providers. Until the backend has the resource (a 404), the banks that have a logo file in `src/assets/banks/` are offered instead (`banksWithLogo`, in the order of the bank master `src/constants/banks.ts`), as ordinary banks to choose, so the flow can be walked through. Their form opens, but sending it fails with a plain message until the backend exists. No fee is claimed for them.
- **The logo is the label.** A bank with a logo shows no name or status text under it (the name stays as the image's alternative text); a bank without one (from the backend) shows an icon and its name. A fee line appears only when the backend states a fee (zero means "no monthly fee"); a status badge only for a bank that is not available. Logo files are named by bank code (`014.png`; see that folder's README); a provider's `logoUrl` wins over a file.
- **Other banks are proposed.** "+ Usulkan bank lain" opens `ProposeBankDialog`: pick a bank from the master (leaving out the banks already offered) and add a note. It calls `POST /v1/bank-provider-requests` (proposed, PRD 7.1); a 404 says the request cannot be sent now.
- **A connection is one thing per account.** The chooser redirects an account that already has an open or live connection to it (`blocksNewRequest`); an expired, rejected, revoked or cancelled one lets a new request start.
- **The fee rule comes from the bank, per kind of account.** A provider carries `feeRules` (monthly charge, included refreshes, price beyond the quota, automatic share, automatic debit). The form shows it for the chosen account type with "Info lengkap" (`FeeNotice`, `FeeInfoDialog`); a type without a rule falls back to the plain monthly fee, or says nothing. For the banks offered before the backend has its list, `LOCAL_FEE_RULES` holds placeholder figures for BCA corporate only (PRD 12.3 decides the price). A connection may carry `refreshUsage`; the connected view then shows "x dari y penyegaran bulan ini" and warns once the quota is passed (`RefreshUsage`).
- **Two documents, uploaded before sending.** The form asks for the ID card of the responsible person and proof of the account (PDF, PNG or JPG, 15 MB). `useSaveConnection` saves the request, uploads each chosen document to it, then sends it for review. If a step after saving fails, the saved id is kept (`savedId` on the error) so the next try updates that request instead of creating another. A document the backend already holds (`connection.documents`) is not asked for again.
- **"Lihat contoh" for each document.** `DocumentSampleDialog` shows schematic illustrations (`src/assets/samples/*.svg`): a KTP and a KITAS with the data blocked out, and the front page of a savings book with the account number and the holder's name framed. They are drawn for this product, carry CONTOH across them and no official emblem, photo, stamp or signature; the dialog says they only show the layout and are not real documents.
- **The company is named under the bank.** The form shows the bank by its full name from the bank master and a read-only "Perusahaan" line with the site name and id of the signed-in user (`useCompanySite`, exported by `@/module/profile`).
- **Sensitive data does not come back.** The account number is shown masked (`••••4821`); when a request is sent back the form asks again for the number and the national id and says why.
- **The server owns the figures.** The bank balance and its time are shown as received; only the difference to the book balance is computed (`balanceGap`, cent-exact). A gap is normal and its hint points to reconciliation.
- **A status is a status.** The panel, the steps and the actions follow `ConnectionStatus`; an unknown status from the server is shown as an error state. `nextAction` from the server wins over the fallback of the status.
- **Errors are plain words.** `connectionErrorKey` maps a known code (`ACCOUNT_ALREADY_CONNECTED`, ...) or a kind to a sentence; raw codes and server text are never shown (a failed sync shows its code only as a reference for support).
- **Dates and times** are shown in WIB.
- **Two-step confirmation** (cancel a request, disconnect) is inline, not a dialog.

## Cash & bank list

`JournalAccounts.bankConnection` (proposed, PRD 7.5) carries `{ id, status, bankName, lastSyncedAt, statementBalance, statementBalanceAsOf }`. When at least one account carries it, the list adds "Saldo rekening koran" and "Koneksi bank" columns; otherwise nothing changes. Petty cash fund accounts and archived accounts are never offered a connection.

## i18n

Namespace `bankConnection` (`id` and `en`), with parity tests in `src/i18n/locales/bankConnection.test.ts` and a hard-coded-text guard in `presentation/hardcodedText.test.ts`.

## Known gaps

- The whole feature is unverified against a real backend; it was walked through in a browser with the network answers simulated from the PRD contract (chooser, form, review, signing, active).
- Sync history shows the last five runs and no paging. The consent letter opens in a new tab as a file the backend returns.
- No notifications for an expiring permission (PRD phase 2) and no list of mutations on the connection page: they live in the Rekening Koran and Rekonsiliasi tabs of the account.
- Menu rights: the entry point reuses the Cash & bank right. A dedicated right (`JP-BC` in the PRD) waits for a decision.
