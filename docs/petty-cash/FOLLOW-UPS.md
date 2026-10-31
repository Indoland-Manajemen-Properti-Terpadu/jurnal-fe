# Petty cash: keputusan dan tindak lanjut

Daftar tunggal hal yang butuh persetujuan, konfirmasi, atau tindakan pihak lain. Diperbarui di setiap fase. Pertanyaan teknis untuk tim backend ada di [BACKEND-QUESTIONS.md](BACKEND-QUESTIONS.md); file ini mencatat apa yang **menunggu keputusan pemilik produk atau tindakan tim**.

Status: `TERBUKA` menunggu jawaban, `ASUMSI` dikerjakan dengan asumsi yang tertulis dan bisa diubah, `SELESAI` sudah dijawab atau ditutup.

## Perlu keputusan pemilik produk

| #   | Hal                                                                                                                                         | Status            | Asumsi yang dipakai sekarang                                                                                                                           | Dampak bila beda                                                                                               |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| D1  | Akun selisih kas: `petty_cash_variance` dipetakan ke 8-10000 Beban Lain-lain di Demo Site karena tidak ada akun "Selisih Kas"               | TERBUKA           | Beban Lain-lain                                                                                                                                        | Mapping harus diubah di Pengaturan, bukan di kode                                                              |
| D2  | Selisih kurang dibebankan langsung ke beban, bukan jadi piutang custodian                                                                   | TERBUKA           | Sesuai perilaku backend                                                                                                                                | Perlu perubahan di backend                                                                                     |
| D3  | PRD Kasus 4 menulis jurnal selisih saat opname; backend menjurnal saat penggantian dana                                                     | TERBUKA           | Mengikuti backend                                                                                                                                      | PRD atau backend perlu disesuaikan                                                                             |
| D4  | Nominal voucher dimasukkan sebagai rupiah bulat (tanpa sen)                                                                                 | ASUMSI (Fase 3)   | Rupiah bulat. Backend ternyata MENERIMA desimal (100,5 disimpan). Voucher lama berdesimal ditampilkan apa adanya dan simpan diblokir sampai dibulatkan | Bila sen diperlukan, ubah validasi `WHOLE_RUPIAH` dan konfirmasi pembulatan pajak (BACKEND-QUESTIONS 4 dan 37) |
| D7  | Ambang bukti wajib dicek di FE terhadap nominal SEBELUM pajak                                                                               | ASUMSI (Fase 3)   | Net saja; server menentukan dan UI menampilkan jawabannya bila total berpajak melewati ambang                                                          | Ubah satu fungsi `attachmentRequired` bila server memakai total (BACKEND-QUESTIONS 34)                         |
| D8  | Tombol "Ajukan" dinonaktifkan saat nominal melebihi kas tersedia atau bukti wajib belum ada; "Simpan draf" tetap boleh                      | ASUMSI (Fase 3)   | Poka-yoke di UI; server tetap memvalidasi                                                                                                              | Longgarkan bila tim ingin submit dicoba dan ditolak server                                                     |
| D9  | Satu hari bisa dipilih di filter tanggal (rentang dari hari yang sama)                                                                      | ASUMSI (Fase 2-3) | Diizinkan                                                                                                                                              | —                                                                                                              |
| D10 | Hapus bukti langsung terkirim ke backend setelah konfirmasi (bukan menunggu tombol simpan); backend tidak mencatat hapus bukti di audit log | ASUMSI (Fase 3)   | Dialog konfirmasi dan tombol dinonaktifkan saat proses                                                                                                 | Bila ingin "hapus saat simpan", perlu antrean perubahan di form                                                |
| D5  | Istilah di layar: "Penggantian dana" (id) dan "Replenishment" (en)                                                                          | ASUMSI            | Sesuai glosarium; PRD dan API memakai "reimbursement"                                                                                                  | Ganti satu kunci i18n bila lo mau istilah lain                                                                 |
| D6  | "Uang Muka Karyawan" sebagai label, "kasbon" hanya di teks bantuan                                                                          | ASUMSI            | Mengikuti glosarium terminologi                                                                                                                        | Ganti kunci i18n                                                                                               |

