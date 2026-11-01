# Petty cash: keputusan dan tindak lanjut

Daftar tunggal hal yang butuh persetujuan, konfirmasi, atau tindakan pihak lain. Diperbarui di setiap fase. Pertanyaan teknis untuk tim backend ada di [BACKEND-QUESTIONS.md](BACKEND-QUESTIONS.md); file ini mencatat apa yang **menunggu keputusan pemilik produk atau tindakan tim**.

Status: `TERBUKA` menunggu jawaban, `ASUMSI` dikerjakan dengan asumsi yang tertulis dan bisa diubah, `SELESAI` sudah dijawab atau ditutup.

## Perlu keputusan pemilik produk

| #   | Hal                                                                                                                                                                                                 | Status             | Asumsi yang dipakai sekarang                                                                                                                           | Dampak bila beda                                                                                                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| D1  | Akun selisih kas: `petty_cash_variance` dipetakan ke 8-10000 Beban Lain-lain di Demo Site karena tidak ada akun "Selisih Kas"                                                                       | TERBUKA            | Beban Lain-lain                                                                                                                                        | Mapping harus diubah di Pengaturan, bukan di kode                                                                |
| D2  | Selisih kurang dibebankan langsung ke beban, bukan jadi piutang custodian                                                                                                                           | TERBUKA            | Sesuai perilaku backend                                                                                                                                | Perlu perubahan di backend                                                                                       |
| D3  | PRD Kasus 4 menulis jurnal selisih saat opname; backend menjurnal saat penggantian dana                                                                                                             | TERBUKA            | Mengikuti backend                                                                                                                                      | PRD atau backend perlu disesuaikan                                                                               |
| D4  | Nominal voucher dimasukkan sebagai rupiah bulat (tanpa sen)                                                                                                                                         | ASUMSI (Fase 3)    | Rupiah bulat. Backend ternyata MENERIMA desimal (100,5 disimpan). Voucher lama berdesimal ditampilkan apa adanya dan simpan diblokir sampai dibulatkan | Bila sen diperlukan, ubah validasi `WHOLE_RUPIAH` dan konfirmasi pembulatan pajak (BACKEND-QUESTIONS 4 dan 37)   |
| D7  | Ambang bukti wajib dicek di FE terhadap nominal SEBELUM pajak                                                                                                                                       | ASUMSI (Fase 3)    | Net saja; server menentukan dan UI menampilkan jawabannya bila total berpajak melewati ambang                                                          | Ubah satu fungsi `attachmentRequired` bila server memakai total (BACKEND-QUESTIONS 34)                           |
| D8  | Tombol "Ajukan" dinonaktifkan saat nominal melebihi kas tersedia atau bukti wajib belum ada; "Simpan draf" tetap boleh                                                                              | ASUMSI (Fase 3)    | Poka-yoke di UI; server tetap memvalidasi                                                                                                              | Longgarkan bila tim ingin submit dicoba dan ditolak server                                                       |
| D9  | Satu hari bisa dipilih di filter tanggal (rentang dari hari yang sama)                                                                                                                              | ASUMSI (Fase 2-3)  | Diizinkan                                                                                                                                              | —                                                                                                                |
| D10 | Hapus bukti langsung terkirim ke backend setelah konfirmasi (bukan menunggu tombol simpan); backend tidak mencatat hapus bukti di audit log                                                         | ASUMSI (Fase 3)    | Dialog konfirmasi dan tombol dinonaktifkan saat proses                                                                                                 | Bila ingin "hapus saat simpan", perlu antrean perubahan di form                                                  |
| D11 | Estimasi "kas menurut pembukuan" di form opname dihitung dari saldo fund (pagu dikurangi voucher menunggu dan uang muka beredar) dan diberi label perkiraan; angka resmi dari backend saat disimpan | ASUMSI (Fase 4)    | Sama dengan rumus backend yang teramati                                                                                                                | Bila backend mengubah rumus (misalnya voucher menunggu persetujuan), estimasi bisa berbeda tipis sampai disimpan |
| D12 | Penggantian yang sudah disetujui masih boleh dibatalkan (sebelum dicairkan)                                                                                                                         | ASUMSI (Fase 4)    | Boleh; teramati hanya pembatalan saat berstatus Diajukan                                                                                               | Batasi di `allowedReimbursementActions` bila backend menolak                                                     |
| D13 | Tidak ada rekening bank bawaan di langkah penggantian; pengguna memilih sendiri                                                                                                                     | KEPUTUSAN (Fase 4) | Tanpa nilai karangan, sesuai aturan UI                                                                                                                 | —                                                                                                                |
| D14 | Voucher dan opname disetujui yang tersedia otomatis terpilih di langkah 1 (dapat diubah)                                                                                                            | ASUMSI (Fase 4)    | Semua voucher menunggu dan opname disetujui terbaru                                                                                                    | Ubah satu efek di wizard bila ingin mulai dari kosong                                                            |
| D5  | Istilah di layar: "Penggantian dana" (id) dan "Replenishment" (en)                                                                                                                                  | ASUMSI             | Sesuai glosarium; PRD dan API memakai "reimbursement"                                                                                                  | Ganti satu kunci i18n bila lo mau istilah lain                                                                   |
| D6  | "Uang Muka Karyawan" sebagai label, "kasbon" hanya di teks bantuan                                                                                                                                  | ASUMSI             | Mengikuti glosarium terminologi                                                                                                                        | Ganti kunci i18n                                                                                                 |

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

## Data uji tambahan dari Fase 4 (bagian dari F3)

