> **Source of truth for entity shapes, statuses, state machines, errors and journals is [`API-REAL-SHAPES.md`](API-REAL-SHAPES.md)** (observed on the Demo Site). This file lists every endpoint with its path, query and body. Where the two disagree, `API-REAL-SHAPES.md` wins: markers `[INFERRED]` and `[DOC]` below that real calls contradicted are noted there (section 7).

# Kas Kecil (Petty Cash + Kasbon) API Contract

Compiled 2026-10-31 from:

- Postman collection **Jurnal Proapps - Kas Kecil** (`30956136-78daffbc-0531-4269-82ab-a6afdecb3d92`), 62 requests. The collection has **no saved example responses**; request descriptions are the only documentation.
- Parent collection **Jurnal Proapps** (`30956136-1caf2508-...`): login, account mappings.
- Live backend `https://jurnal-api.proapps.id`, logged in as `finance2@proapps.id` (role `superadmin`, site "Demo Site" `6acf271697cb3015c8664cab`). **Only GET requests were sent** (plus login). Raw responses are in `scratchpad/api-samples/*.json`.

Confidence markers used below:

- **[LIVE]**: observed in a real response.
- **[DOC]**: stated in the Postman description or body.
- **[INFERRED]**: deduced from wording. Confirm with backend before relying on it.

---

## 0. Live data snapshot (Demo Site, 2026-10-31)

| Resource                                         | Count                                | Notes                                                                                                                                           |
| ------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| Funds                                            | **0** (ACTIVE/INACTIVE/CLOSED all 0) | Empty state is the only state reachable today                                                                                                   |
| Vouchers                                         | 0                                    |                                                                                                                                                 |
| Opname (counts)                                  | 0                                    |                                                                                                                                                 |
| Reimbursements                                   | 0                                    |                                                                                                                                                 |
| Kasbon (advances)                                | 0                                    |                                                                                                                                                 |
| Audit logs                                       | 0                                    |                                                                                                                                                 |
| Reports                                          | all empty (`[]` or zero buckets)     |                                                                                                                                                 |
| Lookups: expenseAccounts                         | 72                                   | account numbers start with 5, 6, 8                                                                                                              |
| Lookups: bankAccounts                            | 7                                    | 1-10000 … 1-10099, includes both "Kas Kecil" accounts (1-10001, 1-10002)                                                                        |
| Lookups: taxes                                   | **0**                                | so the per-line `taxId` path cannot be exercised on this site                                                                                   |
| Lookups: tags                                    | 4                                    |                                                                                                                                                 |
| Lookups: users                                   | **1** (the logged-in Finance user)   | **SoD flows can't run on this site**: approver ≠ creator, witness ≠ counter ≠ custodian, and disburser ≠ requester all need ≥2-3 distinct users |
| Account mapping `petty_cash_variance`            | **unmapped** (`account: null`)       | Reimbursement/opname with a variance will likely fail `DEFAULT_ACCOUNT_NOT_CONFIGURED`                                                          |
| Account mapping `petty_cash_employee_receivable` | mapped → 1-10205 Piutang Karyawan    |                                                                                                                                                 |

Because there is no data, **no entity (fund/voucher/count/reimbursement/advance) shape was observed live**. Every entity field list in section 3 is [DOC]/[INFERRED]. The frontend should treat them as provisional and ask the backend for one real example per entity, or seed a fund on a test site.

---

## 1. Conventions

### 1.1 Base, auth

- Base path: `/v1/petty-cash`.
- Auth: `Authorization: Bearer <access token>`.
- Login: `POST /v1/auth/login` `{ email, password }` → `{ user, tokens: { access: { token, expires }, refresh: { token, expires } } }` [LIVE]. `expires` is an ISO string with a `+07:00` offset. The access token lives **30 minutes**; the refresh token lives 30 days.
- Missing or invalid token → `401 { code: 401, message: "Please authenticate", stack }` [LIVE]. There is no `data.errorCode` on a 401.
- Permissions are menu codes [DOC]: `JP-PC` (fund / read all), `JP-PC-VCH` (voucher), `JP-PC-APR` (approval / Finance), `JP-PC-CNT` (opname), `JP-PC-RMB` (reimbursement), `JP-PC-DSB` (disbursement), `JP-PC-ADV` (staff kasbon), `JP-PC-CST` (custodian), `JP-PC-CTL` (control), `JP-GL` (period-end check). Descriptions read "Create `JP-PC-VCH`" = the user needs the Create permission on that menu.

### 1.2 Success envelope [LIVE]

```json
{ "code": 200, "message": "Get petty cash funds success", "data": { ... } }
```

### 1.3 Pagination envelope [LIVE]

```json
"data": { "results": [], "page": 1, "limit": 25, "totalPages": 0, "totalResults": 0 }
```

- `page` ≥ 1. `limit` must be 1-100 (`limit=0` → 400, `limit=200` → 400 "must be less than or equal to 100") [LIVE]. Default limit is 25.
- `sortBy` is accepted on funds and vouchers (`code:asc`, `date:desc` both returned 200) [LIVE]. The format is presumably `field:asc|desc`. Allowed fields are undocumented.

### 1.4 Error envelopes [LIVE]

**Validation error (400, Joi)**: `data` is an **array**, not an object:

```json
{
  "code": 400,
  "message": "\"status\" must be one of [ACTIVE, INACTIVE, CLOSED]",
  "data": [
    { "field": "status", "message": "\"status\" must be one of [ACTIVE, INACTIVE, CLOSED]" }
  ],
  "stack": "Error: ...validate.js:23:17..."
}
```

**Business/domain error**: `data` is an object holding `errorCode`:

```json
{
  "code": 404,
  "message": "Kas kecil tidak ditemukan",
  "data": { "errorCode": "NOT_FOUND" },
  "stack": "..."
}
```

The frontend must branch on the shape: `Array.isArray(data)` → field errors; `data?.errorCode` → domain error. `message` is Indonesian user-facing text for domain errors and Joi English text for validation errors.

### 1.5 Query-string strictness (important) [LIVE]

The backend validates queries strictly:

