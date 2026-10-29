# period-closing

**UI prototype, no backend.** Period lock and closing the books: a start modal, a trial balance working paper, a financial statement preview (trial balance, income statement, balance sheet, cash flow) and a list page. No request is made to save, lock or close anything. Do not present it as a working feature.

- **Routes** (`src/router/routes.ts`, unchanged): `routes.generalJournal.closingBooks` (`/settings/general-journal/closing-books`), `routes.PeriodAndClosingBook.FinancialStatement` (`/settings/general-journal/period-lock/financial-statement`), `routes.PeriodAndClosingBook.ListPLandCB` (`/settings/general-journal/closing-books/list/period-lock`).
- **Public API (`index.ts`):** `ClosingBooksPage`, `FinancialStatementPage`, `PeriodClosingListPage` (router) and `PeriodAndClosingBooksModal` (opened from the General Journal page).
- **Endpoints:** none. The only data call is the account list through `useJournalAccounts` from `@/module/chart-of-accounts`; the report tables group and display it.
- **Layers:** `domain/` (`reportTotals.ts` sums and grouping, `prototypeData.ts` fixed placeholder figures), `presentation/pages`, `presentation/components`, `presentation/store/usePeriodModals.ts` (Zustand flags of the modal flow, moved from `src/store/useModals.ts`).

## Domain rules

- Only two displayed numbers are computed: the per-category total of the balance sheet and the per-category totals of the income statement (sales revenue, operating expenses, other revenue). They use `sumAmounts`: each account amount is rounded half up to the cent, added as integer cents with `@/lib/money`, a missing amount counts as zero. This removes float drift (0.1 + 0.2 shows 0,30); for whole-rupiah and two-decimal data the result is identical to the old code.
- Everything else is a fixed placeholder shown for layout: the "Total" rows of the trial balance and working paper (0), the income statement header total and the cost of revenue, non-operating expenses and profit rows, the cash flow figures, the balance sheet header total, the dates (`31/07/2024`, `19 Sept 2021`, lock date `01/08/2024`) and the company name. They live in `domain/prototypeData.ts`.
- Trial balance and working paper repeat the same debit and credit of an account in all three column groups.
- The tables compare category names in English (`sales revenue`, `operating expenses`, `other revenue`) against the account data, so the income statement only fills for accounts with those exact categories.

## State

Modal flow flags in `usePeriodModals` (Zustand). Nothing is persisted.

## i18n

Namespace `periodClosing` (`id` primary, `en`), in `src/i18n/locales/{id,en}/periodClosing.ts`, with a key and placeholder parity test (`src/i18n/locales/periodClosing.test.ts`). The original text was English only (no Indonesian existed), so the `id` texts are new translations.

## Known gaps

- The two toasts that were copy pasted from the delete flows ("Selected account has been deleted", "Successfully Delete Transaction") now say "Prototype: no data was changed." The red colour of the draft toast is unchanged.
- The ending cash position block of the cash flow still uses the heading "Cash Flow From Financing Activities" (copied header, unchanged).
- The report tables render total rows as direct children of `<table>` (invalid DOM nesting warning in tests, unchanged).
- The account selects on the closing form hold placeholder options (`React`, `Angular`, ...), not accounts.
- Whether to build the backend or hide these pages is a product decision.
- The pages use `AppShellLayout` with a footer through `PeriodClosingLayout`; `AppShellLayout` does not import this module, so there is no import cycle.
