export const reconciliation = {
  empty: {
    title: 'Rekonsiliasi Belum Tersedia',
    description:
      'Rekening koran belum diimpor. Impor rekening koran terlebih dahulu untuk memulai rekonsiliasi.',
    button: 'Impor Rekening Koran',
  },
  error: {
    title: 'Data rekonsiliasi belum dapat dimuat',
    description: 'Periksa koneksi Anda, lalu coba muat ulang.',
    retry: 'Muat Ulang',
  },
  allMatched: {
    title: 'Semua rekening koran sudah dicocokkan',
    description:
      'Tidak ada baris rekening koran yang menunggu. Impor rekening koran baru untuk melanjutkan.',
  },
  summary: {
    statements: 'Rekening koran belum dicocokkan',
    journals: 'Jurnal belum dicocokkan',
    difference: 'Selisih kedua sisi',
    rows: '{count} baris',
    differenceHint: 'Sisa setelah semua baris dicocokkan',
    differenceZero: 'Kedua sisi seimbang',
  },
  list: {
    title: '{count} baris rekening koran menunggu',
    hint: 'Centang saran yang sudah benar, lalu klik Rekonsiliasi. Baris yang sudah dicocokkan tidak muncul lagi.',
  },
  header: {
    bankStatement: 'Rekening Koran',
  },
  direction: {
    received: 'Diterima',
    sent: 'Dikirim',
  },
  row: {
    select: 'Pilih baris {description}',
    journalNumber: 'Jurnal Transaksi #{number}',
    suggestion: 'Saran jurnal',
    sameDay: 'tanggal sama',
    daysApart: 'selisih {count} hari',
    noSuggestion: 'Belum ada saran jurnal',
    noSuggestionHint: 'Cari jurnalnya dulu sebelum dicentang',
    blockedHint: 'Jurnal ini sudah dipakai baris lain yang dicentang',
    sharedWarning:
      'Jurnal ini juga disarankan untuk baris lain. Satu jurnal hanya bisa dipakai satu baris.',
    findOther: 'Cari jurnal lain',
    findAndMatch: 'Cari & Cocokkan',
    dismiss: 'Abaikan saran ini',
  },
  journals: {
    title: '{count} jurnal belum ada di rekening koran',
    description:
      'Jurnal akun ini yang belum punya pasangan di rekening koran. Biasanya transaksi yang belum tercatat bank.',
    columnDescription: 'Deskripsi',
    date: 'Tanggal',
    debit: 'Debit (Rp)',
    credit: 'Kredit (Rp)',
  },
  actions: {
    selected: '{count} baris dipilih',
    nothingSelected: 'Belum ada baris dipilih',
    restore: 'Tampilkan {count} saran yang diabaikan',
    clear: 'Batal Pilih',
    reconcile: 'Rekonsiliasi',
    reconcileCount: 'Rekonsiliasi ({count})',
    cancel: 'Batal',
  },
  modal: {
    title: 'Cocokkan dengan Rekening Koran',
    searchJournal: 'Cari Jurnal Transaksi',
    searchPlaceholder: 'Cari deskripsi, kode, atau nama akun...',
    allDates: 'Semua Tanggal',
    columns: {
      description: 'Deskripsi',
      date: 'Tanggal',
      debit: 'Debit (Rp)',
      credit: 'Kredit (Rp)',
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
    successTitle: 'Berhasil',
    matched: 'Transaksi berhasil direkonsiliasi',
    failureTitle: 'Gagal',
    reason: {
      amountMismatch:
        'Jumlah jurnal tidak sama dengan jumlah rekening koran. Pilih jurnal lain atau cocokkan secara manual.',
      alreadyReconciled:
        'Jurnal ini sudah dicocokkan dengan baris rekening koran lain. Muat ulang halaman lalu coba lagi.',
      statementNotFound:
        'Baris rekening koran ini sudah dicocokkan atau dihapus. Muat ulang halaman lalu coba lagi.',
      serverError: 'Terjadi gangguan saat merekonsiliasi. Coba lagi beberapa saat.',
      unknown: 'Rekonsiliasi gagal. Periksa pilihan Anda lalu coba lagi.',
    },
  },
};
