> Observed on the Jurnal ProApps **Demo Site** on 2026-10-31 by running every flow with five test users. Token-free. The seeded users, roles, fund and documents are test data prefixed "TEST PC". Endpoint paths, queries and bodies are in [`API-CONTRACT.md`](API-CONTRACT.md).

# Kas Kecil + Kasbon: REAL shapes and behavior (observed 2026-10-31, Demo Site)

Everything below was observed from real calls. Raw responses (tokens never saved) are in
`(raw samples not committed)`
(each file: `{as, request{method,path,body,form,idempotencyKey}, status, response}`). Mutation log and cleanup list: `.../scratchpad/seed-log.md`.
Steps in file names: 01 mapping, 02 roles/users, 03 tax, 04 fund create, 05a vouchers, 05b counts, 05c reimbursements, 05d kasbon, 05e reads/reports, 06 final snapshots.

Not exercised: pagu adjustment, close fund, a count with OVER variance, second fund, overdue (time-based) block, `ADVANCE_EXTRA` cash-book entry, `PERIOD_LOCKED`, `DEFAULT_ACCOUNT_NOT_CONFIGURED` (mapping was set first), `FUND_HAS_OPEN_ITEMS`.

## 0. General conventions (real)

- Success envelope `{code, message, data}`. `message` is Indonesian. Created = 201, actions = 200.
- Lists: `data = {results[], page, limit, totalPages, totalResults}`. Cash book also has `fund{id,code,name}`, `openingBalance`, `closingBalance` (overall, not per page) beside `results`.
- **Money = JSON integers (whole rupiah)** everywhere (`pagu`, `amount`, `taxAmount`, `cashBalance`, variances). Only `availableCashRatio` is a float (`91.5`, percent). `tax.rate` integer (11). Variance is signed (negative = SHORT).
- Dates: requests take `YYYY-MM-DD`. Responses give accounting dates as ISO datetime at UTC midnight (`"2026-10-31T00:00:00.000Z"`, fields `transactionDate`, `requestDate`, `disbursementDate`), timestamps as ISO UTC ms (`createdAt`, `submittedAt`...). Reports echo `asOf/from/to` as `YYYY-MM-DD`. `dueAt` = end of local WIB day in UTC (`2026-11-06T16:59:59.999Z`).
- Ids: 24-hex strings. Related users appear as `{id,name,email}`; `fund` as `{id,code,name,custodian:<userId string>}`; `site` is a bare id string.
- Document numbers: voucher `PCV/YYYYMM/NNNN`, count `PCO/...`, reimbursement `PCR/...`, kasbon `PCA/...` (sequences per site/month, burned by rolled-back attempts, so gaps can occur).
- Soft-delete flag `deleted:false` is present in every entity.
- `access-role` and `users` endpoints return the bare object (no `{code,message,data}` envelope) and 201 for users, 200 for roles.
- Idempotency: a POST without `Idempotency-Key` gives `400 {code,message:"Header Idempotency-Key wajib diisi"}` (no `data`). Same key + same body replays the first response with header `idempotent-replayed: true` (status 201 again, same id). Same key + different body: `422 IDEMPOTENCY_KEY_REUSED` ("Idempotency-Key sudah dipakai untuk permintaan yang berbeda"). PATCH, DELETE, attachment uploads and block/unblock/override worked without a key. See `05a-post-idempotency-tests.json`.
- Errors still include a `stack` field with server paths.

## 1. Entities

### Fund (`GET /funds`, `/funds/:id`, create response; list items have the same fields)
| field | type | example |
|---|---|---|
| id, site | string | |
| code, name | string | `PC-HQ`, `TEST PC Kas Kecil Kantor Pusat` |
| account | `{id,name,accountNumber}` | `1-10002 Kas Kecil Kasir` |
| accountLockKey | string (= account id) | |
| pagu | integer | 5000000 |
| custodian | `{id,name,email}` | |
| custodianHistory[] | `{custodian:id, from:ISO, changedBy:id}` | |
| warningThresholdPct | integer | 20 |
| voucherApprovalThreshold | integer | 1000000 |
| attachmentRequiredThreshold | integer | 100000 |
| requireCountBeforeReimbursement, requireWitness, singleUserOverride | boolean | |
| advanceMaxAmount, advanceApprovalThreshold, advanceSettlementDays | integer | 2000000, 0, 5 |
| advanceExcludeSaturday/Sunday | boolean | |
| status | `ACTIVE` (INACTIVE/CLOSED per validator, not exercised) | |
| closedAt | ISO or null | |
| cashBalance | integer | 4575000 |
| lastSeq, lockVersion | integer | 17, 69 (internal) |
| createdBy, updatedBy | user id string / null | |
| createdAt, updatedAt | ISO | |
| computed: availableCash, reservedAmount, pendingVoucherAmount, outstandingAdvanceAmount, unsettledVariance, replenishmentAmount | integer | |
| computed: availableCashRatio | float percent | 91.5 |
| computed: needsReplenishment, isBalanced | boolean | |
| lastCountAt | ISO or null | |