- **Unknown query keys → 400** (`"search" is not allowed` on `/counts`).
- **Empty values → 400** (`fundId=`, `status=`, `from=`, `to=`, `requesterId=`, `entityType=`, `entityId=`, `action=` all fail with "is not allowed to be empty"). **Only `search=` may be empty.**
- Consequence: the Postman URLs themselves (`?fundId=&status=&from=...`) return 400 as written. The frontend HTTP layer **must drop undefined/empty params** before sending.
- Ids must be 24-hex Mongo ObjectIds; otherwise 400 `"\"fundId\"\" must be a valid mongo id"` (note the doubled quotes in the message).

### 1.6 Dates and money

- Accounting dates (`date`, `fundingDate`, `disbursementDate`, `from`, `to`, `asOf`, period-end `date`): **`YYYY-MM-DD` strings**. ISO datetimes are rejected in query params (`2026-10-01T00:00:00Z` → 400 "fails to match the YYYY-MM-DD pattern") [LIVE]. Report responses echo dates as `YYYY-MM-DD` strings [LIVE].
- Timestamps (`countedAt`, `dueAt`, `until`, `createdAt`, `expiresAt`): ISO-8601 UTC with ms (`2026-12-31T16:59:59.000Z`) [DOC/LIVE for createdAt]. The `until` example `16:59:59Z` = 23:59:59 WIB, so the backend expects the client to send the end of the local day converted to UTC.
- `pending-vouchers` without `asOf` defaults to today's date (`2026-10-31`) [LIVE]. The server's reference timezone is not stated (likely WIB, matching the +07:00 token expiry).
- **Money is a JSON number** in both requests (`"pagu": 5000000`, `"amount": 50000`) and responses (`"amount": 0`, `"outstandingAmount": 0`, `"total": 0`) [DOC/LIVE]. All examples are whole rupiah. Decimal support and rounding rules are undocumented. Recommendation: treat money as integer rupiah and confirm with backend.
- Percentages: `warningThresholdPct: 20` = 20% (number) [DOC].

### 1.7 Idempotency [DOC]

- Every POST that mutates data **requires** the `Idempotency-Key` header, 8-100 chars (the collection uses a GUID). Send a new key per user intent and reuse it on retry.
- Same key + same body → the first response is replayed, with response header `Idempotent-Replayed: true`.
- Same key + different body → `422 IDEMPOTENCY_KEY_REUSED`.
- The collection **omits** the header on several POSTs (block/unblock/override user, upload attachments) and on all PATCH/DELETE requests. See discrepancies.

### 1.8 Attachments [DOC]

- Multipart field name `attachments` (repeatable). Allowed: jpg/png/pdf, max 10 MB each, **max 5 per document** (a total, not per upload).
- In multipart requests, `lines` is sent as a **JSON string**, and `submit` as the text `"true"`/`"false"`.
- Files are private. Get a signed URL valid for 10 minutes, then open it **without** the bearer token.

---

## 2. Endpoints

`IK` = requires the `Idempotency-Key` header. "Who" = permission plus SoD rules from the descriptions.

### 2.1 Fund (`JP-PC`)

#### GET `/funds`: List funds [LIVE]

- Query: `page`, `limit` (1-100), `status` = `ACTIVE | INACTIVE | CLOSED` (single value, validated), `search` (code/name, may be empty), `sortBy`.
- Who: any petty-cash menu (read).
- Response [LIVE]: pagination envelope; `results` was `[]`.
- Errors [LIVE]: 400 for an invalid or empty status, or limit > 100.

#### POST `/funds`: Create fund (IK)

- Who: Create `JP-PC`.
- Body [DOC]:

| Field                                         | Type            | Req                                  | Notes                                                                                                                                                                                 |
| --------------------------------------------- | --------------- | ------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| code                                          | string          | yes [INFERRED]                       | e.g. `PC-HQ`                                                                                                                                                                          |
| name                                          | string          | yes [INFERRED]                       |                                                                                                                                                                                       |
| accountId                                     | ObjectId        | yes                                  | petty-cash GL account (from `lookups.bankAccounts`)                                                                                                                                   |
| pagu                                          | number          | yes                                  | imprest ceiling                                                                                                                                                                       |
| custodianId                                   | ObjectId (user) | yes [INFERRED]                       | from `lookups.users`                                                                                                                                                                  |
| fundingBankAccountId                          | ObjectId        | optional                             | when set: journal **Dr petty cash / Cr bank** = pagu, and the petty-cash account balance must be 0. When omitted: the account balance must already equal pagu (take-over), no journal |
| fundingDate                                   | YYYY-MM-DD      | with fundingBankAccountId [INFERRED] |                                                                                                                                                                                       |
| warningThresholdPct                           | number (%)      | optional                             | low-balance warning                                                                                                                                                                   |
| voucherApprovalThreshold                      | number          | optional                             | voucher total ≥ this → PENDING_APPROVAL                                                                                                                                               |
| attachmentRequiredThreshold                   | number          | optional                             | voucher needs an attachment above this [INFERRED]                                                                                                                                     |
| requireCountBeforeReimbursement               | boolean         | optional                             |                                                                                                                                                                                       |
| requireWitness                                | boolean         | optional                             | opname needs a witness                                                                                                                                                                |
| singleUserOverride                            | boolean         | optional                             | presumably relaxes SoD for single-user sites. Undocumented                                                                                                                            |
| advanceMaxAmount                              | number          | optional                             | per-request kasbon cap (`ADVANCE_LIMIT_EXCEEDED`)                                                                                                                                     |
| advanceApprovalThreshold                      | number          | optional                             | 0 in the example. Meaning (0 = always approve?) is undocumented                                                                                                                       |
| advanceSettlementDays                         | integer         | optional                             | days to settle after disbursement (`dueAt`)                                                                                                                                           |
| advanceExcludeSaturday / advanceExcludeSunday | boolean         | optional                             | skip weekend days when computing `dueAt`                                                                                                                                              |

- State: → fund `ACTIVE` [INFERRED].
- Errors: `DEFAULT_ACCOUNT_NOT_CONFIGURED`, `PERIOD_LOCKED`, balance-precondition error (code undocumented).

#### GET `/funds/:fundId`: Fund detail

- Live: only the 404 path was observable: `404 { message: "Kas kecil tidak ditemukan", data: { errorCode: "NOT_FOUND" } }`. Invalid id → 400.
- Expected fields [DOC, folder description]: settings above plus `cashBalance`, `availableCash`, `pendingVoucherAmount`, `outstandingAdvanceAmount`, `unsettledVariance`, `replenishmentAmount`, `needsReplenishment` (bool), `isBalanced` (bool).

