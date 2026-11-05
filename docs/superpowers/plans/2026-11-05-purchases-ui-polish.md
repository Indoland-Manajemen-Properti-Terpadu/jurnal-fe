# Purchases UI polish

Make every Pembelian screen look like one calm, consistent product, with the same visual language as the Daftar Akun list (`src/module/chart-of-accounts/presentation/components/AccountStatsCards.tsx`). Add pictures of data only where they help a decision. This is a presentation-only change: no API, domain rule or route changes.

Branch: `feat/purchase-revamp` (uncommitted work already on it). Do not commit, push or deploy. Run one agent at a time.

Read before starting: `docs/ui-guidelines.md` (Standard A/B, Calm Financial Interface Rules), `docs/design-system.md` (tokens, typography, colour rules), `src/module/purchases/README.md`.

## Problems found in the current UI

1. **Too many hues.** Icon orbs use cyan, teal, indigo, violet, yellow and gray with no meaning (`PipelineStrip`, `OverviewTab` stats, `DocumentHighlights`). The hub hero uses a gradient that nothing else uses.
2. **Font drift.** `ff="monospace"` on amounts in 6 files (`AmountSummary`, `PaymentAmountsCard`, `PaymentSummaryCard`, `PaymentBillsEditor`, `ReceiptSummaryCard`, `CreditApplicationsCard`, `QuotationsSection`), while the rest of the app uses Figtree with tabular figures. Pixel sizes `fz={11|12|15|20|22|26|30}` are used instead of the type scale (design-system.md forbids px sizes).
3. **Same thing drawn three ways.** KPI cards exist as `OverviewTab/Stat`, `PayablesKpis/Kpi` and `PayablesHero`. Label/value facts exist as `payments/InfoField` plus ad hoc markup in each `*InfoCard`/`*SummaryCard`. Money breakdowns exist as `AmountSummary` and `PaymentAmountsCard`. Status notes are an `Alert` with a different colour map on each page.
4. **Layout gaps.** The bill items table is clipped in the 8-column area (`Table.ScrollContainer minWidth={820}`). The hub hero stretches to the height of the side column and leaves empty space. The pipeline step cards and chevrons do not line up with the grid edges.
5. **Hub not aligned with Standard A.** Daftar Akun puts its metric cards between the header and the tabs paper. The purchase hub hides them inside the overview tab.

## Design rules for this change (apply everywhere)

**Colour**
- Brand blue and neutrals carry the UI. Every `ThemeIcon` is `variant="light" color="primary" radius="md"`, size 36 in card headers and metric cards, 32 in list rows.
- Data visuals use the primary scale only: `primary-6` for the main series, `primary-2` for the soft or rest series, `primary-1` for tracks. This matches `AccountStatsCards.module.css`.
- Red appears only for real lateness or refusal: overdue money, a rejected or void document, an error. Use `red-7`/`--jurnal-color-danger-strong` for text and `red-5` or above for fills.
- Payables aging is the one scale that needs urgency: `primary-6` for "not yet due", then `red-3`, `red-5`, `red-7`, `red-9` for 1–30, 31–60, 61–90 and >90 days. Use one hue at increasing strength, not yellow, orange and red together.
- Status badges keep the semantic map in `StatusBadge.tsx` (gray, primary, yellow, green, red). Do not change it.
- No gradients on surfaces. Cards are `--jurnal-color-surface` with a `--jurnal-color-border-subtle` border.

**Typography (Figtree, type scale only)**

| Role | Props |
|---|---|
| Section/card title | `fz="md" fw={700}` |
| Card subtitle, hints, captions, field labels | `fz="xs" c="dimmed"` (labels add `fw={500}`) |
| Body values, table cells | `fz="sm"` (`fw={500}` for a value under a label) |
| Metric value | `fz="var(--jurnal-text-2xl)" fw={700} c="dark.9" lh={1.1}` |
| Emphasised total in a money breakdown | `fz="lg" fw={700} c="primary.8"` |
| Document number links | `fz="sm" fw={500} c="primary.7"`, underline on hover |

- Money and quantities: Figtree with `font-variant-numeric: tabular-nums`, right-aligned, `white-space: nowrap`. Remove every `ff="monospace"`.
- Remove every numeric `fz={n}`. Map 11/12 → `xs`, 15 → `md`, 20/22/26 → the metric value style, 30 → not needed after the redesign.

