export const profile = {
  loading: 'Memuat profil pengguna...',
  header: {
    title: 'Profil Saya',
    description:
      'Kelola informasi akun pengguna, preferensi keamanan sandi, rincian hak akses, dan entitas bisnis aktif Anda.',
    home: 'Beranda',
  },
  hero: {
    defaultName: 'Pengguna',
    defaultRole: 'User',
    verified: 'Terverifikasi',
    unverified: 'Belum Terverifikasi',
    site: 'Site: {name}',
    joined: 'Bergabung: {date}',
    copiedTooltip: 'Tersalin!',
    copyTooltip: 'Salin User ID',
    copied: 'Tersalin',
    copyButton: 'Salin ID Pengguna',
  },
  metrics: {
    accountStatus: 'STATUS AKUN',
    activeVerified: 'Aktif & Terverifikasi',
    activeUnverified: 'Aktif (Belum Verifikasi)',
    authorizationRole: 'PERAN OTORISASI',
    standardRole: 'STANDARD',
    siteEntity: 'ENTITAS SITE',
    defaultSite: 'Utama',
    lastUpdated: 'TERAKHIR DIPERBARUI',
  },
  tabs: {
    personal: 'Informasi Pribadi',
    security: 'Keamanan & Kata Sandi',
    roles: 'Hak Akses & Peran',
    site: 'Site & Entitas Bisnis',
  },
  copyField: {
    copied: 'Tersalin',
    copy: 'Salin',
  },
  personal: {
    title: 'Data Pribadi Pengguna',
    description:
      'Perbarui nama lengkap dan alamat email yang terhubung dengan akun pembukuan Anda.',
    nameLabel: 'Nama Lengkap',
    namePlaceholder: 'Masukkan nama lengkap',
    emailLabel: 'Alamat Email',
    emailPlaceholder: 'nama@email.com',
    emailDescription:
      'Email digunakan untuk autentikasi masuk dan pengiriman notifikasi pembukuan.',
    userIdLabel: 'ID Pengguna (Sistem)',
    cancel: 'Batal',
    save: 'Simpan Perubahan',
    membershipTitle: 'Rincian Keanggotaan',
    registeredDate: 'Tanggal Terdaftar',
    emailStatus: 'Status Email',
    emailVerified: 'Terverifikasi',
    emailUnverified: 'Belum Diverifikasi',
    userRole: 'Role Pengguna',
    defaultRole: 'User',
    defaultSite: 'Site Default',
    integrityTitle: 'Integritas Akun Terjamin',
    integrityText:
      'Setiap transaksi dan jurnal yang Anda catat akan tercatat dalam jejak audit (Audit Trail) sistem demi kepatuhan akuntansi.',
  },
  security: {
    title: 'Perbarui Kata Sandi',
    description: 'Pastikan kata sandi Anda kuat dan tidak digunakan kembali pada aplikasi lain.',
    newPasswordLabel: 'Kata Sandi Baru',
    newPasswordPlaceholder: 'Minimal 8 karakter kombinasi',
    confirmLabel: 'Konfirmasi Kata Sandi Baru',
    confirmPlaceholder: 'Masukkan ulang kata sandi baru',
    checklistTitle: 'STANDAR KEAMANAN KATA SANDI:',
    minLength: 'Panjang minimal 8 karakter',
    hasLetter: 'Mengandung huruf alfabet',
    hasNumber: 'Mengandung angka',
    matches: 'Konfirmasi kata sandi cocok',
    resetInput: 'Reset Input',
    submit: 'Perbarui Kata Sandi',
    sessionTitle: 'Sesi Autentikasi Aktif',
    sessionText:
      'Sesi masuk saat ini dilindungi dengan token JWT Bearer yang diperbarui otomatis secara berkala.',
    encryptionMethod: 'Metode Enkripsi',
    encryptionValue: 'Bearer JWT (HS256)',
    refreshStatus: 'Status Penyegaran Token',
    refreshValue: 'Otomatis Aktif',
    tipsTitle: 'Tips Keamanan Akun',
    tipsText:
      'Jangan pernah memberikan kata sandi atau kredensial akun kepada siapapun. Tim Proapps tidak pernah meminta kata sandi Anda.',
  },
  roles: {
    title: 'Matriks Hak Akses Akuntansi',
    description:
      'Tingkat otorisasi modul pembukuan dan operasional berdasarkan peran akun Anda saat ini.',
    defaultRole: 'PENGGUNA',
    multiModule: 'Akses Multi-Modul',
    accessFull: 'Penuh (Baca & Tulis)',
    accessFullExport: 'Penuh (Eksport & Analisis)',
    accessAdministrator: 'Administrator',
    accessLimited: 'Terbatas',
    modules: {
      ledger: {
        title: 'Buku Besar & Jurnal Umum',
        description: 'Pencatatan jurnal memorial, penyesuaian, dan ringkasan mutasi saldo akun.',
      },
      cashBank: {
        title: 'Kas, Bank & Rekonsiliasi',
        description: 'Impor mutasi rekening koran, pencocokan transaksi bank, dan penarikan kas.',
      },
      sales: {
        title: 'Penjualan & Piutang Dagang',
        description: 'Penerbitan faktur penjualan, pelacakan pelunasan piutang, dan penagihan.',
      },
      purchases: {
        title: 'Pembelian & Hutang Usaha',
        description: 'Faktur pembelian operasional, pembayaran hutang suplier, dan rekap beban.',
      },
      reports: {
        title: 'Laporan Keuangan & Fiskal',
        description: 'Akses laporan laba rugi, neraca saldo, arus kas, dan perubahan modal.',
      },
      masterData: {
        title: 'Master Data & Pengaturan Entitas',
        description: 'Pengelolaan daftar akun COA, termin pembayaran, pajak, dan profil entitas.',
      },
    },
  },
  site: {
    title: 'Informasi Entitas & Site Aktif',
    description:
      'Data entitas pembukuan yang menjadi lingkup kerja operasional akun Anda saat ini.',
    nameLabel: 'Nama Site / Entitas Bisnis',
    defaultName: 'Proapps Accounting',
    idLabel: 'ID Entitas (Sistem)',
    connectionStatus: 'STATUS KONEKSI SITE',
    connected: 'Terhubung & Aktif',
    scope: 'LINGKUP PEMBUKUAN',
    scopeValue: 'Standar SAK & Pajak IDR',
    multiEntityTitle: 'Pengelolaan Multi-Entitas',
    multiEntityText:
      'Sistem akuntansi Proapps mendukung multi-site dan multi-cabang. Akses buku besar dan saldo akun terisolasi sesuai site yang dipilih.',
    switchSiteNote:
      'Untuk pengalihan site atau permintaan akses entitas cabang lain, silakan ajukan ke Superadmin perusahaan.',
  },
  notifications: {
    successTitle: 'Berhasil',
    saved: 'Perubahan profil berhasil disimpan.',
    failedTitle: 'Gagal',
    updateFailed: 'Gagal memperbarui profil',
    validationTitle: 'Validasi Gagal',
    emptyPersonalInfo: 'Nama dan email tidak boleh kosong.',
    passwordTooShort: 'Kata sandi baru minimal harus 8 karakter.',
    passwordMismatch: 'Konfirmasi kata sandi tidak cocok.',
  },
  emptyValue: '-',
};

export default profile;