#### PATCH `/funds/:fundId`: Update fund (no IK in collection)

- Who: Update `JP-PC`.
- Body [DOC]: any settings field, `custodianId` (change is recorded in history), `status` = `ACTIVE | INACTIVE`, `reason` (string). **`pagu` cannot be changed here.**
- State: ACTIVE ↔ INACTIVE.

#### POST `/funds/:fundId/pagu-adjustments`: Adjust pagu (IK)

- Who: Update `JP-PC`.
- Body: `newPagu` (number), `bankAccountId`, `date` (YYYY-MM-DD), `reason`.
- Journal: increase → **Dr petty cash / Cr bank**. Decrease → **Dr bank / Cr petty cash**.
- Errors: **409** when a reimbursement is in progress (errorCode not named).

#### POST `/funds/:fundId/close`: Close fund (IK)

- Who: Delete `JP-PC`.
- Body: `bankAccountId`, `date`, `reason`.
- Journal: pagu returns to bank (**Dr bank / Cr petty cash** [INFERRED]).
- State: → `CLOSED`.
- Errors: `FUND_HAS_OPEN_ITEMS` (open vouchers, kasbon, reimbursement, opname, or unsettled variance).

#### GET `/funds/:fundId/cash-book`: Cash book

- Query: `from`, `to` (YYYY-MM-DD; omit rather than send empty), `page`, `limit`.
- Response [DOC]: `openingBalance`, `closingBalance`, entries `{ seq, txnDate, type, direction, amount, runningBalance }`. Pagination wrapper shape not observed.
- Entry `type` values mentioned: `REPLENISHMENT`, `ADVANCE_RETURN`, `ADVANCE_EXTRA` [DOC]. Others are likely voucher spend, kasbon disbursement, opname adjustment, pagu adjustment, funding and close, but are **undocumented**. `direction` values undocumented (IN/OUT?).
- Live: 404 NOT_FOUND for a nonexistent fund. 400 when `from=` is empty.

#### GET `/lookups`: Form lookups [LIVE]

- Who: any petty-cash menu.

```json
{
  "code": 200,
  "message": "Get petty cash lookups success",
  "data": {
    "expenseAccounts": [
      { "id": "6acf271a97cb3015c8665099", "accountNumber": "5-10000", "name": "Beban Langsung" }
    ],
    "bankAccounts": [
      { "id": "6acf271a97cb3015c866500d", "accountNumber": "1-10000", "name": "Kas dan Setara Kas" }
    ],
    "taxes": [],
    "tags": [{ "id": "6ad9edc2e683d1cc8904b540", "name": "Fitout", "color": "#3B82F6" }],
    "users": [
      { "id": "6acf27a197cb3015c8665131", "name": "Finance", "email": "finance2@proapps.id" }
    ]
  }
}
```

- `taxes` items: `{ id, name, rate }` [DOC]. Not observed (empty).
- `bankAccounts` = Kas & Bank accounts **excluding accounts already used by an active fund**. The same list serves "funding bank" and "account for a new fund".
- Not paginated. The full arrays are returned (72 expense accounts).

### 2.2 Voucher / BPKK (`JP-PC-VCH`)

No journal is posted until reimbursement.

#### GET `/vouchers`: List

- Query: `fundId`, `status` (comma-separated, from `DRAFT, PENDING_APPROVAL, PENDING_REIMBURSE, IN_REIMBURSEMENT, REIMBURSED, REJECTED, VOID`), `from`, `to`, `search`, `page`, `limit`, `sortBy`.
- Live: 200 with empty results. **`status=FOO` is accepted (200, no validation)**, unlike funds.

#### POST `/vouchers`: Create (IK). JSON or multipart.

- Who: Create `JP-PC-VCH`, **fund custodian only** (`NOT_CUSTODIAN`).
- Body:

| Field            | Type           | Req                 | Notes                                                                                                                                                                                                                       |
| ---------------- | -------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fundId           | ObjectId       | yes                 |                                                                                                                                                                                                                             |
| date             | YYYY-MM-DD     | yes                 |                                                                                                                                                                                                                             |
| beneficiary      | string         | yes [INFERRED]      |                                                                                                                                                                                                                             |
| receiptNumber    | string         | optional [INFERRED] | duplicates produce warning `DUPLICATE_RECEIPT_NUMBER`                                                                                                                                                                       |
| description      | string         |                     |                                                                                                                                                                                                                             |
| taxInvoiceNumber | string \| null | optional            |                                                                                                                                                                                                                             |
| vendorTaxId      | string \| null | optional            | vendor NPWP                                                                                                                                                                                                                 |
| lines[]          | array          | yes, ≥1 [INFERRED]  | `{ expenseAccountId, description, amount: number, taxId? }`. Per-line `taxId` is allowed **only when `taxInvoiceNumber` is set**. Per-line `tagIds` is not in the body even though reports group by tag (see discrepancies) |
| submit           | boolean        | optional            | `true` submits immediately                                                                                                                                                                                                  |
| attachments      | file[]         | multipart only      |                                                                                                                                                                                                                             |

- State: `submit:false` → `DRAFT`. `submit:true` → `PENDING_APPROVAL` if total ≥ `voucherApprovalThreshold`, else `PENDING_REIMBURSE` (physical cash decreases).
- Response: includes `warnings` (array, e.g. `DUPLICATE_RECEIPT_NUMBER`). The exact shape (string[] or objects) is undocumented.
- Errors: `NOT_CUSTODIAN`, `PETTY_CASH_INSUFFICIENT_BALANCE`, `PERIOD_LOCKED`, attachment required (above `attachmentRequiredThreshold`, code undocumented).

#### GET `/vouchers/:voucherId`: Detail

- Live: 404 `"Voucher tidak ditemukan"` / `NOT_FOUND`.

#### PATCH `/vouchers/:voucherId`: Update

- Only `DRAFT` or `REJECTED`. A rejected voucher being edited goes back to DRAFT. Same body as create (no `fundId`), plus `submit`.

#### POST `/vouchers/:voucherId/submit` (IK, no body)

- DRAFT → PENDING_APPROVAL | PENDING_REIMBURSE (threshold rule).

#### POST `/vouchers/:voucherId/approve` (IK, no body)

