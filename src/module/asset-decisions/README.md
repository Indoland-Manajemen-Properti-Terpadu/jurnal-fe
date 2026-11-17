# asset-decisions

The number of asset write-off reports waiting for the signed-in user's decision, for the sidebar badge on "Menunggu Anda". It is its own small module so `src/components/Navbar` does not import `assets`, whose pages reach back to the app shell (an import cycle).

- **Public API (`index.ts`):** `useAssetDecisionCount`.
- **Endpoint:** `GET /v1/asset-reports?page=1&limit=100&status=PENDING_APPROVAL`; the count is the rows with `canDecide: true`.
- **State:** TanStack Query, key `['asset-write-offs', 'decision-count']`, refetched every 30 seconds. `assets` invalidates the `asset-write-offs` prefix after filing, approving or rejecting a report, which refreshes the badge too.
- No UI copy, so no i18n namespace. The screens are in [`assets`](../assets/README.md).
