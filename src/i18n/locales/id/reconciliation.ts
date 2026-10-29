export const reconciliation = {
  loading: 'Loading data...',
  empty: {
    title: 'Rekonsiliasi Belum Tersedia',
    description:
      'Rekening koran belum diimpor. Import rekening koran terlebih dahulu untuk memulai rekonsiliasi.',
    button: 'Impor Rekening Koran',
  },
  header: {
    source: 'Sumber Data',
    bankStatement: 'Rekening Koran',
    balance: 'Saldo',
    bookkeeping: 'Pembukuan',
    journal: 'Jurnal Transaksi',
  },
  direction: {
    received: 'Diterima',
    sent: 'Dikirim',
  },
  row: {
    matchedCount: 'Cocok dengan {count} Jurnal',
    unmatched: 'Belum dipasangkan',
    journalNumber: 'Jurnal Transaksi #{number}',
    matchedWith: 'Cocok dengan {description}',
    findAndMatch: 'Cari & Cocokkan',
    pickJournal: 'Pilih jurnal untuk dipasangkan',
  },
  actions: {
    reset: 'Reset',
    reconcile: 'Rekonsiliasi',
    reconcileCount: 'Rekonsiliasi ({count})',
    cancel: 'Batal',
  },
  modal: {
    title: 'Cocokkan dengan Rekening Koran',
    searchJournal: 'Cari Jurnal Transaksi',
    searchPlaceholder: 'Cari kode atau nama akun...',
    allDates: 'Semua Tanggal',
    columns: {
      description: 'Deskripsi',
      date: 'Tanggal',
      debit: 'Debit (Dalam Rp)',
      credit: 'Kredit (Dalam Rp)',
    },
    total: 'Total Nominal:',
    selected: 'Dipilih:',
    shortage: 'Kekurangan:',
    excess: 'Kelebihan:',
  },
  confirm: {
    title: 'Rekonsiliasi Rekening Koran',
    message: 'Apakah Anda yakin ingin merekonsiliasi transaksi ini?',
    helper: 'Transaksi yang sudah direkonsiliasi tidak dapat dibatalkan.',
  },
  notifications: {
    successTitle: 'Sukses',
    matched: 'Transaksi berhasil direkonsiliasi',
    failureTitle: 'Gagal',
    matchFailed: 'Gagal melakukan rekonsiliasi',
  },
};