Opname PCO/0005 (disetujui, diselesaikan) dan PCO/0006 (ditolak); penggantian PCR/0005 (dicairkan, Rp 1.311.000, jurnal dibukukan ke 1-10003) dan PCR/0006 (dibatalkan); voucher PCV/0023 menunggu penggantian. Kas di tangan fund PC-HQ menjadi Rp 4.600.000.

## Fase 5: uang muka karyawan (kasbon)

Selesai: daftar, pengajuan, detail dengan riwayat, setuju/tolak/batal, serah uang, pertanggungjawaban dengan bukti, pilih akun biaya, verifikasi pemegang kas dan keuangan (atau dikembalikan), alih ke piutang, banner status blokir. Diuji langsung di backend asli (pengajuan PCA/0007 dan pertanggungjawaban ulang PCA/0005 oleh pc.staff).

Belum ada UI (hook dan API sudah siap, `useChangeRestriction`): blokir, buka blokir, dan pengecualian oleh pemegang hak kontrol (JP-PC-CTL). Direncanakan bersama Fase 6.

Data uji baru (bagian dari F3): PCA/202610/0007 (menunggu persetujuan, Rp 90.000, pc.staff); PCA/0005 kini berstatus pertanggungjawaban diajukan.

Tidak teruji langsung: langkah verifikasi pemegang kas/keuangan setelah pengajuan ulang, dan alih ke piutang (hanya dialog yang dicek).

## Fase 6: laporan, jejak audit, administrasi dana

Selesai: tab Laporan (umur voucher, ringkasan biaya, uang muka per karyawan, rekonsiliasi, cek akhir periode, jejak audit dengan filter jenis dokumen dan aksi), jejak perubahan di keempat drawer, menu Kelola dana (dana baru, ubah pengaturan, sesuaikan pagu, tutup dana). Tab Laporan dan jejak perubahan hanya tampil untuk pemegang hak baca JP-PC (pc.staff mendapat 403 dari backend tanpa hak itu).

Diuji langsung: kelima laporan; ubah pengaturan dana PC-HQ (hari pertanggungjawaban 7 ke 8 lalu kembali ke 7); sesuaikan pagu PC-HQ naik Rp 100.000 lalu turun kembali lewat 1-10003 (dua jurnal antara 1-10002 dan 1-10003 dengan alasan "TEST PC verifikasi fase 6", bagian dari F3).

Belum diuji tulis: dana baru (validasi form saja) dan tutup dana (tidak bisa dibatalkan); alur ini perlu persetujuan sebelum dicoba di Demo Site. Perhatikan juga: pilihan rekening bank pada form memuat semua akun kas dan bank; belum diketahui apakah backend membatasi jenis akun untuk pendanaan.

Antarmuka blokir, buka blokir, dan pengecualian uang muka ada di Laporan > Uang muka per karyawan > Kelola pengajuan (hak kontrol JP-PC-CTL). Blokir dan buka blokir diuji langsung pada pc.staff (dikembalikan normal). Pengecualian (override) belum teruji karena butuh uang muka yang lewat jatuh tempo; bentuk permintaan `{ until, reason }` mengikuti kontrak Postman.

## Verifikasi alur uang muka (selesai, 2026-10-31)

Alur penuh PCA/0007 lewat UI dengan akun berbeda di tiap langkah: disetujui finance2, diserahkan pc.custodian, dipertanggungjawabkan pc.staff (dengan bukti), akun biaya dan verifikasi oleh pc.custodian, ditutup finance2 (status Selesai, saldo seimbang dengan pagu). Pemisahan tugas terbukti: tiap akun hanya melihat tombol langkahnya.

Temuan yang sudah diperbaiki: tombol pengajuan memanggil status uang muka tanpa hak pengajuan sehingga pemegang kas menerima 403 berulang.

Diperbarui 2026-11-01: semua akun uji memakai `password123`. PCA/0005 ditutup oleh pc.approver (Selesai, sisa belum dipertanggungjawabkan Rp 0, jadi angka Rp 350.000 sebelumnya menunggu verifikasi keuangan). Tombol Kembalikan ke pemohon diuji pada PCA/0008 (dikembalikan pemegang kas, kini berstatus Sudah diterima, Rp 60.000 beredar). Buat dana ditolak backend karena akun 1-10001 bersaldo Rp 600.000 (pendanaan dari bank mensyaratkan saldo 0); tutup dana belum dicoba.

## Ditunda dari tinjauan Fase 3 (dengan alasan)

- Alur ubah-lalu-ajukan dikoordinasi di komponen form (dua mutasi berurutan) dan belum di lapisan `application`. Cukup aman untuk satu alur; pindahkan ke use case bila Fase 4 dan 5 menambah alur multi-langkah serupa.
- **`apiClient` bersama tidak diubah** (keputusan Fase 4): dipakai 18 modul termasuk ekspor/impor Excel, laporan, impor rekening koran dan rekonsiliasi, serta berada di jalur refresh token 401; timeout global berisiko memutus operasi panjang. Gantinya, modul petty cash memberi timeout per permintaan (baca 30 dtk, tulis 60 dtk, unggah 120 dtk); timeout dianggap hasil tidak diketahui sehingga key idempotensi dipertahankan. Bila tim ingin timeout global, perlu uji semua modul itu dan persetujuan.

## Riwayat keputusan

- 2026-10-31: kode prototype, mock, dan dokumen draf lama dihapus atas arahan pemilik produk.
- 2026-10-31: password baru `pc.custodian` diberitahukan pemilik produk (tidak dicatat di repo).
- 2026-10-31: akses tulis ke Demo Site diizinkan pemilik produk untuk seeding dan uji alur.
