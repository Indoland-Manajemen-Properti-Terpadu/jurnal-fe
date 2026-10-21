export const dashboard = {
  greetingMorning: 'Selamat pagi',
  greetingAfternoon: 'Selamat siang',
  greetingEvening: 'Selamat sore',
  greetingNight: 'Selamat malam',

  heroSubtitle:
    'Pantau posisi kas, keseimbangan neraca, kualitas piutang, dan aktivitas pembukuan dalam satu ringkasan.',
  spatialModeLabel: 'Mode Spasial 3D',
  spatialModeOn: 'Spasial 3D Aktif',
  spatialModeOff: 'Mode Standar',

  btnCreateJournal: 'Buat Jurnal',
  btnSalesInvoice: 'Faktur Penjualan',
  btnRefresh: 'Muat Ulang',

  periodLockedUntil: 'Periode {{name}} terkunci s.d. {{date}}',
  periodUnlocked: 'Periode pembukuan terbuka (belum dikunci)',

  // Fundamental Accounting Equation
  equationTitle: 'Ringkasan Posisi Keuangan',
  equationBalanced: 'Neraca Seimbang',
  equationUnbalanced: 'Perlu Penyesuaian Saldo',
  totalAssets: 'Total Aset',
  totalAssetsHint: 'Kas, piutang & harta perusahaan',
  totalLiabilities: 'Kewajiban',
  totalLiabilitiesHint: 'Hutang usaha & kewajiban lancar',
  totalEquity: 'Ekuitas',
  totalEquityHint: 'Modal bersih & laba ditahan',
  netWorkingCapital: 'Modal Kerja Bersih',
  equityShare: 'Rasio Ekuitas',
  collectionEfficiency: 'Efektivitas Penagihan',

  // 3D Spatial Canvas
  spatialEngineBadge: 'VISUALISASI NERACA 3D',
  spatialDragHint: 'Geser untuk memutar sudut pandang 3D',
  viewOrbit: 'Orbit 3D',
  viewRadar: 'Radar Atas',
  viewIsometric: 'Isometrik',
  nodeAssets: 'Aset',
  nodeLiabilities: 'Kewajiban',
  nodeEquity: 'Ekuitas',
  nodeCash: 'Likuiditas Kas',

  // Workspace filter tabs
  filterAll: 'Semua Ringkasan',
  filterLiquidity: 'Likuiditas & Neraca',
  filterReceivables: 'Penjualan & Piutang',
  filterOperations: 'Jurnal & Operasional',

  // Section titles
  sectionPulseTitle: 'Indikator Kesehatan Finansial Utama',
  sectionPulseSubtitle: 'Ringkasan metrik likuiditas, tagihan aktif, dan pencapaian omzet berjalan',
  sectionAnalyticsTitle: 'Analitik Arus Tagihan & Kualitas Piutang',
  sectionAnalyticsSubtitle:
    'Perbandingan faktur terbit terhadap kas diterima beserta distribusi umur tagihan',
  sectionBalanceTitle: 'Posisi Kas & Struktur Neraca',
  sectionBalanceSubtitle:
    'Komposisi rekening operasional dan proporsi harta, kewajiban, serta modal',
  sectionOperationsTitle: 'Aktivitas Operasional & Kendali Sistem',
  sectionOperationsSubtitle:
    'Pantau faktur terbaru, jejak audit buku besar, dan pintasan transaksi harian',

  // KPI Tiles
  kpiCashLabel: 'Saldo Kas & Bank',
  kpiCashHint: '{{count}} rekening kas & bank aktif',
  kpiCashDesc: 'Dana likuid siap pakai operasional',
  kpiReceivableLabel: 'Piutang Berjalan',
  kpiReceivableHint: '{{count}} faktur belum lunas',
  kpiReceivableDesc: 'Tagihan pelanggan aktif berjalan',
  kpiOverdueLabel: 'Piutang Jatuh Tempo',
  kpiOverdueHintActive: '{{count}} faktur melewati tempo',
  kpiOverdueHintClear: 'Tidak ada tunggakan jatuh tempo',
  kpiOverdueDesc: 'Tagihan lewat batas waktu bayar',
  kpiRevenueLabel: 'Penjualan Bulan Ini',
  kpiRevenueHint: '{{count}} faktur terbit · {{draft}} draft',
  kpiRevenueDesc: 'Total faktur terbit bulan berjalan',

  // Alerts
  alertTitleOverdue: 'Perhatian: {{count}} Faktur Melewati Jatuh Tempo',
  alertTitlePending: 'Tugas Operasional Menunggu Tindak Lanjut',
  alertOverdueAmount: '{{amount}} tertunggak',
  alertDraftCount: '{{count}} faktur masih berstatus draft',
  alertPendingCount: '{{count}} perubahan menunggu persetujuan',
  alertBtnOverdue: 'Tindak Lanjuti Piutang',
  alertBtnDraft: 'Tinjau Draft',
  alertBtnPending: 'Review Persetujuan',
  healthyBannerTitle: 'Pembukuan & Operasional Terkendali',
  healthyBannerDesc: 'Tidak ada faktur jatuh tempo atau antrean perubahan yang tertunda saat ini.',

  // Charts & Widgets
  trendTitle: 'Tren Penagihan & Penerimaan Kas (6 Bulan)',
  trendSubtitle: 'Perbandingan nilai faktur terbit terhadap pembayaran kas yang diterima',
  collectionBadge: 'Koleksi {{rate}}%',
  legendInvoiced: 'Ditagihkan (Faktur)',
  legendCollected: 'Terbayar (Kas Masuk)',
  summary6mInvoiced: 'Total Ditagihkan (6 Bln)',
  summary6mCollected: 'Total Kas Diterima',
  summary6mUncollected: 'Sisa Belum Tertagih',
  noTrendData: 'Belum ada faktur terbit dalam 6 bulan terakhir.',

  agingTitle: 'Umur Piutang (Receivable Aging)',
  agingSubtitle: 'Klasifikasi sisa tagihan berdasarkan tingkat keterlambatan',
  agingTotalLabel: 'Total Piutang Terbuka',
  agingBucketCurrent: 'Belum jatuh tempo',
  agingBucket1_30: 'Terlambat 1–30 hari',
  agingBucket31_60: 'Terlambat 31–60 hari',
  agingBucket60Plus: 'Terlambat > 60 hari',
  invoiceUnit: 'faktur',

  bankTitle: 'Distribusi Rekening Kas & Bank',
  bankSubtitle: 'Posisi saldo riil pada masing-masing akun kas dan bank operasional',
  btnManageCash: 'Kelola Kas & Bank',
  bankShareOfTotal: '{{pct}}% dari total kas',
  bankEmpty: 'Belum ada rekening kas atau bank yang terdaftar.',

  compositionTitle: 'Komposisi & Anatomi Neraca',
  compositionSubtitleWithDate: 'Posisi keseimbangan neraca per {{date}}',
  compositionSubtitleDefault: 'Proporsi aset lancar, aset tetap, kewajiban, dan ekuitas',
  btnViewBalanceSheet: 'Buka Neraca',
  sliceCurrentAssets: 'Aset Lancar',
  sliceNonCurrentAssets: 'Aset Tidak Lancar',
  sliceLiabilities: 'Kewajiban (Hutang)',
  sliceEquity: 'Ekuitas (Modal)',
  insightWorkingCapitalDesc: 'Selisih Aset Lancar terhadap Kewajiban (cadangan likuiditas bersih)',

  // Tabbed Receivables / Invoices card
  tabTopDebtors: 'Prioritas Penagihan',
  tabRecentInvoices: 'Faktur Terbaru',
  debtorsTitle: 'Pelanggan dengan Piutang Tertinggi',
  debtorsSubtitle: '{{count}} faktur tercatat dalam sistem',
  btnViewAllSales: 'Lihat Penjualan',
  debtorsEmpty: 'Tidak ada piutang pelanggan berjalan.',
  dueDateLabel: 'Jatuh tempo:',
  overdueBadge: 'Tertunggak',
  invoicesEmpty: 'Belum ada faktur penjualan.',

  // Activity Feed
  activityTitle: 'Jejak Audit Buku Besar',
  activitySubtitle: 'Riwayat aktivitas pencatatan dan perubahan jurnal terbaru',
  activityEmpty: 'Belum ada aktivitas jurnal tercatat.',
  actionCreate: 'membuat jurnal',
  actionUpdate: 'mengubah jurnal',
  actionDelete: 'menghapus jurnal',

  // Control Center & Quick Actions
  controlTitle: 'Pusat Kontrol & Pintasan Cepat',
  controlSubtitle: 'Status antrean sistem dan akses instan transaksi harian',
  ctrlPendingChanges: 'Persetujuan Tertunda',
  ctrlDraftInvoices: 'Faktur Berstatus Draft',
  ctrlTotalContacts: 'Total Kontak & Mitra',
  ctrlActivePeriod: 'Periode Pembukuan',
  quickActionsLabel: 'Aksi Transaksi Instan',
  qaGeneralJournal: 'Jurnal Umum',
  qaReceiveMoney: 'Terima Uang',
  qaSendMoney: 'Kirim Uang',
  qaTransferCash: 'Transfer Kas',
};

export default dashboard;