Semantics: `cashBalance` = physical cash by the cash book. `pendingVoucherAmount` = vouchers PENDING_REIMBURSE (+IN_REIMBURSEMENT). `replenishmentAmount` = pending vouchers + shortage (`-unsettledVariance`). Imprest identity held after every step: `pagu = cashBalance + pendingVoucherAmount + outstandingAdvanceAmount - unsettledVariance` (`isBalanced:true`).
`PATCH /funds/:id` accepts a partial body (no name needed) plus `reason`, returns the full fund.

### Voucher (detail; list items have the same fields minus `attachments` and `warnings`)
`id, site, fund{id,code,name,custodian}, voucherNumber, source ("DIRECT" | "ADVANCE"), advance (null or id), transactionDate, beneficiary, description, receiptNumber, taxInvoiceNumber, vendorTaxId, lines[], totalAmount, status, requestedBy{id,name,email}, submittedAt, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectedReason, voidedBy, voidedAt, voidReason, reimbursement (id or null), updatedBy, deleted, createdAt, updatedAt, attachments[], warnings[]`.
- Line: `{lineNo:int(1-based), expenseAccount:{id,name,accountNumber}, description, amount:int (net, before tax), tax:{id,name,rate}|null, taxAmount:int, tags:[]}`. `tags` is always `[]` (no way to set tags found).
- **`totalAmount` = sum(amount) + sum(taxAmount)** (tax is exclusive). Example: lines 100,000 (+PPN 11%) and 50,000 -> taxAmount 11,000, totalAmount 161,000.
- Attachment: `{id, site, ownerType:"VOUCHER"|"ADVANCE", ownerId, fileName, mimeType, sizeBytes:int, uploadedBy:id, deleted, createdAt, updatedAt}`.
- Warning: `{code:"DUPLICATE_RECEIPT_NUMBER", message:"Nomor struk sama dengan voucher PCV/202610/0001"}` in `data.warnings[]` of the create response (duplicate still saved). `warnings` is `[]` when none. Computed on read: the detail GET of voucher A later also carried a warning (pointing at the later duplicate PCV/202610/0006) and the original create response of A had `[]`. List items omit `warnings`.
- `PATCH /vouchers/:id` is a full replace: `date` and `beneficiary` are required (400 Joi otherwise). After reject + PATCH the voucher is DRAFT and **keeps `rejectedReason`/`rejectedBy`**.

### Count (opname)
`id, site, fund{...}, countNumber, countedAt, countedBy{id,name,email}, witnessedBy{...}, custodian{...}, custodianName, denominations{"1000":int,...,"100000":int, coins:{"100","200","500","1000"}}, totalPhysicalCash, pendingVoucherTotal, outstandingAdvanceTotal, expectedCash, varianceAmount (signed), varianceType ("SHORT"|"BALANCED"; "OVER" presumably), reason, status, submittedAt, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectedReason, settledByReimbursement (id|null), deleted, createdAt, updatedAt, isStale:boolean`.
- `expectedCash = pagu - pendingVoucherTotal - outstandingAdvanceTotal`. Example: 5,000,000 - 1,411,000 = 3,589,000; counted 3,569,000 -> variance -20,000 SHORT.
- Unknown denomination keys are rejected: 400 Joi `"75000" is not allowed`. Denominations keys are strings; the response orders keys differently.
- `isStale` was `false` right after creation and `true` on the SETTLED count after the reimbursement posted cash (and on the old counts later).

