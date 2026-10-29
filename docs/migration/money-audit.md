# Money Arithmetic Audit

Audited 2026-10-29 (read-only, no call site changed). Method: `git grep -nE "parseFloat|Number\(|\.toFixed|reduce\(|Math\.round"` over `src/**/*.ts(x)`, excluding tests and `src/lib/money`, filtered to lines mentioning amount, debit, credit, balance, total, price, tax, nominal, saldo, sum, diff or selisih. 165 matching lines.

## Why it matters

JavaScript `number` is a binary float: `0.1 + 0.2` is `0.30000000000000004`. A debit total and a credit total that should be equal can differ by a hair and show a false "out of balance". The helper in `src/lib/money` (`toMinor`, `fromMinor`, `sumMinor`) does the arithmetic on integer hundredths. See `docs/adr/0005-integer-money-and-localstorage-tokens.md`.

Nothing here is proven wrong: when every amount is a whole rupiah the sums are exact. The risk is any amount with decimals, and any total compared for equality.

## Findings by module

| Module (current path) | Lines | What it does | Risk | Fix in |
|---|---|---|---|---|
| `GeneralJournal/BeginningBalance` (`BeginningBalancePage`, `BeginningBalanceLogsModal`) | 11 | `reduce` of `Number(debit)` and `Number(credit)` in the view | High if the two totals are compared for equality (balance meter) | M3 |
| `GeneralJournal/DetailAccount/TransactionJournal` (`JournalTransactionDetail`, `JournalTransactionDetailTable`) | 4 of 11 | debit and credit totals in views | High (balance indicator) | M3 |
| `GeneralJournal/DetailAccount/Reconciliation` (`FindAndReconModal`) | 1 | sums selected bank statement records against a target | High (match decision) | M3 |
| `GeneralJournal/PeriodeLockAndClosingBooks` (balance sheet, income statement, trial balance, working paper tables) | 6 | category totals computed in table components | Medium (display totals) | M3 |
| `ResultReport/BalanceSheet` (`balanceSheetApi`) | 19 | assets, liabilities and equity totals computed client-side, then checked against each other | High (accounting equation check) | M2 |
| `ResultReport/BusinessOverview` (`JournalEntryTable`) | 4 | total debit and credit across entries, typed `any` | Medium | M2 |
| `ResultReport/GeneralLedger` | 9 | running balance and totals | Medium | M2 |
| `BankCash/ReceiveMoney`, `SentMoney`, `TransferMoney` (stores and pages) | 18 | total without tax, tax, grand total, debit and credit in Zustand stores and pages | High (amounts submitted to the API) | M2 |
| `BankCash/Main` (`StatsBankCashGrid`) | 7 | total bank and cash balance | Low (display) | M2 |
| `BankCash/PettyCash` | 5 | voucher and denomination totals; prototype uses integer IDR | Low now; revisit when backend money type is agreed | M2 |
| `Pembelian` (`CreatePurchaseModal`, hooks) | 7 | `quantity * unitPrice`, tax total | High (percent and decimal quantities) | M1 |
| `Sale` (infrastructure mappers) | 18 | `Number(...)` parsing and adjusted amounts | Medium (adjusted amount is signed) | M1 |
| `Asset` (`AssetStatsGrid`, `useAssets`) | 8 | acquisition cost, depreciation, net book value sums; disposal gain or loss | Medium | M1 |
| `Dashboard` (infrastructure mappers, widgets, `dashboardMetrics`) | 23 | `toNumber` mapping, 6-month totals, aging buckets, balance sums | Medium (display) | M1 |
| `products`, `SettingMenu/GeneralSetting` | 4 | price and format helpers | Low | M1, M4 |

## Open questions for the backend team

1. Does the API send amounts as JSON numbers or decimal strings? (`Dashboard` and `Sale` mappers assume numbers.)
2. How many decimals can an amount have in IDR? Is a two-decimal limit correct?
3. Who owns tax and discount percentage calculation, and with what rounding rule?
4. Petty cash spec says `DECIMAL(18,2)`; the prototype uses integer IDR. One representation must be chosen before `petty-cash` integration.

## Rule for migrations

When a feature is migrated, every sum or comparison of money in it moves to `domain` or `application` code and uses `toMinor` and `sumMinor`. Display formatting stays in `src/utils/FormatCurrency.ts`. No call site changes before the backend answers questions 1 to 3.
