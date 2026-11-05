export const salesCommon = {
  common: {
    cancel: 'Batal',
    close: 'Tutup',
    back: 'Kembali',
  },
  status: {
    draft: 'Draf',
    unpaid: 'Belum Lunas',
    paid: 'Lunas',
    overdue: 'Jatuh Tempo',
    void: 'Void',
    partial: 'Sebagian',
    sent: 'Terkirim',
  },
  reason: {
    label: 'Alasan',
    placeholder: 'Tulis alasan singkat (minimal 3 karakter)',
  },
  errors: {
    rejected: 'Permintaan belum dapat diproses. Periksa data faktur, lalu coba lagi.',
    forbidden: 'Anda tidak memiliki hak untuk melakukan tindakan ini.',
    validation: 'Ada data yang belum sesuai. Periksa isian, lalu coba lagi.',
    unauthorized: 'Sesi Anda berakhir. Silakan masuk kembali.',
    notFound: 'Faktur tidak ditemukan atau sudah dihapus.',
    network: 'Koneksi terputus. Periksa jaringan Anda, lalu coba lagi.',
    generic: 'Terjadi kendala. Silakan coba beberapa saat lagi.',
  },
  notify: {
    failedTitle: 'Tindakan belum berhasil',
    draftSaved: 'Draf faktur {number} tersimpan.',
    sent: 'Faktur {number} diterbitkan dan dicatat sebagai piutang usaha.',
    resent: 'Email faktur {number} dikirim ulang.',
    emailNotSent:
      'Faktur tersimpan, tetapi email belum terkirim. Pastikan pelanggan punya alamat email, lalu kirim ulang.',
    updated: 'Perubahan faktur {number} tersimpan.',
    deleted: 'Draf faktur dihapus.',
    voided: 'Faktur {number} di-void.',
    paid: 'Pembayaran faktur dicatat dan masuk ke kas atau bank.',
    linkCopied: 'Tautan faktur disalin.',
    linkFailed: 'Tautan faktur belum dapat dibuat.',
    downloadFailed: 'Berkas PDF belum dapat diunduh.',
  },
};