### Reimbursement
`id, site, fund, reimbursementNumber, requestDate, bankAccount{id,name,accountNumber}, count{id,countNumber,countedAt,varianceAmount,varianceType,status}|null, items[{voucher{id,voucherNumber,transactionDate,beneficiary,totalAmount,status}, amount}], voucherTotal, varianceAmount, totalAmount, status, notes, submittedBy, submittedAt, approvedBy, approvedAt, rejectedBy, rejectedAt, rejectedReason, cancelledBy, cancelledAt, disbursedBy, disbursedAt, disbursementDate, journal (journal id | null), deleted, createdAt, updatedAt`. Disburse response additionally has `cashBalanceAfter` (int).
- Preview response `data`: `{voucherTotal, varianceAmount, varianceType, totalAmount, voucherCount, countId, expenseBreakdown[{accountId,account:"6-10000 - Beban Operasional",amount}], taxBreakdown[{accountId,account,amount}], journalPreview[{account:"<no> - <name>",debit,credit}], isBalanced, cashAfterDisbursement, warnings[]}`. `cashAfterDisbursement` = fund cash after replenishment (5,000,000).
- Status of `count` inside a reimbursement flips to `SETTLED` on disburse. `totalAmount = voucherTotal - varianceAmount` (a shortage of 20,000 increases the payout to 1,431,000).
- The whole open variance of the approved count is attached to the **first** reimbursement created (R1 of only 50,000 vouchers already showed `varianceAmount:-20000, totalAmount:70000`). A rejected/cancelled reimbursement releases it again (R3 later carried it).

### Advance (kasbon)
`id, site, fund, advanceNumber, requester{id,name,email}, requesterName, purpose, requestedAmount, amount (= approved amount; approver may lower it: requested 300,000 -> amount 250,000), status, approvedBy, approvedAt, rejectedReason, disbursedBy, disbursedAt, dueAt, cashSettledNet (int; positive = leftover returned to cash, 80000), custodianVerifiedBy, custodianVerifiedAt, financeVerifiedBy, financeVerifiedAt, settlementRejectedReason, voucher{id,voucherNumber,status}|null, receivableJournal (id|null), receivableAmount, convertedBy, convertedAt, deleted, statusHistory[], settlement{}, createdAt, updatedAt, outstandingAmount, isOverdue, attachments[]` (list items lack `attachments`).
- statusHistory entry: `{status, at:ISO, by:userId string, note:string|null}`. Notes seen: "Diajukan", the approve note, "Dikembalikan: <reason>" for custodian-reject and finance-reject (both return the kasbon to DISBURSED), the convert reason.
- Settlement: `{beneficiary, description, receiptNumber, taxInvoiceNumber, vendorTaxId, transactionDate, actualTotal, submittedBy, submittedAt, lines[{lineNo, expenseAccount:{...}|null, description, amount, tax, taxAmount, tags}]}`. A fresh kasbon has an empty settlement object with `lines:[]`, `actualTotal:0`.
- `outstandingAmount` = `amount` while DISBURSED/SETTLEMENT_SUBMITTED, 0 after SETTLED/CONVERTED/before disburse (it stayed 500,000 in SETTLEMENT_SUBMITTED and CUSTODIAN_VERIFIED shown in detail, but fund-level outstanding drops by the actual 420,000 after custodian-verify).
- `dueAt` = disburse day + `advanceSettlementDays` working days skipping Sat/Sun (Sat 31 Oct + 5 -> Fri 6 Nov 23:59:59 WIB). Not extended by custodian-reject in the test (same value, "never shorter" rule).
- A user with only `JP-PC-ADV` sees only their own kasbon in the list (5 vs 6 for the custodian).

### Cash-book entry
`{id, site, fund (id), seq:int, txnDate, type, direction ("IN"|"OUT"), amount (positive int), runningBalance, refType, refId, journal (id|null), settledByReimbursement (id|null), memo, createdBy, createdAt, updatedAt}`.
Observed `type`: `FUNDING`, `VOUCHER`, `VOUCHER_VOID`, `VARIANCE_ADJUSTMENT`, `REPLENISHMENT`, `ADVANCE`, `ADVANCE_RETURN`. Observed `refType`: `FUND, VOUCHER, COUNT, REIMBURSEMENT, ADVANCE`. Not seen: `ADVANCE_EXTRA`, pagu adjustment, close.
Voucher submission (that goes to PENDING_REIMBURSE) immediately writes a `VOUCHER OUT`; void writes `VOUCHER_VOID IN`; count approval writes `VARIANCE_ADJUSTMENT OUT 20000` (cash book adjusted to physical cash, **no journal**); kasbon disburse writes `ADVANCE OUT`; custodian-verify writes `ADVANCE_RETURN IN` for the leftover; reimbursement disburse writes `REPLENISHMENT IN` (journal id set); convert-to-receivable adds an IN (journal id set).

