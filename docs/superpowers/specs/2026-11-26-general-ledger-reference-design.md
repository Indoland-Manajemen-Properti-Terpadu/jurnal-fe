# General ledger reference alignment

## Intent

Bring the general ledger screen into line with the supplied reference so users can scan the period, confirm debit and credit totals, and inspect account movements in one grouped ledger view.

## Goals

- Match the reference's order: report-center back link and report header, period controls, a single summary panel, ledger controls, then the account ledger.
- Show the period preset and two date fields. Keep the existing period presets and query lifecycle; do not add an API filter.
- Group accounts by the category returned by the existing ledger endpoint. Each account can expand or collapse and shows its code, name, normal balance, opening balance, transactions, and closing balance.
- Add the reference's hide-no-transaction control, search for accounts and journal references, collapse-all action, period totals, and a short normal-balance explanation.
- Keep print and PDF/XLSX/CSV export available in the report header.
- Keep all new and changed user-facing strings in Indonesian and English.

## Non-goals

- Change `/v1/general-ledger`, its response contract, export endpoints, accounting calculations, or journal detail routes.
- Change other report pages or any of the existing uncommitted work in contacts and reports.
- Add sample accounting data, dependencies, or a second report design system.

## Approaches

1. **Adapt the report presentation over the existing endpoint (chosen).** The response already includes dates, categories, accounts, transactions, normal balances, and server totals. This is the smallest path that can reproduce the reference structure and interactions without changing financial contracts.
2. **Restyle the current page only.** This would preserve the present printed-ledger layout and omit the reference's account controls and collapsible groups, so it would not meet the requested match.
3. **Change the API contract.** No missing data has been identified that requires a backend change; expanding the contract would add risk and scope without improving the requested screen.

## Constraints and decisions

- The existing endpoint and server-provided totals remain authoritative. The screen must not calculate financial totals by summing account rows, because parent accounts can include their subaccounts.
- Category grouping uses the server's `category` label and keeps its existing order; account class is not a substitute for this grouping.
- The account count with movement is derived from returned transactions. The total account count comes from response pagination. Search affects displayed rows, not financial totals.
- Account and journal links use routes already present in the frontend.
- The site name may appear in the printed ledger heading only when the existing profile hook provides it.
- Responsive behavior may stack controls, while the wide ledger table scrolls horizontally inside its border.

## Implementation scope

Update the reports general-ledger page, its ledger-specific header/period/control/table presentation, and `reportsLedger` translations. Preserve the shared API, mapper, domain, and unrelated local changes. Review the resulting diff before handing it back; automated tests are outside the requested scope.