**Spacing and shape**
- Page: `PageFrame` (Standard A/B wrapper) with `Stack gap="lg"`. Inside cards: `p="lg"`, `gap="md"`. Grid gutters: `lg`.
- Radius: cards `md`, the outer tabs paper `lg`, badges `sm`.
- Every card is a `SectionCard` (icon orb, title, optional subtitle, optional action). Do not add new bespoke card wrappers.

**Copy**: id primary, en secondary, parity test must pass. Never mention server, API, code or system internals in user text (see memory rule). No em dashes in UI copy.

## Shared building blocks (Task 1)

All live in `src/module/purchases/presentation/components/shared/`. Each file stays under 400 lines. No `any`, no `console.*`, `@/` imports only.

1. **`MetricCard.tsx` + `MetricCard.module.css`**. Port `StatCard` from `AccountStatsCards` with these props: `label`, `value`, `hint?`, `visual?: ReactNode`, `tone?: 'default' | 'danger'` (danger turns the value `red.7`), `onClick?` (renders as a button with a focus ring when set). Add `MetricGrid` with 1 column at base, 2 from `xs`, and 4 from `lg` (copy the `.grid` rules). This replaces `OverviewTab`'s `Stat`, `PayablesKpis`'s `Kpi` and `PayablesHero`.
2. **`visuals.tsx` + `visuals.module.css`**. These are small, accessible pictures. Each one takes `aria-label` and has `role="img"`.
   - `SegmentBar({ segments: {key, value, color}[], height?: 8|12 })` is a stacked bar with 2px gaps and rounded segments. An all-zero input renders a `primary-1` track.
   - `Legend({ items: {key, label, value: string, color}[], layout?: 'row'|'column' })` shows a dot, a label and a right-aligned bold value (copy `.legendRow`).
   - `MiniBars({ values: number[], labels: string[] })` is a column chart: the peak bar is `primary-6` and the rest are `primary-2`, at 44px height (copy `.bars`).
   - `RingStat({ percent, label, danger? })` wraps Mantine `RingProgress` at size 64 and thickness 7 with the percent in the centre. It uses `primary.6` on a `primary-1` root, or `red.6` on `red-1` when danger is set.
   - `AGING_COLOR: Record<AgingBucketKey, string>` holds the aging scale defined above as CSS variables.
3. **`InfoGrid.tsx`**. It renders `InfoGrid({ items: {label, value: ReactNode, span?: 1|2}[] })` as two columns from `sm`, with a `fz="xs" c="dimmed" fw={500}` label above an `fz="sm" fw={500}` value. An empty value renders `-`. Move `payments/InfoField.tsx` here (or delete it) and update its imports.
4. **`MoneyRows.tsx`**. This is one money breakdown for every document. Rows are `{label, amount, sign?: 'minus', emphasis?: 'total' | 'muted'}[]`, with a divider before each `total` row. Re-implement `AmountSummary` on top of it (keep its props) and make `PaymentAmountsCard` and the receipt and return value rows use it.
5. **`StatusNote.tsx`**. `StatusNote({ tone: 'neutral'|'info'|'warning'|'danger', title?, children })` renders `Alert variant="light" radius="md"` with gray, primary, yellow or red colours and a matching Tabler icon. Use it for every page-level note: `PaymentDetailPage`'s `NOTE_COLOR` map, the return draft note, `BillVarianceNotice`, `BillVariancesCard` and the `StateFrame` notes where they apply.
6. **`numeric` class**. Add `.numeric { font-variant-numeric: tabular-nums; white-space: nowrap; }` once, in `shared/shared.module.css`, and use it wherever amounts render. In TSX, `style={textStyles.numeric}` from `@/theme` is also fine.
7. **Fix existing shared pieces.**
   - `SectionCard`: title `fz="md"` and subtitle `fz="xs"`; no other change.
   - `DetailHighlights`: replace `fz={15}` with `fz="md"`. Keep the white card with hairline dividers; this is the approved look.
   - `DocumentJourney`, `ApprovalPanel` and `Timeline` are fine as they are. Check only their font sizes.

Acceptance: `npx tsc --noEmit` is clean, `npx eslint src/module/purchases` is clean, and every existing test passes. Write a small Vitest test for `SegmentBar` (a zero total renders the track, and segment flex equals the share) and for `MoneyRows` (minus sign and total divider).

## Hub (Task 2): `PurchasesPage` and `components/hub/`

Target layout (Standard A):