### Audit log (`GET /audit-logs`)
Item: `{id, site, entityType, entityId, action, performedBy{id,name,email}, before:object|null, after:object|null, reason:string|null, ip, createdAt, updatedAt}`. Status changes carry `before:{status}`/`after:{status}`; FUND CREATE `after:{code,pagu}`; FUND UPDATE before/after hold only the changed fields; USER_RESTRICTION carries the full restriction object.
Observed (entityType: action):
- VOUCHER: CREATE, SUBMIT, APPROVE, REJECT, UPDATE, VOID
- COUNT: CREATE, SUBMIT, APPROVE, REJECT
- REIMBURSEMENT: SUBMIT, APPROVE, REJECT, CANCEL, DISBURSE
- ADVANCE: CREATE, APPROVE, REJECT, CANCEL, DISBURSE, SUBMIT_SETTLEMENT, SET_SETTLEMENT_ACCOUNTS, CUSTODIAN_VERIFY, CUSTODIAN_REJECT, FINANCE_VERIFY, FINANCE_REJECT, CONVERT_TO_RECEIVABLE
- FUND: CREATE, UPDATE, SOD_OVERRIDE (written when singleUserOverride let a creator approve own voucher; `reason` = the SoD message)
- USER_RESTRICTION: BLOCK, UNBLOCK, OVERRIDE_OVERDUE, REMOVE_OVERRIDE
- Not logged: attachment upload/delete, failed attempts. `action` filter works (`?action=DISBURSE` -> 5).

### Restriction / advance-status
`GET /advance-status/me|:userId` -> `{user{id,name,email}, isBlocked, reasons[], restriction, openAdvances[<full advance objects>], outstandingAmount}`.
- `reasons[]` items are objects: `{type:"MANUAL", reason:"...", since:ISO}` (overdue type presumably `OVERDUE`). `restriction` is null until one exists, then `{id, user, site, blockReason, blockedAt, blockedBy, createdAt, isBlocked, overdueOverrideUntil, overrideAt, overrideBy, overrideReason, updatedAt}`.
- block/unblock/override responses return the same advance-status object (status 200). Unblock sets `blockReason/blockedAt/blockedBy` to null and keeps the override fields; revoking an override (`until:null`) leaves `overrideAt/By/Reason` set but `overdueOverrideUntil:null`.
- A manual block is **not bypassed by an override** (override only covers OVERDUE): create-kasbon still returned `PETTY_CASH_USER_BLOCKED`.

### Reports (all under /reports unless noted)
- `pending-vouchers`: `{asOf, summary{"0-7","8-14","15-30",">30": {count,amount}}, total, items[{id,fund,voucherNumber,transactionDate,beneficiary,totalAmount,status,ageDays,agingBucket}]}`.
- `expense-summary`: `{groupBy,from,to,total,totalTax,items[{key,label,amount,taxAmount,lineCount}]}`. groupBy=tag gives one item `{key:null,label:"Tanpa tag"}`. Amounts are NET of tax (`total` 1,845,000 + totalTax 11,000). **It includes vouchers that are PENDING_REIMBURSE and kasbon vouchers, not only reimbursed ones** (so it does not equal what is in the GL).
- `advances-by-user`: bare array in `data`: `{requesterId,requesterName,totalCount,totalAmount,outstandingCount,outstandingAmount,overdueCount,settledLateCount,receivableAmount,lastAdvanceAt,isBlocked,blockReasons[]}`. `totalCount` counts rejected/cancelled too but `totalAmount` does not (staff: 5 requests, 1,150,000 = 500k+250k+400k).
- `reconciliation`: bare array, per fund `{fund{id,code,name,account}, pagu, glBalance, glDifference, cashBalance, cashBookBalance, cashBookDifference, isImprestBalanced, isOk, availableCash, reservedAmount, pendingVoucherAmount, outstandingAdvanceAmount, unsettledVariance, replenishmentAmount, availableCashRatio, needsReplenishment, isBalanced}`. Final: glBalance 5,000,000 = pagu, cashBook 4,575,000, isOk true.
- `period-end-check?date`: `{date, hasOpenItems, voucherTotal, advanceTotal, funds[{fund, vouchers[{id,voucherNumber,transactionDate,totalAmount,status}], voucherTotal, advances[{id,advanceNumber,requesterName,outstanding,dueAt,status}], advanceTotal, suggestedAction:"REIMBURSE"}]}`.

