# PRO-120 Purchase Summary Design

## Goal and sources

Bring the React purchasing dashboard, payables report, and five document-list summaries into visual and behavioral parity with the [prototype](https://jurnalproapps.vercel.app/#pembelian) and the BE handoff linked in Jira PRO-120 comment 10271. The prototype's sample amounts are examples; live values come from the API.

## Dashboard

`GET /v1/purchase-dashboard/summary` supplies all financial and flow metrics. The page shows a large payables panel with three due buckets, a three-row action/unbilled/ready panel, the five stages in server `flow` order, an action queue filtered by `stale`, `warn`, and `ok` severity with eight items per page, aging, top vendors, vendor credit/returns/refunds, current and prior purchase periods, procurement composition, and separate retention information. `GET /v1/purchase-dashboard/actions` supplies the role-filtered action rows and severity totals. The oldest action comes from the summary, not a guess from visible rows. Targets use the existing route map.

Financial sections are rendered only when the corresponding field is present. Present zero values are rendered as zero. Users without `JP-PURCH-RPT` retain permitted flow and actions. The screen preserves the existing page shell and shared theme tokens while matching the prototype's hierarchy, spacing, desktop columns, mobile stack, and copy.

## Payables report

`GET /v1/purchase-bills/payables/by-supplier` is the single source for total, five aging buckets, vendor rows, and invoice rows. The selected vendor and Jakarta `asOf` date feed the same query and export. Render `invoices[]` in response order with a bill link only when the user may read bills. Use response precision. Keep the report right gate.

## List summaries

The request, order, receipt, bill, and payment-request list endpoints provide `data.summary` alongside `data.results` and pagination. Each list renders four prototype-style summary cards above search and table, from its own response. Missing `summary` hides cards for rollout compatibility; a present zero is displayed. Summary values follow the server's permitted scope and filters. A warehouse-only role does not see monetary cards. The bill's `remainingPayable` uses response precision. Pagination and list rows continue to use `results` and `totalResults`.

## Boundaries

Only `src/module/purchases` and its translations/docs change. No backend contract or accounting figures are recalculated in React. Read-only UI verification uses the prototype and live app; sample prototype data are never sent to the API. The development branch starts at `develop-frontend`; promotion uses the repository's PR sequence.
