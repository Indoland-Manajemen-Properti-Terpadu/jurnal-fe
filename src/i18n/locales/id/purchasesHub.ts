export const purchasesHub = {
  title: 'Pembelian',
  subtitle:
    'Kelola pembelian dari permintaan, pesanan, penerimaan barang, tagihan vendor hingga pembayaran.',
  refresh: 'Segarkan data',
  createRequest: 'Buat Permintaan Pembelian',
  createAdvance: 'Buat Uang Muka',
  noAccessTitle: 'Anda belum memiliki akses ke Pembelian',
  noAccessDescription: 'Hubungi administrator untuk mendapatkan hak akses pada menu pembelian.',
  tabs: {
    overview: 'Ringkasan',
    requests: 'Permintaan',
    orders: 'Pesanan',
    receipts: 'Penerimaan',
    bills: 'Tagihan',
    payments: 'Pembayaran',
    returns: 'Retur',
  },
  pages: {
    requests: {
      title: 'Permintaan Pembelian',
      description:
        'Ajukan kebutuhan barang atau jasa. Setelah disetujui, permintaan dijadikan pesanan ke vendor.',
    },
    orders: {
      title: 'Pesanan Pembelian',
      description: 'Pesanan ke vendor yang dibuat dari permintaan yang sudah disetujui.',
    },
    receipts: {
      title: 'Penerimaan Barang',
      description: 'Catat barang atau jasa dari vendor yang sudah sampai.',
    },
    bills: {
      title: 'Tagihan Vendor',
      description: 'Tagihan dari vendor. Verifikasi dulu sebelum dibayar.',
    },
    payments: {
      title: 'Pembayaran Pembelian',
      description: 'Voucher pembayaran tagihan dan uang muka ke vendor.',
    },
    returns: {
      title: 'Retur Pembelian',
      description: 'Pengembalian barang ke vendor atas tagihan yang sudah diverifikasi.',
    },
  },
  overview: {
    outstanding: 'Hutang usaha berjalan',
    outstandingHint: 'dari {count} tagihan yang belum lunas',
    overdue: 'Sudah jatuh tempo',
    decisions: 'Menunggu keputusan Anda',
    decisionsHint: 'Dokumen yang bisa Anda setujui atau tolak sekarang',
    readyToPay: 'Siap dibayar',
    readyToPayHint: 'Voucher yang sudah disetujui dan menunggu pembayaran',
    pipelineTitle: 'Alur pembelian',
    pipelineSubtitle: 'Dari permintaan sampai pembayaran. Klik tahap untuk membuka daftarnya.',
    agingTitle: 'Umur hutang',
    aging: {
      current: 'Belum jatuh tempo',
      days1to30: '1–30 hari',
      days31to60: '31–60 hari',
      days61to90: '61–90 hari',
      over90: 'Lebih dari 90 hari',
    },
    overdueShare: '{percent}% dari total hutang',
    showAll: 'Tampilkan semua ({count})',
    seeReport: 'Lihat Laporan Hutang',
    agingSubtitle: 'Sisa hutang menurut lama jatuh tempo',
    decisionType: {
      approveRequest: 'Permintaan',
      approveOrder: 'Pesanan',
      approvePayment: 'Pembayaran',
    },
    workTitle: 'Perlu tindakan',
    workSubtitle:
      'Urutan: keputusan persetujuan, pembayaran, verifikasi, lalu tindak lanjut pesanan.',
    emptyTitle: 'Semua sudah beres',
    emptyDescription: 'Tidak ada dokumen yang menunggu tindakan Anda saat ini.',
    reason: {
      approveRequest: 'Permintaan menunggu persetujuan Anda',
      approveOrder: 'Pesanan menunggu persetujuan Anda',
      approvePayment: 'Pembayaran menunggu persetujuan Anda',
      payVoucher: 'Voucher disetujui, siap dibayar',
      verifyBill: 'Tagihan draf, perlu diverifikasi',
      receiveOrder: 'Pesanan disetujui, menunggu barang',
      billOrder: 'Barang sudah diterima, belum ditagih',
    },
  },
  requests: {
    search: 'Cari nomor, keperluan, atau departemen',
    mode: 'Pengadaan',
    items: 'Item',
    modes: {
      DIRECT: 'Langsung',
      WITH_QUOTATION: 'Dengan penawaran',
    },
    emptyTitle: 'Belum ada permintaan pembelian',
    emptyDescription:
      'Pembelian dimulai dari permintaan. Setelah disetujui, permintaan dijadikan pesanan ke vendor.',
  },
  orders: {
    search: 'Cari nomor pesanan atau vendor',
    expected: 'Perkiraan tiba',
    payable: 'Hutang ke vendor',
    emptyTitle: 'Belum ada pesanan pembelian',
    emptyDescription:
      'Pesanan dibuat dari permintaan pembelian yang sudah disetujui. Buka permintaan tersebut lalu pilih Buat Pesanan.',
  },
  receipts: {
    search: 'Cari nomor penerimaan atau vendor',
    deliveryNote: 'Surat jalan',
    quantity: 'Jumlah diterima',
    emptyTitle: 'Belum ada penerimaan barang',
    emptyDescription:
      'Penerimaan dicatat dari pesanan yang sudah disetujui, saat barang atau jasa sudah sampai.',
  },
  bills: {
    search: 'Cari nomor tagihan, faktur vendor, atau vendor',
    dueDate: 'Jatuh tempo',
    payable: 'Hutang',
    remaining: 'Sisa hutang',
    overdueOnly: 'Hanya yang jatuh tempo',
    emptyTitle: 'Belum ada tagihan vendor',
    emptyDescription:
      'Tagihan dibuat dari pesanan yang barangnya sudah diterima, lalu diverifikasi sebelum dibayar.',
  },
  payments: {
    search: 'Cari nomor voucher, referensi, atau vendor',
    allTypes: 'Semua jenis',
    typeFilter: 'Filter jenis pembayaran',
    types: {
      BILL: 'Tagihan',
      ADVANCE: 'Uang Muka',
    },
    emptyTitle: 'Belum ada voucher pembayaran',
    emptyDescription:
      'Voucher dibuat dari tagihan yang sudah diverifikasi. Anda juga dapat mencatat uang muka ke vendor.',
  },
  returns: {
    search: 'Cari nomor retur atau vendor',
    reason: 'Alasan',
    value: 'Nilai retur',
    emptyTitle: 'Belum ada retur pembelian',
    emptyDescription:
      'Retur dibuat dari tagihan yang sudah diverifikasi bila barang dikembalikan ke vendor.',
  },
};