## 2. Status enums (all observed except where noted)

| Entity | Values |
|---|---|
| Fund | ACTIVE (INACTIVE, CLOSED validated, not exercised) |
| Voucher | DRAFT, PENDING_APPROVAL, PENDING_REIMBURSE, IN_REIMBURSEMENT, REIMBURSED, REJECTED, VOID |
| Count | DRAFT, SUBMITTED, APPROVED, REJECTED, SUPERSEDED, SETTLED |
| Reimbursement | SUBMITTED, APPROVED, REJECTED, CANCELLED, DISBURSED |
| Advance | PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED, DISBURSED, SETTLEMENT_SUBMITTED, CUSTODIAN_VERIFIED, SETTLED, CONVERTED_TO_RECEIVABLE |
| Voucher source | DIRECT, ADVANCE |
| Count varianceType | SHORT, BALANCED (OVER not tested) |
| Cash-book direction | IN, OUT |
| Restriction reason type | MANUAL (OVERDUE not tested) |

## 3. State machines (what each action really did)

Voucher
```
create submit:false -> DRAFT
create/submit total >= voucherApprovalThreshold -> PENDING_APPROVAL (1,200,000 and 1,050,000 with threshold 1,000,000; below -> PENDING_REIMBURSE)
DRAFT --PATCH--> DRAFT ; DRAFT --submit--> PENDING_REIMBURSE (<threshold)
PENDING_APPROVAL --approve (approver)--> PENDING_REIMBURSE
PENDING_APPROVAL --reject (approver, reason)--> REJECTED --PATCH (custodian)--> DRAFT
PENDING_APPROVAL | PENDING_REIMBURSE --void (reason)--> VOID  (cash restored by VOUCHER_VOID)
PENDING_REIMBURSE --reimbursement create--> IN_REIMBURSEMENT ; reject/cancel --> PENDING_REIMBURSE ; disburse --> REIMBURSED
kasbon finance-verify --> new voucher source ADVANCE, PENDING_REIMBURSE (voucherNumber PCV/..., lines from settlement)
```
Count: `create(submit:false)` -> DRAFT; `submit:true`/`submit` -> SUBMITTED; approve -> APPROVED; reject -> REJECTED; approving a newer count -> older APPROVED becomes SUPERSEDED (confirmed); reimbursement disburse -> SETTLED (the count used).
Reimbursement: create -> SUBMITTED; approve -> APPROVED; reject -> REJECTED (vouchers back to PENDING_REIMBURSE); cancel (from SUBMITTED) -> CANCELLED; disburse (APPROVED only) -> DISBURSED. Disburse while SUBMITTED -> 409 `INVALID_STATE_TRANSITION`.
Advance:
```
create -> PENDING_APPROVAL (advanceApprovalThreshold 0 does NOT auto-approve)
PENDING_APPROVAL --approve (amount<=requested)--> APPROVED ; --reject--> REJECTED ; --cancel (requester)--> CANCELLED
APPROVED --disburse--> DISBURSED (dueAt set; cash book ADVANCE OUT amount)
DISBURSED --settlement (needs attachment if total>0)--> SETTLEMENT_SUBMITTED
SETTLEMENT_SUBMITTED --custodian-verify--> CUSTODIAN_VERIFIED (ADVANCE_RETURN IN for leftover) ; --custodian-reject--> DISBURSED
CUSTODIAN_VERIFIED --finance-verify--> SETTLED (voucher source ADVANCE created) ; --finance-reject--> DISBURSED (back to the requester, not to SETTLEMENT_SUBMITTED)
DISBURSED --convert-to-receivable--> CONVERTED_TO_RECEIVABLE (receivableJournal, receivableAmount=amount)
```
Note: finance-reject after custodian-verify leaves `custodianVerifiedBy/At` populated and sets `settlementRejectedReason`.
Settle-account editing (`PATCH settlement-accounts`) works in SETTLEMENT_SUBMITTED and CUSTODIAN_VERIFIED. **Custodian-verify succeeded even though a line had no expense account**; the missing account only blocks finance-verify (`EXPENSE_ACCOUNT_REQUIRED`).