```
ModuleHeader  [refresh] [Laporan Hutang] [+ Buat Permintaan]   (unchanged)
MetricGrid (above the tabs paper, visible on every tab)
  1 Hutang berjalan     Rp 10.000   "dari 1 tagihan belum lunas"   visual: SegmentBar not-due vs overdue (2 segments)
  2 Sudah jatuh tempo   Rp 0        "x% dari hutang"                visual: RingStat percent, danger when > 0
  3 Menunggu keputusan  3           "Permintaan 1 · Pesanan 1 · Pembayaran 1"  visual: MiniBars per type
  4 Siap dibayar        0           "voucher disetujui"             visual: none
Paper radius lg (tabs, unchanged pill tabs)
  Overview tab:
    Pipeline stepper (one card, full width)
    Grid 8/4:  [Perlu tindakan list]  |  [Umur hutang card]
```

Steps:
1. Move the metric row out of `OverviewTab` into `PurchasesPage`, between `PageFrame`'s header and the tabs `Paper`. Feed it from `useOverviewData` and lift that hook to the page. Hide each metric the user may not see, using the same rules as today. Hide the whole grid when no metric is visible. While loading, show 4 `Skeleton height={104} radius="md"`.
2. Card 3 counts by reason from `data.items` (approveRequest, approveOrder, approvePayment). Show bars only for types the user can approve.
3. Clicking a metric card goes somewhere useful. Cards 1 and 2 open `routes.purchases.payables`, card 3 opens the overview tab, and card 4 opens `?tab=payments`.
4. **Pipeline stepper.** Rewrite `PipelineStrip` as one `SectionCard` (`IconRoute`, title "Alur pembelian") holding 5 equal columns connected by a 2px `--jurnal-color-border-subtle` line drawn behind the icons. Each column is a button with a `ThemeIcon` (primary light, size 40, radius xl), the stage label (`fz="xs" c="dimmed"`) and the count (`fz="xl" fw={700}`). Hover gives a `primary-0` background; focus gives a visible ring. Below `sm` the stepper becomes a 2-column grid without the connector line.
5. **Perlu tindakan.** Make it a `SectionCard` (`IconChecklist`) with a gray `Badge` showing the count in the action slot. Keep `WorkRow` but make the icon orb size 32, primary light. Add a reason "chip" as plain `fz="xs" c="dimmed"` text, as it is today. Show at most 8 rows plus a "Tampilkan semua (n)" `Button variant="subtle"` that expands the list in place.
6. **Umur hutang card** (`components/hub/AgingCard.tsx`, shown only with the reports right). It holds a `SectionCard` (`IconHourglass`), a `SegmentBar` height 12 with the 5 buckets, a column `Legend` with amounts, and a footer `Button variant="light" fullWidth` reading "Lihat Laporan Hutang". This replaces `PayablesHero`.
7. Delete `PayablesHero.tsx`, the `Stat` component and the unused CSS classes in `OverviewTab.module.css` (`.hero`, `.agingBar`, `.agingSegment`, `.agingEmpty`, `.legend*`, `.dot`, `.stage*`, `.pipeline`, `.link`, `.top`, `.side`, `.card`, `.cardBody`).

i18n (`purchasesHub.ts`, id/en):
- `overview.overdueShare` = "{percent}% dari total hutang" / "{percent}% of total payables"
- `overview.decisionsBreakdown` = not needed if the hint is built from `hub.tabs.*` labels
- `overview.showAll` = "Tampilkan semua ({count})" / "Show all ({count})"
- `overview.seeReport` = "Lihat Laporan Hutang" / "Open payables report"
- `overview.agingSubtitle` = "Sisa hutang menurut lama jatuh tempo" / "Remaining payables by days past due"

Remove keys that are no longer used, in both languages.

## Payables report (Task 3): `PayablesReportPage`, `components/reports/`

1. Replace `PayablesKpis` with a `MetricGrid` of 3 cards:
   - Total hutang, with a SegmentBar not-due vs overdue.
   - Sudah jatuh tempo, with a RingStat percent (danger when above 0).
   - Vendor dengan hutang, showing the row count and the largest vendor's share in the hint, with MiniBars of the top 5 vendors by remaining.