- Who: Update `JP-PC-APR`. Approver ≠ creator (`SOD_VIOLATION`).
- PENDING_APPROVAL → PENDING_REIMBURSE.

#### POST `/vouchers/:voucherId/reject` (IK)

- Body `{ reason }`. PENDING_APPROVAL → REJECTED [INFERRED].

#### POST `/vouchers/:voucherId/void` (IK)

- Who: Delete `JP-PC-VCH`. Body `{ reason }`.
- Only `PENDING_APPROVAL` / `PENDING_REIMBURSE`, and **not for vouchers sourced from a kasbon** (source `ADVANCE`).
- → VOID.

#### POST `/vouchers/:voucherId/attachments`: Upload (multipart, no IK in collection)

- Allowed on DRAFT, REJECTED, PENDING_APPROVAL, PENDING_REIMBURSE. Not on vouchers from a kasbon. Max 5 total.

#### DELETE `/vouchers/:voucherId/attachments/:attachmentId`

- Only DRAFT/REJECTED.

### 2.3 Attachment

#### GET `/attachments/:attachmentId/url`

- Response [DOC]: `{ url: "/v1/petty-cash/attachments/:id/file?expires=..&signature=..", expiresAt }`. `url` is **relative**: prefix it with the API base.
- Live: 404 `"Lampiran tidak ditemukan"` / `NOT_FOUND`.

#### GET `/attachments/:attachmentId/file?expires=&signature=`

- Public (no bearer). Invalid or expired HMAC → 403. Missing params → 400 [LIVE].

### 2.4 Opname / cash count (`JP-PC-CNT`, approval `JP-PC-APR`)

The server computes the counted total, expected cash, and variance (negative = shortage).

#### GET `/counts`

- Query: `fundId`, `status`, `from`, `to`, `page`, `limit`. `search` is **not allowed** (400). `status` is not validated (FOO → 200).

#### POST `/counts`: Create (IK)

- Who: Create `JP-PC-CNT`. The counter is the logged-in user.
- Body:

| Field         | Type            | Req                               | Notes                                                                                                                                                                                                                               |
| ------------- | --------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| fundId        | ObjectId        | yes                               |                                                                                                                                                                                                                                     |
| witnessedBy   | ObjectId (user) | required if fund `requireWitness` | counter and witness must both be non-custodian and different people                                                                                                                                                                 |
| denominations | object          | yes                               | keys are **string** denominations: `"100000","50000","20000","10000","5000","2000","1000"` → integer pieces; plus `coins: { "1000","500","200","100" }`. Whether other keys (e.g. 75000 commemorative) are accepted is undocumented |
| reason        | string          | required when variance ≠ 0        |                                                                                                                                                                                                                                     |
| countedAt     | ISO datetime    | optional                          | default now                                                                                                                                                                                                                         |
| submit        | boolean         | optional                          |                                                                                                                                                                                                                                     |

- State: `submit:false` → draft [INFERRED status `DRAFT`]. `submit:true` → submitted/awaiting approval [INFERRED `PENDING_APPROVAL` or `SUBMITTED`].

#### GET `/counts/:countId`: Detail

- Includes `isStale` (bool): a cash transaction occurred after the count.
- Live: 404 `"Opname tidak ditemukan"`.

#### POST `/counts/:countId/submit` (IK)

- Body `{ reason }` (needed when there is a variance).

#### POST `/counts/:countId/approve` (IK)

- Who: Update `JP-PC-APR`. Must not be the custodian or the counter.
- The previous approved count → `SUPERSEDED`. The cash book is adjusted to physical cash. **No journal** (the variance is journaled at reimbursement disbursement).
- → APPROVED [INFERRED].

#### POST `/counts/:countId/reject` (IK)

- Body `{ reason }` → REJECTED [INFERRED].

Later: reimbursement disbursement moves the count → `SETTLED` [DOC].

### 2.5 Reimbursement (`JP-PC-RMB`, approval `JP-PC-APR`, disburse `JP-PC-DSB`)

Amount = voucher total + shortage - overage (server-computed).

#### POST `/reimbursements/preview` (no IK, saves nothing)

- Body: `fundId`, `voucherIds[]`, `bankAccountId`, `countId` (optional unless `requireCountBeforeReimbursement`), `disbursementDate` (YYYY-MM-DD).
- Response [DOC]: `voucherTotal`, `varianceAmount`, `totalAmount`, `expenseBreakdown`, `taxBreakdown`, `journalPreview`, `isBalanced`, `cashAfterDisbursement`, `warnings`. Sub-shapes are undocumented.
- Note: preview is a POST. It was not called live (GET-only rule).

#### POST `/reimbursements`: Create (IK)

- Body: `fundId`, `voucherIds[]`, `bankAccountId`, `countId`, `notes`. **There is no `disbursementDate` here**, unlike preview.
- Rules: one active reimbursement per fund. An approved count is required when `requireCountBeforeReimbursement` is set.
- State: vouchers PENDING_REIMBURSE → IN_REIMBURSEMENT. The reimbursement goes to awaiting approval [INFERRED `PENDING_APPROVAL`].

#### GET `/reimbursements`

- Query: `fundId`, `status`, `from`, `to`, `page`, `limit`. `status` is not validated.

#### GET `/reimbursements/:reimbursementId`

- Live: 404 `"Reimbursement tidak ditemukan"`.

#### POST `/reimbursements/:id/approve` (IK)

- Approver ≠ submitter (`SOD_VIOLATION`). → APPROVED [INFERRED].

#### POST `/reimbursements/:id/reject` (IK)

- Body `{ reason }`. Vouchers go back to PENDING_REIMBURSE. → REJECTED [INFERRED].

#### POST `/reimbursements/:id/cancel` (IK)

- Delete `JP-PC-RMB`. Body `{ reason }`. Only before disbursement. Vouchers → PENDING_REIMBURSE. → CANCELLED [INFERRED].

#### POST `/reimbursements/:id/disburse` (IK)

- Who: Update `JP-PC-DSB`. **Disburser ≠ submitter ≠ approver.**
- Body: `disbursementDate` (YYYY-MM-DD), `bankAccountId` (optional override, audited).
- One transaction:
  - Journal `sourceType: PETTY_CASH_REIMBURSEMENT` (shows up in bank reconciliation).
  - Vouchers → REIMBURSED.
  - Count → SETTLED.
  - Cash book entry `REPLENISHMENT`.
