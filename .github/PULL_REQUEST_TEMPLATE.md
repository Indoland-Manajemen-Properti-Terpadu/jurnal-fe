## Ringkasan

<!-- Jelaskan perubahan dan alasan utamanya. -->

## Modul Terdampak

<!-- Centang modul yang disentuh. Nama mengikuti docs/migration/STATUS.md. -->

- [ ] Fondasi (CI, lint, lib, docs)
- [ ] contacts
- [ ] products
- [ ] sales
- [ ] purchases
- [ ] assets
- [ ] pending-changes
- [ ] profile
- [ ] landing
- [ ] dashboard
- [ ] budgeting
- [ ] costs / production / fulfillment
- [ ] bank-cash
- [ ] petty-cash
- [ ] reports
- [ ] chart-of-accounts
- [ ] journal-entries
- [ ] account-ledger
- [ ] bank-statements
- [ ] reconciliation
- [ ] beginning-balances
- [ ] period-closing
- [ ] settings
- [ ] user-management
- [ ] authentication
- [ ] Lainnya: ...

## Catatan Implementasi

<!-- Catat dampak API, accounting, UI, atau migrasi yang perlu diketahui reviewer. Tulis "Tidak ada" bila tidak relevan. -->

## Verifikasi

<!-- Cantumkan perintah yang dijalankan dan hasilnya. Jika tidak menjalankan verifikasi, jelaskan alasannya. -->

- [ ] `yarn typecheck`
- [ ] `npm run lint` (ratchet tidak naik; jika turun, `--write-baseline` sudah dijalankan)
- [ ] `yarn vitest --run`
- [ ] `yarn build`

## Tangkapan Layar

<!-- Tambahkan jika ada perubahan UI. -->

## Gate Rilis (hanya untuk PR ke `main-frontend`)

- [ ] Typecheck, lint ratchet, tes, dan build hijau di `staging`
- [ ] Smoke test manual di staging: login, daftar akun, jurnal transaksi, kas dan bank, laporan, penjualan
- [ ] `docs/migration/STATUS.md` diperbarui
- [ ] Tidak ada perubahan perilaku yang tidak disengaja
- [ ] Tag versi disiapkan (`vMAJOR.MINOR.PATCH`)

## Referensi

Pastikan perubahan mengikuti [konteks engineering project](../.codex/PROJECT_CONTEXT.md), [konvensi](../docs/conventions.md), dan workflow yang relevan.