2. Add an **"Umur hutang" card** above the table. It shows 5 horizontal bars, one per bucket, each with the label on the left, an amount on the right and a bar filled to the bucket's share in `AGING_COLOR`. Below 48em the label sits on top. This is the main chart of the page.
3. `PayablesTable`:
   - The vendor cell shows the name (`fw={500}`) and `fz="xs" c="dimmed"` "{n} tagihan".
   - The "Sisa" column adds a 40px inline `SegmentBar` height 8 for the vendor's not-due vs overdue split.
   - Bucket cells above 0 in the overdue columns use `c="red.7"`. Zero shows `-` in dimmed text.
   - The footer totals row uses `fw={700}` with a top border.
4. Make `VendorCreditCard` a `SectionCard` and use `MoneyRows`.

## Lists (Task 4): `components/lists/*`, `shared/ListShell.tsx`

Match `AccountTable`.
1. Above the table, inside the same Paper: put the search, status `Select` and extra filters on the left, and `fz="sm" c="dimmed"` "{count} dokumen" on the right (new key `list.count`).
2. Cells (in `lists/cells.tsx`, shared by all six lists):
   - `NumberCell` is the link style from the typography table.
   - `PartyCell` shows the vendor name with an optional dimmed second line (for example the vendor invoice number on bills).
   - `DateCell` uses `formatDay`.
   - `AmountCell` is right-aligned with `numeric`.
   - `DueCell` turns `c="red.7"` with an `IconAlertCircle size={14}` when the bill is overdue.
3. The table uses `verticalSpacing="sm"`, `highlightOnHover`, the header background `--jurnal-color-surface-hover`, and `Table.ScrollContainer` with a `minWidth` equal to the sum of the column `minWidth` values.
4. Bills list: fold the "Faktur vendor" column into the second line of `PartyCell`. The columns become Nomor, Vendor, Jatuh tempo, Status, Hutang, Sisa.
5. Payments list: show the type (Pelunasan / Uang muka) as the second line under the number, not as its own coloured badge.
6. Empty, error and loading states stay inside the table shell (the rule in ui-guidelines).

## Detail pages (Task 5): `pages/*DetailPage.tsx` and their cards

One skeleton for all six:

```
ModuleHeader: number + StatusBadge, subtitle, [Kembali] [primary action] [⋯ menu]
DetailHighlights (4 facts)               (done; keep)
StatusNote (only when the status needs explaining)
Grid 8 / 4
  left:  Info card (InfoGrid) · Items card · document-specific cards
  right: Amounts (MoneyRows) · Settlement (bills) · Approval timeline · Alur Pembelian timeline · Attachments
```

1. Replace the label/value markup in `BillInfoCard`, `OrderSummaryCard`, `ReceiptSummaryCard`, `RequestSummaryCard`, `ReturnInfoCard` and `PaymentInfoCard` with `InfoGrid`. Each card keeps its own fields and order.
2. **Items tables** (`BillItemsCard`, `OrderSummaryCard` items, `ReceiptSummaryCard`, `ReturnLinesCard`, `PaymentBillsCard`, request items):
   - The description column wraps and takes the remaining width. The product name is `fw={500}` and the memo or description a dimmed second line.
   - Merge "Pajak" into a dimmed second line under the amount (for example "PPN 11%"). Show "Diskon" only when some row has a discount.
   - Set `minWidth` so the table fits the 8-column area at 1280px without clipping (aim for 640 or less) and scrolls on smaller screens.
   - Add a footer row with the total quantity or amount where it adds meaning.
3. **Bill settlement** (`BillSettlementCard`): use `SegmentBar` with Dibayar `primary-6`, Retur/kredit `primary-3` and Sisa `primary-1` track, a column `Legend` and a paid percent. Red applies only to the "Sisa" figure, and only when the bill is overdue.
4. **Order receiving progress** (new, inside `OrderSummaryCard` or a small `OrderProgressCard` on the right): show received qty / ordered qty and billed qty / ordered qty as two `Progress size="sm" color="primary"` rows with percent. Show this only for APPROVED, PARTIAL_RECEIVED, RECEIVED and CLOSED. It answers "how far is this order".
5. Payment detail: put `PaymentAmountsCard` on `MoneyRows`. `PaymentBillsCard` gets a per-bill amount and a dimmed "sisa setelah bayar" line.
6. Return detail: `ReturnSettlementCard` gets a `SegmentBar` showing applied to bill vs vendor credit (primary-6 / primary-3).
7. Request detail: `QuotationsSection` highlights the cheapest quotation with a `Badge variant="light" color="primary"` "Termurah" and a `primary-0` row background. Remove the monospace totals.
8. Replace page notes with `StatusNote`. Use `neutral` for drafts, `info` for approved, waiting to pay, or posted, `warning` for pending approval and variances, and `danger` for rejected or void with the reason.
9. Header actions: exactly one filled button, which is the next step for the status (for example "Ajukan", "Verifikasi", "Bayar"). Everything else goes in the `⋯` menu or uses `variant="default"`. Check every `*ActionBar` against this.