- Response includes `cashBalanceAfter`.
- → DISBURSED [INFERRED].
- Journal [INFERRED from imprest accounting + preview fields]: Dr expense accounts per voucher line, Dr input tax (taxBreakdown), Dr `petty_cash_variance` for a shortage (Cr for an overage), Cr bank = totalAmount.

### 2.6 Kasbon / staff advance

Menus: `JP-PC-ADV` (staff), `JP-PC-CST` (custodian), `JP-PC-APR` (Finance), `JP-PC-CTL` (control).

#### GET `/advances`

- Query: `fundId`, `requesterId`, `status`, `overdue` (boolean, validated), `from`, `to`, `search`, `page`, `limit`.
- Users who have only `JP-PC-ADV` see only their own kasbon (server-side filter).
- Items include `outstandingAmount`, `isOverdue` [DOC].
- `status` not validated.

#### POST `/advances`: Create (IK)

- Who: Create `JP-PC-ADV`.
- Body: `fundId`, `amount` (number), `purpose` (string).
- Errors: `PETTY_CASH_USER_BLOCKED` (manual block, or an overdue kasbon in any fund), `ADVANCE_LIMIT_EXCEEDED`, `PETTY_CASH_INSUFFICIENT_BALANCE`.
- State: → awaiting approval [INFERRED `PENDING_APPROVAL`]. It may auto-approve below `advanceApprovalThreshold` [INFERRED].

#### GET `/advances/:advanceId`

- Includes `statusHistory` (timeline), `settlement`, `attachments`, `dueAt`, `outstandingAmount` [DOC].
- Live: 404 `"Kasbon tidak ditemukan"`.

#### POST `/advances/:id/approve` (IK)

- Update `JP-PC-APR`. Body `{ amount?: number (≤ requested), note? }`. → APPROVED [INFERRED].

#### POST `/advances/:id/reject` (IK)

- Body `{ reason }` → REJECTED.

#### POST `/advances/:id/cancel` (IK)

- Delete `JP-PC-ADV`, **requester only**, before the cash is handed over. Body `{ reason }` → CANCELLED [INFERRED].

#### POST `/advances/:id/disburse` (IK, no body)

- Update `JP-PC-CST`, **fund custodian only, and not for their own kasbon**.
- `dueAt` = now + `advanceSettlementDays` (skipping Sat/Sun per fund settings).
- → `DISBURSED` [DOC]. The cash book decreases [INFERRED].

#### POST `/advances/:id/attachments`: Upload receipts (multipart)

- Requester only. While `DISBURSED` or `SETTLEMENT_SUBMITTED`.

#### POST `/advances/:id/settlement`: Submit settlement (IK). JSON or multipart.

- Create `JP-PC-ADV`, requester only, only while `DISBURSED`.
- Body: `date` (YYYY-MM-DD), `beneficiary`, `description`, `receiptNumber`, `lines[]` `{ description, amount: number, expenseAccountId?: ObjectId | null | "" }`.
- `lines: []` = nothing spent, everything returned.
- Receipts must already be uploaded if total > 0 (or use multipart with `attachments`).
- → `SETTLEMENT_SUBMITTED`.

#### PATCH `/advances/:id/settlement-accounts`: Set expense accounts per line

- Update `JP-PC-CST` or `JP-PC-APR`. Body `{ lines: [ { lineNo: integer (1-based), expenseAccountId } ] }`.
- Only while `SETTLEMENT_SUBMITTED` or `CUSTODIAN_VERIFIED`.
- The requester may not set accounts on their own kasbon (`SOD_VIOLATION`). Not custodian and no approval right → 403 `NOT_CUSTODIAN`.
- `lineNo` must be unique and exist. The account must be an expense account (`INVALID_EXPENSE_ACCOUNT`).
- Amounts and receipts are unchanged.

#### POST `/advances/:id/custodian-verify` (IK)

- Custodian only. Body `{ note }`.
- Leftover cash → cash book `ADVANCE_RETURN`. Shortfall paid to staff → `ADVANCE_EXTRA`.
- → `CUSTODIAN_VERIFIED`.

#### POST `/advances/:id/custodian-reject` (IK)

- Body `{ reason }` → back to `DISBURSED`. The requester gets a new deadline (never shorter than the original).

#### POST `/advances/:id/finance-verify` (IK)

- Update `JP-PC-APR`. Not the requester and not the custodian verifier.
- Creates a voucher (`source: ADVANCE`) in `PENDING_REIMBURSE`. Kasbon → `SETTLED`.
- Errors: `EXPENSE_ACCOUNT_REQUIRED` while any line lacks an account.

#### POST `/advances/:id/finance-reject` (IK)

- Body `{ reason }`. The target state is **undocumented** (back to SETTLEMENT_SUBMITTED? DISBURSED?).

#### POST `/advances/:id/convert-to-receivable` (IK)

- Update `JP-PC-CTL`. Only `DISBURSED`.
- Body `bankAccountId`, `date`, `reason`.
- Journal **Dr Piutang Karyawan (`petty_cash_employee_receivable`) / Cr Bank** for the outstanding amount. The petty cash is refilled by that amount.
- Resulting status **undocumented** (e.g. `CONVERTED_TO_RECEIVABLE`).

### 2.7 User kasbon block status

#### GET `/advance-status/me` [LIVE]

- Read `JP-PC-ADV`.

```json
{
  "code": 200,
  "message": "Get advance status success",
  "data": {
    "user": { "id": "6acf27a197cb3015c8665131", "name": "Finance", "email": "finance2@proapps.id" },
    "isBlocked": false,
    "reasons": [],
    "restriction": null,
    "openAdvances": [],
    "outstandingAmount": 0
  }
}
```

- `reasons`: array of `MANUAL | OVERDUE`.
- `restriction`: object when a block or override exists. Its shape was not observed (likely `{ blockedAt, blockedBy, reason, overrideUntil, ... }`).

#### GET `/advance-status/:userId` [LIVE]

- Same shape. Read `JP-PC-CTL` / `JP-PC-CST` / `JP-PC-APR`. Unknown user → 404 `"User tidak ditemukan"` / `NOT_FOUND`.

#### POST `/advance-status/:userId/block`

- Update `JP-PC-CTL`. Body `{ reason }`. Audited. Applies across all funds.

#### POST `/advance-status/:userId/unblock`