## 4. Errors and messages observed

Envelope: domain errors `data:{errorCode, details?}`; Joi errors `data:[{field,message}]`; some business errors have NO `data` at all (rows marked "none").
| HTTP | errorCode | message | when |
|---|---|---|---|
| 400 | ATTACHMENT_REQUIRED | Voucher mulai Rp100.000 wajib melampirkan bukti | voucher total >= attachmentRequiredThreshold, no file, on create+submit |
| 400 | ATTACHMENT_REQUIRED | Kwitansi atau bukti bayar wajib diupload | kasbon settlement total > 0 with no attachment uploaded |
| 400 | PETTY_CASH_INSUFFICIENT_BALANCE | Nominal melebihi kas tersedia (Rp3.589.000) | `details:{availableCash:3589000}` |
| 400 | COUNT_REQUIRED | Reimbursement wajib menyertakan opname yang sudah disetujui | fund.requireCountBeforeReimbursement and no countId |
| 400 | COUNT_REQUIRED | Opname harus opname kas kecil ini yang sudah disetujui | countId already SETTLED/not APPROVED |
| 400 | none | Saksi opname (witnessedBy) wajib diisi | requireWitness and no witnessedBy (no errorCode) |
| 400 | none | Alasan wajib diisi karena ada selisih kas | variance != 0 and no reason (no errorCode) |
| 400 | none (Joi array) | "75000" is not allowed | unknown denomination key |
| 400 | none (Joi array) | "date" is required, "beneficiary" is required | PATCH voucher without date/beneficiary |
| 400 | none | Baris 9 tidak ada di pertanggungjawaban | settlement-accounts lineNo not present (no errorCode) |
| 400 | INVALID_EXPENSE_ACCOUNT | Akun beban tidak ditemukan, tidak aktif, atau bukan akun beban | `details:[<accountId>]` |
| 400 | EXPENSE_ACCOUNT_REQUIRED | Akun beban belum diisi di baris 1. Isi akunnya dulu sebelum verifikasi. | finance-verify; `details:[1]` (line numbers) |
| 400 | ADVANCE_LIMIT_EXCEEDED | Maksimal kasbon per pengajuan di PC-HQ adalah Rp2.000.000 | |
| 400 | none | Header Idempotency-Key wajib diisi | POST without the header |
| 403 | none | Forbidden Access Role | missing menu permission (e.g. custodian approving, staff approving, approver creating voucher/count) |
| 403 | SOD_VIOLATION | Pembuat voucher tidak boleh menyetujui voucher sendiri | |
| 403 | SOD_VIOLATION | Pengaju kasbon tidak boleh menyetujui kasbon sendiri | |
| 403 | SOD_VIOLATION | Saksi opname harus orang lain selain custodian | |
| 403 | SOD_VIOLATION | Penghitung dan saksi opname harus orang berbeda | |
| 403 | PETTY_CASH_USER_BLOCKED | User tidak bisa mengajukan kasbon: diblokir manual (<reason>) | `details:[{type:"MANUAL",reason,since}]` |
| 409 | INVALID_STATE_TRANSITION | `<Entity> berstatus <STATUS> sehingga aksi ini tidak bisa dilakukan` | wrong state (Reimbursement/Kasbon/...) |
| 409 | PETTY_CASH_PENDING_REIMBURSEMENT | Masih ada reimbursement kas kecil ini yang berjalan. Selesaikan atau batalkan dulu. | second active reimbursement |
| 422 | IDEMPOTENCY_KEY_REUSED | Idempotency-Key sudah dipakai untuk permintaan yang berbeda | |
`NOT_CUSTODIAN` could not be provoked: a non-custodian regular user lacks the menu permission (403 Forbidden Access Role) and the **superadmin bypassed the custodian check** (see findings).

## 5. Journals posted