## Forms (Task 6): `pages/*FormPage.tsx`, `*FormBody`, editors

1. Use Standard B everywhere: Grid 8/4, with every section a `SectionCard`. The right column is a sticky (`pos="sticky" top={20}`) **summary card** built from one shared `FormSummaryCard` with these props:
   - `title`
   - `rows` (InfoGrid-like, single column)
   - `money?` (MoneyRows plus an "Estimasi" `Badge variant="light" color="gray"`)
   - `note?` (`fz="xs" c="dimmed"` explaining the next step)
   - `actions` (Batal `variant="default"` and one primary save button, full width on mobile)
2. The line editors (`RequestItemsEditor`, `OrderItemsEditor`, `BillLinesEditor`, `ReceiptLinesEditor`, `ReturnLinesEditor`, `PaymentBillsEditor`) share one look:
   - The header row uses the table header style.
   - Inputs are `size="sm" radius="md"`.
   - Remove-row is an `ActionIcon variant="subtle" color="gray"` with an aria-label.
   - "Tambah baris" is a `Button variant="light" leftSection={<IconPlus/>}` under the table.
   - Amounts in the editors are `numeric`, not monospace.
3. `RequestModeCards`: selected card gets a `primary-6` border and a `primary-0` background; unselected cards get a neutral border. No other colours.
4. Validation errors show inline under the field, as today. The summary card shows a dimmed checklist only when the form is long (bill and order). Each item uses `IconCircleCheck` in `primary` when satisfied and `IconCircleDashed` in gray when not.

## Cleanup and verification (Task 7)

1. Run `grep -rn 'ff="monospace"\|fz={[0-9]' src/module/purchases`. It must return nothing.
2. Run `grep -rnE 'color="(cyan|teal|violet|indigo|orange|grape|pink|lime)"' src/module/purchases`. It must return nothing.
3. Delete unused components, CSS classes and i18n keys (both languages).
4. Run the checks: `npx tsc --noEmit`, `npx eslint src/module/purchases src/i18n`, `npm run lint:ratchet` (no regressions), `npx vitest run` (all tests, including `src/theme/noHardcodedStyles.test.ts` and the purchases i18n parity test), and `npx prettier --check src/module/purchases src/i18n`.
5. Browser check with Playwright against `npx vite --port 5199` on the live Demo Site data. Log in as `finance2@proapps.id`; the password is in the session notes. Screenshot each of these at 1440px and at 390px wide:
   - the hub overview
   - each of the 6 list tabs
   - detail pages: PR-2026-00001, PO-2026-00001, PO-2026-00004, the GR of PO-00001, BILL-2026-00001, BILL-2026-00002, PV-2026-00001, RET-2026-00001
   - the forms: new request, the new order from an approved request, a new payment advance (open the form only, do not save)
   - the payables report

   The viewport in this environment is scaled 0.8, so trigger clicks with `browser_evaluate` (`element.click()`) rather than coordinate clicks. Delete `.playwright-mcp/` and any screenshots in the repo when done. Stop the dev server.
6. Check every page against this list:
   - one primary button per region
   - no hue outside primary, gray and the semantic states
   - no clipped tables at 1440px
   - nothing overflowing at 390px
   - every number right-aligned and tabular
   - loading, empty and error states render
7. Update `src/module/purchases/README.md`: list the new shared components in the presentation layer bullet.

Do not create, edit or void documents on the Demo Site during this task; it is visual only.

## Order and size

| Task | Scope | Depends on |
|---|---|---|
| 1 | shared building blocks and tests | none |
| 2 | hub | 1 |
| 3 | payables report | 1 |
| 4 | lists | 1 |
| 5 | detail pages | 1 |
| 6 | forms | 1, 5 (MoneyRows, InfoGrid) |
| 7 | cleanup, checks, browser pass | all |

After each task, run `tsc`, `eslint` on the touched folder and the purchases tests, then report what changed with a screenshot of the main page of that task before starting the next one.