- Body `{ reason }`. Removes the manual block only. Overdue kasbon still block unless overridden.

#### POST `/advance-status/:userId/override`

- Update `JP-PC-CTL`. Body `{ until: ISO datetime | null, reason }`. `null` revokes the override.

### 2.8 Reports (read `JP-PC`)

#### GET `/reports/pending-vouchers?fundId&asOf` [LIVE]

```json
{ "asOf": "2026-10-31",
  "summary": { "0-7": {"count":0,"amount":0}, "8-14": {...}, "15-30": {...}, ">30": {...} },
  "total": 0, "items": [] }
```

- `asOf` defaults to today. Item shape not observed (voucher + age days + bucket [DOC]).

#### GET `/reports/expense-summary?fundId&from&to&groupBy` [LIVE]

- `groupBy` = `account | tag | month` (validated).

```json
{ "groupBy": "account", "from": null, "to": "2026-10-31", "total": 0, "totalTax": 0, "items": [] }
```

#### GET `/reports/advances-by-user?fundId&requesterId&from&to` [LIVE]

- Read `JP-PC` / `JP-PC-CTL`. `data` is a **bare array** (no envelope), `[]` today.
- Per user [DOC]: total, outstanding, overdue, late upload, receivable, block status. Field names unknown.

#### GET `/reports/reconciliation` [LIVE]

- `data: []` (bare array, one row per fund).
- Per fund [DOC]: GL balance vs pagu, cash book vs cached balance, imprest invariant `isOk`.

#### GET `/period-end-check?date=YYYY-MM-DD` [LIVE]

- `date` is **required** (400 otherwise). Read `JP-PC` / `JP-GL`.

```json
{ "date": "2026-10-31", "hasOpenItems": false, "voucherTotal": 0, "advanceTotal": 0, "funds": [] }
```

#### GET `/audit-logs?entityType&entityId&action&page&limit` [LIVE]

- `entityType` = `FUND | VOUCHER | COUNT | REIMBURSEMENT | ADVANCE | USER_RESTRICTION` (validated).
- `action` values undocumented.
- Pagination envelope, empty today. Item shape not observed.

### 2.9 Related: account mappings (parent collection)

- `GET /v1/settings/account-mappings` [LIVE]: `data` grouped by `ar_ap | fitout | inventory | other | purchase | sales`. Each item is `{ id, site, key, label, group, account: { id, name, accountNumber } | null, isDebit, deleted, createdAt, updatedAt }`.
- Petty-cash keys (group `other`):
  - `petty_cash_variance`: "Selisih Kas (Kas Kecil)", **account null on Demo Site**.
  - `petty_cash_employee_receivable`: "Piutang Karyawan (Kasbon Kas Kecil)" → 1-10205.
  - Probably used: `purchase_tax` (1-10407 PPN Masukan) for voucher tax lines [INFERRED].
- Write endpoints: `POST /v1/settings/account-mappings/seed`, `PUT /v1/settings/account-mappings/:id`, `PUT /v1/settings/account-mappings/batch`. Not called. Body shapes are not in the petty-cash collection.

---

## 3. Data model per entity

**Not observed live; all from docs.**

**Fund**: `id, code, name, accountId (or account{}), pagu, custodianId (or custodian{}), status, warningThresholdPct, voucherApprovalThreshold, attachmentRequiredThreshold, requireCountBeforeReimbursement, requireWitness, singleUserOverride, advanceMaxAmount, advanceApprovalThreshold, advanceSettlementDays, advanceExcludeSaturday, advanceExcludeSunday`, computed balances: `cashBalance, availableCash, pendingVoucherAmount, outstandingAdvanceAmount, unsettledVariance, replenishmentAmount, needsReplenishment, isBalanced`. Custodian history exists ("riwayat dicatat"); its field name is unknown.

**Voucher**: `id, number? (BPKK no.), fundId, date, beneficiary, receiptNumber, description, taxInvoiceNumber, vendorTaxId, lines[{lineNo?, expenseAccountId, description, amount, taxId?, taxAmount?}], total, status, source (ADVANCE | manual?), attachments[], warnings[]`, plus rejection or void reason and audit fields.

**Count (opname)**: `id, fundId, countedBy, witnessedBy, countedAt, denominations, countedTotal, expectedCash, variance (negative = shortage), reason, status, isStale`.

**Reimbursement**: `id, fundId, voucherIds/vouchers, bankAccountId, countId, notes, voucherTotal, varianceAmount, totalAmount, status, disbursementDate, journal ref, cashBalanceAfter (disburse response)`.

**Advance (kasbon)**: `id, fundId, requesterId, amount (requested), approvedAmount?, purpose, status, dueAt, isOverdue, outstandingAmount, statusHistory[], settlement { date, beneficiary, description, receiptNumber, lines[{lineNo, description, amount, expenseAccountId|null}] }, attachments[]`, plus the generated voucher ref.

**Attachment**: `id`, file name/mime/size [INFERRED]. Opened via `/attachments/:id/url`.

**Advance status**: [LIVE] `{ user{id,name,email}, isBlocked, reasons[], restriction, openAdvances[], outstandingAmount }`.

---

## 4. Status enums and state machines

| Entity               | Values                                                                                                                                                                       | Source                                |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Fund                 | `ACTIVE, INACTIVE, CLOSED`                                                                                                                                                   | LIVE (validator)                      |
| Voucher              | `DRAFT, PENDING_APPROVAL, PENDING_REIMBURSE, IN_REIMBURSEMENT, REIMBURSED, REJECTED, VOID`                                                                                   | DOC                                   |
| Count                | mentioned: `SUPERSEDED, SETTLED`. Inferred: `DRAFT, PENDING_APPROVAL/SUBMITTED, APPROVED, REJECTED`                                                                          | DOC + INFERRED, **undocumented list** |
| Reimbursement        | inferred: `PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, DISBURSED`                                                                                                       | **undocumented**                      |
| Advance              | mentioned: `DISBURSED, SETTLEMENT_SUBMITTED, CUSTODIAN_VERIFIED, SETTLED`. Inferred: `PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED`, plus a converted-to-receivable state | partly DOC                            |
| User block reason    | `MANUAL, OVERDUE`                                                                                                                                                            | DOC                                   |
| Audit entityType     | `FUND, VOUCHER, COUNT, REIMBURSEMENT, ADVANCE, USER_RESTRICTION`                                                                                                             | LIVE (validator)                      |
| Cash-book entry type | mentioned: `REPLENISHMENT, ADVANCE_RETURN, ADVANCE_EXTRA`                                                                                                                    | DOC (partial)                         |
| Voucher source       | `ADVANCE` (others unnamed)                                                                                                                                                   | DOC                                   |
| Journal sourceType   | `PETTY_CASH_REIMBURSEMENT` (others unnamed)                                                                                                                                  | DOC                                   |

