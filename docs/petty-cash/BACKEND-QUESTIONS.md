# Pertanyaan untuk Tim Backend: Modul Kas Kecil

Dari tim frontend, untuk integrasi `/v1/petty-cash` ke Jurnal FE. Dasarnya: collection "Jurnal Proapps - Kas Kecil", PRD Kas Kecil, dan satu putaran penuh semua alur di Demo Site (hasilnya di [`API-REAL-SHAPES.md`](API-REAL-SHAPES.md)). Pertanyaan yang sudah terjawab oleh data asli sudah dihapus. Prioritas: **P1** mengubah logika akuntansi atau keamanan, **P2** mengubah UX atau validasi, **P3** kualitas dan konsistensi.

## Yang sudah terkonfirmasi benar (tidak perlu dijawab)

Jurnal selalu seimbang. Saldo GL akun kas kecil tetap sebesar pagu. Persamaan `pagu = cashBalance + pendingVoucherAmount + outstandingAdvanceAmount - unsettledVariance` berlaku setelah setiap langkah, dan laporan rekonsiliasi `isOk: true`. Uang disimpan sebagai bilangan bulat rupiah. Pajak voucher ditambahkan di atas nilai baris.

## A. Akuntansi dan kontrol (P1)

1. **Superadmin melewati aturan khusus custodian.** Superadmin bisa membuat voucher di fund yang bukan miliknya dan mencairkan kasbon (`disbursedBy` tercatat superadmin). `NOT_CUSTODIAN` tidak pernah muncul. Apakah ini disengaja? Bila ya, FE perlu tahu supaya tidak menampilkan tombol custodian untuk orang yang bukan custodian.
2. **Selisih opname dijurnal saat reimbursement, bukan saat opname.** PRD Kasus 4 menulis Dr Beban Selisih Kas / Cr Kas Kecil saat opname. Backend memakai `VARIANCE_ADJUSTMENT` di buku kas tanpa jurnal, lalu selisih masuk ke jurnal reimbursement. Apakah PRD yang akan disesuaikan? Dan apa kontrol cut-off akhir periode bila belum ada reimbursement (cukup `unsettledVariance` dan `period-end-check`)?
3. **Selisih kurang dibebankan ke Beban Lain-lain.** Tidak ada akun "Selisih Kas" di site demo, jadi mapping `petty_cash_variance` diisi 8-10000 Beban Lain-lain. Apakah kebijakannya selisih kurang selalu jadi beban, bukan piutang custodian? Dan apa perilaku backend bila mapping belum diisi: gagal saat membuat fund, saat opname, atau baru saat disburse?
4. **Selisih opname menempel ke reimbursement pertama yang dibuat.** Reimbursement dengan voucher 50.000 langsung menunjukkan `varianceAmount: -20000` dan `totalAmount: 70000`. Bila reimbursement itu ditolak atau dibatalkan, selisih dilepas lagi. Apakah user boleh memilih reimbursement mana yang membawa selisih?
5. **Voucher `PENDING_APPROVAL`.** Submit sudah mengurangi kas di buku kas. Apakah voucher yang menunggu persetujuan ikut dihitung di `pendingVoucherAmount` dan `expectedCash` opname? (Uang sudah keluar secara fisik.)
6. **Akun 1-10001** muncul di lookup `bankAccounts` dan juga dipetakan sebagai `default_deposit_account` dan `fitout_refund_account`. Aman dipakai sebagai akun fund? (Demo memakai 1-10002 untuk menghindarinya.)
7. **Piutang kasbon.** Setelah `CONVERTED_TO_RECEIVABLE`, siapa dan bagaimana piutang karyawan itu dilunasi di buku besar?
8. **`custodian-verify` lolos meski ada baris tanpa akun beban**; baru `finance-verify` menolaknya (`EXPENSE_ACCOUNT_REQUIRED`). Apakah urutan ini sengaja?
9. **Blokir manual tidak bisa dilepas dengan override** (override hanya untuk `OVERDUE`). Apakah ini yang diinginkan?
10. **Voucher bertanggal sebelum dana dibentuk diterima backend.** Fund dibuka 2026-10-31, tetapi voucher PCV/202610/0011 bertanggal 2026-10-25 lolos. Akibatnya buku kas periode 26-31 Okt punya saldo awal negatif (-25.000) dan periode 25 Okt saldo akhir negatif. Apakah backend akan menolak tanggal voucher yang mendahului tanggal pembentukan dana (atau tanggal penutupan periode)?
11. **`expense-summary` menghitung voucher yang belum di-reimburse dan voucher kasbon**, sehingga tidak sama dengan GL. Apakah memang laporan manajemen (bukan buku besar)? Kalau ya, mohon diberi label di respons.

## B. Perilaku API yang perlu diperjelas (P2)