| Action | Journal (all balanced) |
|---|---|
| Create fund PC-HQ (funding bank 1-10003) | #27899 `sourceType PETTY_CASH_FUNDING`: Dr 1-10002 Kas Kecil Kasir 5,000,000 / Cr 1-10003 Bank Mandiri 5,000,000. Cash book `FUNDING`. |
| Voucher create/approve/void, count approve, kasbon disburse/verify | no journal (cash book only) |
| Reimbursement PCR/0003 disburse (3 vouchers + 20,000 shortage) | #27900 `sourceType PETTY_CASH_REIMBURSEMENT`: Dr 6-10000 Beban Operasional 1,345,000; Dr 6-10001 Beban Karyawan 50,000; Dr 5-10000 Beban Langsung 5,000; Dr 1-10407 PPN Masukan 11,000; Dr 8-10000 Beban Lain-lain (variance) 20,000; Cr 1-10003 Bank Mandiri 1,431,000. |
| Reimbursement PCR/0004 (kasbon voucher, no variance) | #27902: Dr 5-10000 300,000; Dr 6-10000 120,000; Cr 1-10003 420,000. |
| Convert kasbon to receivable (250,000) | #27901 `PETTY_CASH_ADVANCE_RECEIVABLE`: Dr 1-10205 Piutang Karyawan 250,000 / Cr 1-10003 Bank 250,000; petty cash cash book +250,000. |

Imprest check: yes. The GL balance of 1-10002 stays at pagu (5,000,000) the whole time (reconciliation `glDifference 0`); expenses are recognized only at reimbursement; the bank pays exactly expenses+tax+shortage; the fund cash returns to pagu minus outstanding kasbon (4,600,000 + 400,000 = 5,000,000 after PCR/0004). Journal detail is `GET /v1/journal/detail/:id` (header: `transactionNumber, transactionDate, transactionType:"DEFAULT", status, sourceType, sourceId, notes, transactionDetail[{account{...}, debit, credit, description, ...}]`; `balance`/`amount` fields inside a detail line are account-level and misleading, use `debit`/`credit`).
Accounting remarks: (1) the variance account was empty and had to be mapped by the setup (8-10000 chosen) before a variance can be reimbursed. (2) The shortage is expensed to Beban Lain-lain, not to the custodian's receivable. (3) Expense-summary report includes unreimbursed vouchers, so it will not tie to the GL.

## 6. Checked behaviors for the unclear settings

- `attachmentRequiredThreshold` (100,000): enforced at voucher create+submit (and on submit) as `ATTACHMENT_REQUIRED`; submitting a DRAFT without attachment presumably the same. Voucher at 50,000 and 45,000 passed without attachment. Multipart is needed to attach in the same call (JSON cannot).
- `voucherApprovalThreshold` (1,000,000): `>=` goes to PENDING_APPROVAL (1,050,000, 1,100,000, 1,200,000 all did). Below stayed PENDING_REIMBURSE.
- `advanceApprovalThreshold: 0`: nothing special, kasbon still PENDING_APPROVAL and needed an approver.
- `requireCountBeforeReimbursement`: enforced with `COUNT_REQUIRED`; a count that is already SETTLED is not accepted again.
- `requireWitness`: witnessedBy required; witness must not be the custodian or the counter.
- `singleUserOverride: true`: the creator (superadmin) approved their own voucher (200) and `FUND SOD_OVERRIDE` was audited. Reverted to false afterwards (audit shows 3 FUND UPDATE entries).
- Opname creator (`JP-PC-CNT` create) cannot be the custodian (custodian lacks the permission in this role setup; a custodian counting is also blocked by SoD in the witness rule).

## 7. Contract doc was wrong/unclear -> reality