**Fund**

```
(create) → ACTIVE ⇄ INACTIVE   (PATCH status)
ACTIVE|INACTIVE → CLOSED        (POST close; FUND_HAS_OPEN_ITEMS if open items)
```

**Voucher**

```
create submit:false        → DRAFT
create submit:true / submit: total ≥ voucherApprovalThreshold → PENDING_APPROVAL
                             else                             → PENDING_REIMBURSE
PENDING_APPROVAL --approve--> PENDING_REIMBURSE
PENDING_APPROVAL --reject---> REJECTED --PATCH--> DRAFT
PENDING_APPROVAL|PENDING_REIMBURSE --void--> VOID          (not for source ADVANCE)
PENDING_REIMBURSE --reimbursement create--> IN_REIMBURSEMENT
IN_REIMBURSEMENT --rmb reject/cancel--> PENDING_REIMBURSE
IN_REIMBURSEMENT --rmb disburse--> REIMBURSED
kasbon finance-verify --> new voucher (source ADVANCE) in PENDING_REIMBURSE
```

**Count**

```
create submit:false → (draft) --submit--> (pending) --approve--> APPROVED --(rmb disburse)--> SETTLED
                                             └--reject--> REJECTED
previous APPROVED count → SUPERSEDED when a new count is approved
```

**Reimbursement**

```
create → (pending approval) --approve--> (approved) --disburse--> (disbursed)
              ├--reject--> (rejected)
              └--cancel--> (cancelled)   [cancel also allowed after approve, before disburse]
```

**Advance**

```
create → (pending approval) --approve(amount?)--> APPROVED --disburse (custodian)--> DISBURSED
   ├--reject--> REJECTED
   └--cancel (requester, before disburse)--> CANCELLED
DISBURSED --settlement--> SETTLEMENT_SUBMITTED --custodian-verify--> CUSTODIAN_VERIFIED --finance-verify--> SETTLED
SETTLEMENT_SUBMITTED --custodian-reject--> DISBURSED (new dueAt)
CUSTODIAN_VERIFIED --finance-reject--> ? (undocumented)
DISBURSED --convert-to-receivable--> ? (undocumented terminal state)
overdue = DISBURSED and now > dueAt → user blocked (reason OVERDUE) in all funds
```

**SoD matrix [DOC]**

- Voucher: creator = custodian. Approver ≠ creator.
- Count: counter and witness are both non-custodian and different people. Approver ≠ custodian and ≠ counter.
- Reimbursement: submitter ≠ approver ≠ disburser.
- Kasbon: the disbursing custodian ≠ requester. The finance verifier ≠ requester and ≠ custodian verifier. The requester cannot set their own settlement accounts.
- `singleUserOverride` on the fund presumably relaxes these rules. Undocumented.

---

## 5. Journals and account mappings

| Action                                  | Debit                                                                  | Credit                                              | Source                                                                    |
| --------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| Create fund with `fundingBankAccountId` | Petty-cash account (pagu)                                              | Funding bank                                        | DOC                                                                       |
| Create fund without funding bank        | (no journal; the account balance must already = pagu)                  |                                                     | DOC                                                                       |
| Pagu increase                           | Petty cash                                                             | Bank                                                | DOC                                                                       |
| Pagu decrease                           | Bank                                                                   | Petty cash                                          | DOC                                                                       |
| Close fund                              | Bank                                                                   | Petty cash (remaining pagu)                         | DOC (direction inferred)                                                  |
| Voucher create/approve                  | none                                                                   |                                                     | DOC                                                                       |
| Opname approve                          | none (cash book only)                                                  |                                                     | DOC                                                                       |
| Reimbursement disburse                  | Expense accounts (+ input tax, + `petty_cash_variance` for a shortage) | Bank (+ `petty_cash_variance` for an overage)       | DOC for existence (`sourceType PETTY_CASH_REIMBURSEMENT`). Lines INFERRED |
| Kasbon disburse / return / extra        | none (cash book entries only)                                          |                                                     | INFERRED                                                                  |
| Convert kasbon to receivable            | `petty_cash_employee_receivable`                                       | Bank (refills petty cash by the outstanding amount) | DOC                                                                       |

Mapping keys: `petty_cash_variance`, `petty_cash_employee_receivable`. Missing mapping → `DEFAULT_ACCOUNT_NOT_CONFIGURED`.

---

## 6. Error codes

| Code / status                            | When                                                                                      | Source |
| ---------------------------------------- | ----------------------------------------------------------------------------------------- | ------ |
| 400 (no errorCode, `data` = field array) | Joi validation: bad enum, empty param, unknown param, bad ObjectId, bad date, limit range | LIVE   |
| 401 "Please authenticate" (no `data`)    | missing or expired token                                                                  | LIVE   |
| 403                                      | attachment signed URL invalid or expired                                                  | DOC    |
| `NOT_FOUND` (404)                        | fund/voucher/count/reimbursement/advance/attachment/user missing                          | LIVE   |
| `IDEMPOTENCY_KEY_REUSED` (422)           | same key, different body                                                                  | DOC    |
| `PETTY_CASH_INSUFFICIENT_BALANCE`        | voucher/kasbon exceeds available cash                                                     | DOC    |
| `SOD_VIOLATION`                          | segregation-of-duties breach                                                              | DOC    |
| `NOT_CUSTODIAN` (403)                    | custodian-only action by a non-custodian                                                  | DOC    |
| `PETTY_CASH_USER_BLOCKED`                | kasbon create by a blocked user                                                           | DOC    |
| `PERIOD_LOCKED`                          | date ≤ lock date                                                                          | DOC    |
| `DEFAULT_ACCOUNT_NOT_CONFIGURED`         | required account mapping missing                                                          | DOC    |
| `FUND_HAS_OPEN_ITEMS`                    | close fund with open items                                                                | DOC    |
| `ADVANCE_LIMIT_EXCEEDED`                 | kasbon amount > `advanceMaxAmount`                                                        | DOC    |
| `INVALID_EXPENSE_ACCOUNT`                | non-expense account on settlement lines                                                   | DOC    |
| `EXPENSE_ACCOUNT_REQUIRED`               | finance-verify with lines missing an account                                              | DOC    |
| 409 (code unnamed)                       | pagu adjustment while a reimbursement is active                                           | DOC    |
| Warning `DUPLICATE_RECEIPT_NUMBER`       | in `warnings` of a voucher create response (not an error)                                 | DOC    |