12. **Tag.** `lines[].tags` selalu `[]` dan `expense-summary?groupBy=tag` hanya menghasilkan "Tanpa tag". Bagaimana tag dipasang?
13. **Voucher `PATCH` adalah replace penuh** (`date` dan `beneficiary` wajib) dan `rejectedReason` tetap terisi setelah voucher kembali ke `DRAFT`. Mohon dikonfirmasi, atau dibersihkan saat kembali ke draft.
14. **Daftar voucher tidak memuat `attachments` dan `warnings`.** `warnings` dihitung saat dibaca, sehingga voucher lama bisa tiba-tiba punya peringatan yang menunjuk duplikat yang lebih baru. Apakah memang begitu?
15. **Tanggal akuntansi di respons berupa ISO datetime tengah malam UTC**, sementara request memakai `YYYY-MM-DD`. FE akan memotong bagian tanggalnya. Mohon dikonfirmasi bahwa itu tanggal kalender WIB.
16. **Status `OVER` pada opname, `INACTIVE` dan `CLOSED` pada fund, dan tipe `OVERDUE` pada pembatasan** belum teramati. Apakah ada nilai lain yang tidak terlihat?
17. **Kasbon:** `outstandingAmount` pada detail tetap utuh di `SETTLEMENT_SUBMITTED` dan `CUSTODIAN_VERIFIED`, padahal outstanding di tingkat fund sudah turun setelah verifikasi custodian. Mana yang dipakai FE untuk "sisa yang harus dipertanggungjawabkan"?
18. **`ADVANCE_EXTRA`** (kekurangan yang dibayar ke staf) belum teramati. Mohon contoh skenarionya.
19. **Pagu:** adjust dan close belum diuji. Mohon kode error untuk batasannya.

## C. Konsistensi dan keamanan (P3)

20. **Stack trace server ikut di setiap respons error produksi** (`stack` berisi path `/app/src/modules/pettyCash/...`). Mohon dimatikan di produksi.
21. **Bentuk error tidak seragam.** Error bisnis punya `data.errorCode`; beberapa error bisnis tidak punya `data` sama sekali (saksi wajib, alasan wajib, nomor baris tidak ada, header idempotency hilang); Joi memakai array `{field, message}` berbahasa Inggris; 403 izin menu hanya `"Forbidden Access Role"` tanpa kode. Mohon minimal `errorCode` ada di semuanya.
22. `GET /vouchers`, `/counts`, `/reimbursements`, `/advances` menerima `status=FOO` dengan 200 dan hasil kosong, sementara `/funds` memvalidasi enum.
23. `advances-by-user` dan `reconciliation` mengembalikan array polos, laporan lain objek.
24. `users` dan `access-role` mengembalikan objek polos tanpa envelope `{code, message, data}`.
25. Collection mengirim query kosong (`fundId=&status=…`) yang dijawab 400, dan tidak punya contoh respons tersimpan. Mohon diperbaiki dan diisi dengan contoh dari Demo Site.
26. Pesan validasi id memuat tanda kutip ganda (`""fundId"" must be a valid mongo id`).
27. `Idempotency-Key` ternyata hanya wajib pada POST bisnis; PATCH, DELETE, upload lampiran, serta block/unblock/override berjalan tanpanya. Mohon dikonfirmasi bahwa ini yang dimaksud.
28. Upload dan hapus lampiran serta percobaan yang gagal tidak masuk audit log. Apakah memang begitu?

## D. Endpoint yang dibutuhkan UI (P2)

29. Ekspor PDF/Excel untuk BPKK, buku kas, dan laporan.
30. Filter `custodianId` di `GET /funds` (atau konfirmasi bahwa FE menyaring dari `custodian.id`).
31. Daftar user untuk picker saksi, penyetuju, dan pencair yang sudah disaring menurut hak akses (`lookups.users` mengembalikan semua user site).
32. `GET /advance-status/me` untuk peran custodian tanpa hak `JP-PC-ADV` mengembalikan 403. Bagaimana FE tahu status blokir user itu?

## F. Ditemukan di Fase 3 (P2)

33. **Idempotency-Key menyimpan balasan gagal.** Key yang sama dengan body gagal yang sama memutar ulang 400; key yang sama dengan body yang sudah diperbaiki menghasilkan 422 `IDEMPOTENCY_KEY_REUSED`. Apakah balasan 5xx juga disimpan, berapa lama (TTL), dan apakah ini memang diinginkan? FE sekarang memakai key baru setelah setiap jawaban server dan hanya memakai ulang key saat koneksi putus.
34. **Ambang bukti wajib (`attachmentRequiredThreshold`):** apakah dibandingkan dengan nominal sebelum pajak atau total termasuk pajak? FE hanya memeriksa nominal sebelum pajak; server yang menentukan.
35. **"Hari ini" untuk `FUTURE_DATE_NOT_ALLOWED`:** zona waktu apa yang dipakai server? FE membatasi tanggal sampai hari ini menurut zona waktu browser.
36. **Beberapa respons error bukan JSON valid** (karakter newline mentah di `stack`), misalnya `GET /v1/users?limit=50`. Mohon diperbaiki bersama penghapusan `stack`.
37. **Desimal pada nominal:** nominal 100,5 diterima. Bagaimana pembulatan PPN dan batas jumlah desimal? FE membatasi input ke rupiah bulat sampai ada jawaban.
