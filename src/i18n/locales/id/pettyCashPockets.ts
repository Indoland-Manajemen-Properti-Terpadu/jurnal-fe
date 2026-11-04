/** Balance pockets of a fund, merged into the `pettyCash` namespace. */
export const pocketNotify = {
  pocketAdded: 'Kantong {{name}} ditambahkan.',
  pocketUpdated: 'Kantong {{name}} diperbarui.',
  pocketTransferred: 'Dana berhasil dipindahkan antar kantong.',
};

export const pocketErrorCodes = {
  INVALID_BANK_ACCOUNT:
    'Rekening bank tidak bisa dipakai untuk transaksi ini. Pilih rekening lain.',
  REIMBURSEMENT_AMOUNT_CHANGED:
    'Nominal penggantian berubah sejak diajukan. Periksa pratinjau terbaru lalu coba lagi.',
  POCKET_NOT_FOUND: 'Kantong tidak ditemukan di kas kecil ini.',
  POCKET_INACTIVE: 'Kantong ini nonaktif dan tidak bisa dipakai untuk transaksi baru.',
  POCKET_BALANCES_REQUIRED: 'Isi saldo setiap kantong non-tunai yang aktif.',
};

export const pettyCashPockets = {
  pocketAdmin: {
    sectionTitle: 'Kantong saldo non-tunai (opsional)',
    sectionHint:
      'Jika sebagian uang kas kecil disimpan di rekening bank kas kecil atau e-wallet / kartu. Semua kantong tetap memakai akun kas kecil yang sama.',
    add: 'Tambah kantong',
    remove: 'Hapus kantong',
    code: 'Kode',
    codePlaceholder: 'mis. BCA',
    type: 'Jenis',
    name: 'Nama',
    namePlaceholder: 'mis. Rekening BCA Kas Kecil',
    provider: 'Bank / penyedia',
    accountNumber: 'Nomor rekening / kartu',
    accountHolder: 'Atas nama',
    share: 'Bagian pagu di kantong ini',
    remainder: 'Sisa pagu sebagai uang tunai:',
    addTitle: 'Tambah kantong',
    addBody:
      'Kantong baru saldonya Rp 0. Isi lewat pindah dana, penyesuaian pagu, atau penggantian dana.',
    addSubmit: 'Tambah kantong',
    editTitle: 'Ubah kantong {{name}}',
    edit: 'Ubah',
    save: 'Simpan',
    active: 'Kantong aktif',
    activeHint:
      'Kantong nonaktif tidak bisa dipakai untuk transaksi baru. Kantong bisa dinonaktifkan bila saldonya Rp 0, dan bisa diaktifkan lagi kapan saja.',
    cannotDeactivate:
      'Kantong ini masih berisi saldo atau kantong tunai. Pindahkan dananya dulu bila ingin menonaktifkan.',
    cashAlwaysOn: 'Kantong tunai selalu aktif.',
    reason: 'Alasan perubahan',
    noChanges: 'Belum ada yang diubah.',
    transfer: 'Pindah dana',
    transferTitle: 'Pindah dana antar kantong',
    transferBody:
      'Tidak ada jurnal karena semua kantong memakai satu akun kas kecil. Biaya admin tarik tunai dicatat sebagai voucher biasa.',
    from: 'Dari kantong',
    to: 'Ke kantong',
    amount: 'Nominal',
    date: 'Tanggal',
    memo: 'Catatan (opsional)',
    available: 'Saldo tersedia {{amount}}',
    transferSubmit: 'Pindahkan',
    paidFrom: 'Dibayar dari kantong',
    paidFromHint: 'Kantong tempat uang untuk pengeluaran ini diambil.',
    insufficientHint: 'Saldo kantong ini belum cukup. Pindahkan dana dulu atau pilih kantong lain.',
    receivedIn: 'Dana diterima di kantong',
    receivedInHint: 'Kantong yang menerima dana penggantian.',
    takenFrom: 'Dana diambil dari kantong',
    addedTo: 'Dana masuk ke kantong',
    cashFrom: 'Uang diambil dari kantong',
    settleVia: 'Sisa atau kekurangan lewat kantong',
    settleViaHint: 'Bawaan: kantong tempat uang muka diberikan.',
    refillTo: 'Dana kas kecil diisi ulang ke kantong',
    issue: {
      REQUIRED: 'Wajib diisi.',
      INVALID_CODE: 'Gunakan 2-20 huruf, angka, - atau _.',
      DUPLICATE_CODE: 'Kode sudah dipakai.',
      NEGATIVE: 'Tidak boleh negatif.',
      WHOLE_NUMBER: 'Harus bilangan bulat.',
      TOO_LARGE: 'Angka terlalu besar.',
      POSITIVE_AMOUNT: 'Harus lebih dari nol.',
      OVER_PAGU: 'Total bagian kantong melebihi pagu.',
      SAME_POCKET: 'Pilih kantong yang berbeda.',
      OVER_BALANCE: 'Nominal melebihi saldo kantong asal.',
      FUTURE_DATE: 'Tanggal tidak boleh di masa depan.',
    },
  },
};
