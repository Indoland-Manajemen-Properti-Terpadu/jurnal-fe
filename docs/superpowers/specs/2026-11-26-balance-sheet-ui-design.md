# PRO-130 Balance Sheet UI

## Intent

Bring the Jurnal balance sheet page in line with the requested reference and PRO-130's acceptance criteria. The report should make a dated financial position, its comparison, and the accounts behind each figure easy to read.

## Goals

- Use the PRO-129 response as the source for sections, totals, journal/module counts, unmapped accounts, overdrafts, and current/prior profit.
- Support current month, prior month, current quarter, current year, prior year, and custom report dates; compare against no date, the prior period, the same date last year, or a custom date.
- Show four position summaries, three ratios, the account statement in detailed or summary mode, zero-balance visibility, account search, and derived-profit detail.
- Carry the selected comparison and display settings to export; hide screen controls when printing.
- Keep English and Indonesian copy aligned and reuse the reports module's theme and shared toolbar.

## Non-goals

- Change BE accounting logic or report totals.
- Recalculate account balances or reclassify a bank balance in the client.
- Change unrelated report screens, shared design tokens, or API permissions.
- Commit, push, deploy, or change Jira state.

## Approaches

1. **Use the active endpoint validation and keep the legacy mapper fallback (chosen):** map a grouped snapshot into one domain model, render the required controls and warnings, and continue using server balances and totals. The FE reads the comparison date in a second request because the active endpoint rejects the legacy comparison key. This satisfies the named ticket without changing BE code.
2. **Keep the older response and align only visuals:** this cannot support comparisons, unmapped accounts, overdrafts, or server journal/module counts required by PRO-130.
3. **Fabricate missing report values in the UI:** rejected because it risks changing financial meaning and would not satisfy BE-provided totals.

## Constraints and design

- Request `GET /v1/reports/balance-sheet` with `date` set to the selected period's end date. When a comparison is selected, make a second request for its end date; the active endpoint rejects `as_of` and `compare_as_of` and requires `date` or `endDate`.
- The mapper accepts both the documented grouped response and the prior payload shape for compatibility.
- Server totals remain authoritative. Client grouping uses integer minor units; ratios derive from the mapped totals and show a dash when their denominator is zero or non-positive where specified.
- Account rows link to the account ledger with the selected date range. Current-year profit and retained earnings open a detail modal using existing profit/loss and account-journal sources.
- Mobile statements scroll horizontally. Print hides toolbar and page controls.
- The supplied PRO-129 spec still names `as_of` and `compare_as_of`, but the active endpoint's validation error rejects those keys and requires `date` or `endDate`. The mapper keeps support for both grouped and legacy payloads.

## Builder decisions

- The user chose a visual match using available features first, then explicitly expanded the scope to PRO-130 and PRO-134. The Jira acceptance criteria and attached FE spec now define the scope.
- Use existing Mantine 8, CSS Modules, React Query, routes, and report APIs. Add no dependency.
- Keep older API behavior readable through mapper fallback; do not invent compare or warning data when the response omits it.