1. Taxes lookup empty / unknown shape -> POST /v1/taxes works for a superadmin; body `rate` is a string "11", response `rate` integer; lookups then return `{id,name,rate}`.
2. "Money maybe decimals" -> integers only.
3. Voucher line tax -> added **on top** of the net line amount; voucher `totalAmount` includes tax; journal debits the tax's purchase account (1-10407).
4. Voucher create with `submit:true` above 100,000 with no file -> 400 `ATTACHMENT_REQUIRED`; the contract did not name this code.
5. `warnings` shape -> `[{code,message}]`, only `DUPLICATE_RECEIPT_NUMBER` seen.
6. Count enums -> DRAFT, SUBMITTED (not PENDING_APPROVAL), APPROVED, REJECTED, SUPERSEDED, SETTLED. Reimbursement initial state is SUBMITTED, not PENDING_APPROVAL.
7. Advance after convert-to-receivable -> `CONVERTED_TO_RECEIVABLE`; after finance-reject -> `DISBURSED` (with note "Dikembalikan: ...").
8. `NOT_CUSTODIAN` -> not observable; a custodian-only action is blocked by the menu permission (403 "Forbidden Access Role"), and **superadmin bypasses it** (voucher create, kasbon disburse both succeeded as finance2).
9. Voucher PATCH -> full replace (date, beneficiary required), rejectedReason persists after returning to DRAFT.
10. `PETTY_CASH_PENDING_REIMBURSEMENT` (409) is the name of "reimbursement already active"; `INVALID_STATE_TRANSITION` (409) is the generic wrong-state code; `COUNT_REQUIRED` for count rules.
11. Custodian-verify does NOT require expense accounts; finance-verify does. The contract ordering (set accounts before verify) is not enforced.
12. Settlement attachment rule: error is `ATTACHMENT_REQUIRED` (400), upload endpoint returns 201 with the full advance.
13. Cash book `type` list is larger than documented (FUNDING, VOUCHER, VOUCHER_VOID, VARIANCE_ADJUSTMENT, REPLENISHMENT, ADVANCE, ADVANCE_RETURN). Voucher submit already reduces cash (not at reimbursement).
14. Reimbursement preview returns `journalPreview`, `expenseBreakdown`, `taxBreakdown` as above and `cashAfterDisbursement`; create has no disbursementDate (journal date = disbursementDate at disburse).
15. Signed attachment URL is relative (`/v1/petty-cash/attachments/:id/file?expires=<unix>&signature=<hex>`) with `expiresAt` ISO (10 min). The file endpoint needs no bearer, returned `content-type image/png`, `content-disposition: inline; filename="tiny.png"`, `cache-control: private, no-store`, CORS `*`.
16. `Idempotency-Key` missing -> 400 (no errorCode); PATCH/DELETE/uploads/restrictions do not need it.
17. `GET /advance-status/me` for a user with only ADV works; for the custodian role (no ADV) it returns 403.
18. Opname list `GET /counts?fundId=` and the voucher list return full objects including `lines` / `denominations`; voucher list omits `attachments`.
19. Access-role create response and user create response are bare objects (no envelope); only enabled actions per menu may be granted (e.g. JP-PC-CNT has only c,r).
20. Posted journal `transactionType` is `DEFAULT` with `sourceType` `PETTY_CASH_REIMBURSEMENT` / `PETTY_CASH_ADVANCE_RECEIVABLE`; the funding journal has `sourceType PETTY_CASH_FUNDING`, `sourceId` = fund id.

## 8. Access and cash book facts verified later (2026-10-31)

- **`GET /v1/users/me/permissions`** answers without the envelope: `{ role, permissions: [{ menuId, name, create, read, update, delete }] }`. For a user with a custom role every menu is present and the flags are booleans; `role` is `superadmin` for a superadmin and `user` otherwise. The petty cash menus are `JP-PC`, `JP-PC-VCH`, `JP-PC-APR`, `JP-PC-CNT`, `JP-PC-RMB`, `JP-PC-DSB`, `JP-PC-ADV`, `JP-PC-CST`, `JP-PC-CTL`.
- **`GET /v1/users/get-id` answers 403 `Forbidden Access Role` for a user without user-management rights** (checked as the custodian), so it cannot supply the current user id. The access token is a JWT whose claims are `sub`, `type`, `iat`, `exp`; `sub` equals the user id returned by login. The frontend reads the id from `sub`.
- **Cash book `txnDate`** is `YYYY-MM-DDT00:00:00.000Z` in all 39 observed entries (UTC midnight, like the other accounting dates).
- **Cash book `openingBalance` and `closingBalance` follow the `from`/`to` filter.** Entries are ordered by transaction date, then sequence, while `runningBalance` follows the sequence in which they were recorded.
- **A voucher dated before the fund was opened is accepted.** PCV/202610/0011 is dated 2026-10-25 and the fund was opened on 2026-10-31, so the period 26-31 Oct shows an opening balance of -25,000, and the period 25-25 Oct a closing balance of -25,000 (a negative petty cash balance). The backend does not reject the back-dated voucher.
- **Voucher list items carry `lines[].expenseAccount` as a bare id**; only the detail carries the account object.
- Cash book entry type `ADVANCE_RECEIVABLE` (a kasbon converted to employee receivable) exists in addition to the types listed in section 1.