## Perlu tindakan tim atau pihak lain

| #   | Hal                                                                                                                                                                                                                                                             | Siapa                    | Status  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------- |
| F1  | Kirim [BACKEND-QUESTIONS.md](BACKEND-QUESTIONS.md) ke tim backend (prioritas P1: nomor 1 sampai 5 dan 10)                                                                                                                                                       | Pemilik produk           | TERBUKA |
| F2  | Stack trace server masih ikut di respons error produksi                                                                                                                                                                                                         | Backend                  | TERBUKA |
| F3  | Bersihkan data uji di Demo Site setelah pekerjaan selesai: user `pc.*`, peran "TEST PC \*", fund `PC-HQ`, pajak "TEST PC PPN 11%", voucher, opname, penggantian dana, dan uang muka uji                                                                         | Pemilik produk atau saya | TERBUKA |
| F4  | Sesi Claude lain di folder yang sama mengerjakan `docs/accounting-terminology.md` dan ADR 0006; filenya sempat hilang dari disk dan ada cadangan di scratchpad sesi itu                                                                                         | Pemilik produk           | TERBUKA |
| F6  | Akun `pc.custodian@proapps.id` berubah (login ditolak) pada 12:25:58Z. Pemilik produk memberi tahu password barunya (tidak dicatat di repo; kredensial akun uji dibagikan lewat jalur pribadi). Tampilan custodian non-superadmin sudah diverifikasi di browser | Pemilik produk           | SELESAI |
| F5  | Login di dev server: input kolom email ter-akumulasi saat diisi otomatis (nilai lama ikut tersisa). Bukan bagian petty cash, belum diselidiki                                                                                                                   | Tim FE                   | TERBUKA |

## Data uji tambahan dari Fase 3 (bagian dari F3)

Voucher uji yang dibuat lewat UI dan API: PCV/202610/0013 sampai 0020 (draf, berdesimal, idempotensi, pajak + bukti, persetujuan, penolakan, pembatalan). PCV/0019 disetujui (menunggu penggantian), PCV/0020 menunggu persetujuan, PCV/0017 menunggu penggantian, PCV/0016 dibatalkan. Kas tersedia fund PC-HQ berkurang oleh voucher yang masih aktif; voucher yang menunggu persetujuan/penggantian bisa dibatalkan bila perlu mengembalikan kas.

## Cacat yang diketahui, di luar lingkup

- Badge persetujuan di shell memanggil `GET /v1/pending-changes/count` dan mendapat 403 untuk user tanpa hak; muncul sebagai error di console pada semua halaman.
- ESLint melaporkan `import/order` di `src/i18n/locales/id|en/index.ts` (bagian `reports`); ratchet menyatakan tidak ada regresi.

## Ditunda dari tinjauan Fase 3 (dengan alasan)

- Alur ubah-lalu-ajukan dikoordinasi di komponen form (dua mutasi berurutan) dan belum di lapisan `application`. Cukup aman untuk satu alur; pindahkan ke use case bila Fase 4 dan 5 menambah alur multi-langkah serupa.
- `apiClient` bersama tidak punya batas waktu (timeout). Kegagalan gateway sudah dianggap hasil tidak diketahui sehingga key dipertahankan, tapi permintaan yang menggantung tanpa batas tetap mungkin. Perubahan di klien bersama butuh persetujuan (di luar petty cash).

## Riwayat keputusan

- 2026-10-31: kode prototype, mock, dan dokumen draf lama dihapus atas arahan pemilik produk.
- 2026-10-31: password baru `pc.custodian` diberitahukan pemilik produk (tidak dicatat di repo).
- 2026-10-31: akses tulis ke Demo Site diizinkan pemilik produk untuk seeding dan uji alur.