Likely to exist but not named in the docs: invalid-status-transition, active-reimbursement-exists, count-required, witness-required, reason-required, attachment-required, attachment-limit, file-type/size. Ask the backend for the codes.

---

## 7. Discrepancies, gaps and risks

1. **No example responses in the collection.** All 62 requests have zero saved examples, and the live site has zero funds, so no entity shape can be verified. Ask the backend to add examples, or seed a test fund.
2. **The collection's own URLs fail live.** `List Vouchers`, `List Opname`, `List Reimbursements`, `List Kasbon`, `Cash Book`, `Expense Summary`, `Pending Vouchers`, `Advances by User` and `Audit Logs` all ship with empty params (`fundId=&status=&from=...`). The backend rejects empty values with 400. Only `search=` may be empty.
3. **Inconsistent status validation.** `GET /funds?status=FOO` → 400 (validated enum), but `/vouchers`, `/counts`, `/reimbursements` and `/advances` accept `status=FOO` with 200 and an empty result. A typo silently returns nothing.
4. **Status enums undocumented** for opname, reimbursement and kasbon. Only fragments appear in descriptions (SUPERSEDED, SETTLED, DISBURSED, SETTLEMENT_SUBMITTED, CUSTODIAN_VERIFIED). The kasbon states after `finance-reject` and `convert-to-receivable` are unknown.
5. **The Idempotency-Key rule conflicts with the collection.** "Every mutating POST requires it", yet these POSTs have no header in the collection: `advance-status/:id/block`, `/unblock`, `/override`, `vouchers/:id/attachments`, `advances/:id/attachments`. Either they are exempt or the collection requests fail. Also unclear whether PATCH/DELETE (`Update Fund`, `Update Voucher`, `Set Settlement Accounts`, `Delete Voucher Attachment`) need it.
6. **Stack traces leak in production responses.** Every error includes `stack` with server paths (`/app/src/modules/pettyCash/...`). This is a security/hygiene issue. The frontend must never display it.
7. **Two error-envelope shapes.** For validation errors `data` is an array of `{field, message}`. For domain errors it is an object `{errorCode}`. Validation messages are English Joi text, domain messages are Indonesian. Also cosmetic: `"\"fundId\"\" must be a valid mongo id"` has doubled quotes.
8. **401 has no `data.errorCode`**, so a generic handler keyed on `errorCode` will miss it.
9. **Inconsistent report envelopes.** `advances-by-user` and `reconciliation` return a bare array in `data`. `pending-vouchers`, `expense-summary` and `period-end-check` return objects. Audit logs and lists use the paginated envelope.
10. **`petty_cash_variance` is unmapped on Demo Site** (`account: null`). Any reimbursement with an opname variance will likely fail `DEFAULT_ACCOUNT_NOT_CONFIGURED`. The collection's quick-start step 2 says to map it, but that hasn't been done.
11. **Single-user site.** `lookups.users` returns one user. Custodian ≠ approver, witness rules and disburser ≠ submitter can't be satisfied, so most flows can't be demoed end to end on this site without more users (or `singleUserOverride`, which is undocumented).
12. **`taxes` lookup is empty.** Per-line `taxId` can't be tested here.
13. **Tag gap.** `expense-summary` supports `groupBy=tag` and lookups return `tags`, but no voucher or settlement line body carries a `tagIds`/`tags` field. How tags are attached is undocumented.
14. **Preview vs create mismatch.** `reimbursements/preview` takes `disbursementDate`. `reimbursements` (create) does not; the date is given only at disburse. So the preview journal date may differ from the actual one.
15. **Money format unstated.** Examples are integer numbers. Decimal handling, rounding and max values are undocumented.
16. **Timezone unstated.** Date-only fields are fine, but `until` in the override example is `16:59:59Z` (WIB end of day), so the client must convert. `dueAt` weekend skipping depends on a server TZ that isn't documented.
17. **Ambiguous settings.** The semantics of `advanceApprovalThreshold: 0` (always approve? never?), `singleUserOverride`, and `attachmentRequiredThreshold` enforcement (error code?) are undocumented.
18. **Denomination keys** are strings in a nested object with a separate `coins` map that reuses key `"1000"` (note vs coin). Whether other denominations (e.g. `"75000"`) are accepted or rejected is unknown.
19. **The `warnings` shape is unknown** (string codes or `{code, message}` objects) for voucher create and reimbursement preview.
20. **Lookup `bankAccounts` doubles as the petty-cash account picker.** Both "Kas Kecil" GL accounts (1-10001, 1-10002) appear alongside real banks. 1-10001 is also mapped as `default_deposit_account` and `fitout_refund_account`. Making it a fund account could collide with those flows (accounting risk, not an API bug).
21. **Missing endpoints a UI will need.** There is no list of custodian history, no endpoint for "funds where I am custodian", no voucher-number lookup, and no export (PDF/Excel) for BPKK or reports. The audit-log `action` values are undocumented.
22. **Signed URL is relative.** The frontend must prefix the API base URL.
23. **Access token TTL is 30 min.** Long multi-step forms (opname, settlement uploads) need refresh handling.

---

## 8. Sample files

The `scratchpad/api-samples/` folder holds one JSON file per call, tokens redacted. Files:

- Auth and lists: `auth-login.json`, `funds-list*.json`, `vouchers-*.json`, `counts-*.json`, `reimbursements-*.json`, `advances-*.json`
- Error paths: `*-404.json`, `*-badid.json`, `*-badstatus.json`, `*-empty*.json`, `funds-noauth.json`
- Lookups and status: `lookups.json` (full), `advance-status-*.json`
- Reports: `report-*.json`, `period-end-check*.json`, `audit-logs*.json`
- Settings: `account-mappings.json`
