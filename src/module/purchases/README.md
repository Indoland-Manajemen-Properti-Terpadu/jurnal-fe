# purchases

Purchase bills (accounts payable): list, filter and sort supplier bills, create a bill, record a payment and delete a bill. The data is a browser-only prototype stored in `localStorage`; there is no backend yet.

- **Route:** `routes.baseModules.purchases` (`/purchases`). The old `/pembelian` (`routes.baseModules.legacyPurchases`) redirects to it; `src/router/legacyRedirects.test.tsx` covers the redirect.
- **Page:** `presentation/pages/PurchasesPage.tsx`, exported from `index.ts` as `PurchasesPage`. It renders `AppShellLayout` directly.
- **Endpoints:** none.
- **Storage:** key `jurnal_purchase_bills_data` (unchanged), value is a JSON array of `PurchaseBill`. `infrastructure/localStoragePurchaseRepository.ts` implements the `PurchaseRepository` port (`domain/purchaseRepository.ts`); the seed `INITIAL_PURCHASE_BILLS` lives in `infrastructure/purchaseSeed.ts` (vendor names are data, not UI strings).
- **State:** `presentation/hooks/usePurchases.ts` holds the list in React state and writes every change through the repository. A failed save leaves the list unchanged and shows an error notification.

## Domain rules (`domain/`)

- `purchaseTotals.ts`: line subtotal (`quantity x unitPrice`), tax (`subtotal x rate / 100`), bill totals, payment application (`remaining = max(0, total - paid)`, status `PAID` at zero remaining else `PARTIAL`), paid percentage, dashboard summary, and the derived `OVERDUE` status (open bill with remaining amount and a past due date; `PAID`, `CANCELLED` and `DRAFT` are never changed). Arithmetic runs in integer minor units through `@/lib/money`.
- `purchaseFilters.ts`: tab counts, tab filter, search (bill number, vendor, notes) and sort.
- Rounding: unit prices are rounded to the cent, line subtotal and tax are rounded half up to the cent per line. Whole-rupiah amounts give the same results as before; a tax that has more than two decimals (for example 11 % of 1500.50 x 3 = 495.165) is now stored as 495.17 instead of the raw float.

## i18n

Namespace `purchases` (`id` primary, `en`). `src/i18n/locales/purchases.test.ts` checks identical keys, placeholders and no empty values. Payment method and payment term option values stay Indonesian/English data strings; only labels are translated.

## Known gaps

- Payment account options (`1-10001 Kas Operasional Kantor`, ...) are mock account names in `PayPurchaseModal`, not read from the chart of accounts.
- The payment's date, method, account and notes are collected but not stored; only the amount changes the bill.
- Dates in the table use the fixed `id-ID` format regardless of the selected language.
- Moving to a backend means a new `PurchaseRepository` adapter and TanStack Query hooks.
