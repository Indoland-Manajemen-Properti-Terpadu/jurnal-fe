export const purchasesReceipts = {
  form: {
    titleCreate: 'Catat Penerimaan Barang',
    subtitle: 'Mencatat barang atau jasa yang sudah diterima dari pesanan {number}',
    infoTitle: 'Informasi Penerimaan',
    infoSubtitle: 'Tanggal terima dan nomor surat jalan dari vendor',
    fromOrder: 'Dari pesanan pembelian',
    dateRequired: 'Tanggal penerimaan wajib diisi',
    dateBeforeOrder: 'Tanggal penerimaan tidak boleh sebelum tanggal pesanan',
    deliveryNote: 'Nomor surat jalan',
    deliveryNotePlaceholder: 'Contoh: SJ-0012',
    linesTitle: 'Barang yang Diterima',
    linesSubtitle:
      'Isi jumlah yang diterima kali ini. Kosongkan (0) untuk barang yang belum datang.',
    receiveAll: 'Terima Semua Sisa',
    col: {
      item: 'Barang / Jasa',
      ordered: 'Dipesan',
      received: 'Sudah Diterima',
      remaining: 'Sisa',
      now: 'Diterima Sekarang',
    },
    quantityAria: 'Jumlah diterima untuk {item}',
    overQuantity: 'Maksimal {max}',
    noQuantity: 'Isi jumlah diterima untuk minimal satu barang.',
    noOrderTitle: 'Pesanan belum dipilih',
    noOrderDescription:
      'Penerimaan dicatat dari halaman pesanan pembelian yang sudah disetujui. Buka pesanannya lalu pilih Catat Penerimaan.',
    notReadyTitle: 'Pesanan ini belum bisa menerima barang',
    notReadyDescription:
      'Penerimaan hanya bisa dicatat untuk pesanan yang sudah disetujui dan masih memiliki sisa barang.',
    summaryTitle: 'Ringkasan',
    summaryLines: '{count} baris barang akan dicatat sebagai diterima.',
    summaryNone: 'Belum ada barang yang diisi.',
    impactTitle: 'Dampak akuntansi',
    impactBody:
      'Barang yang diterima langsung diakui sebagai beban atau persediaan, dengan pasangannya di akun Hutang Belum Ditagih. Jurnal dibuat otomatis. Saat tagihan vendor diverifikasi, akun Hutang Belum Ditagih dipindahkan menjadi Hutang Usaha.',
    submit: 'Catat Penerimaan',
  },
  detail: {
    subtitle: 'Penerimaan barang dari {vendor}',
    infoTitle: 'Informasi Penerimaan',
    order: 'Pesanan pembelian',
    viewOrder: 'Lihat pesanan',
    receivedOn: 'Tanggal diterima',
    journalNote: 'Penerimaan ini sudah dijurnal sebagai hutang belum ditagih.',
    linesTitle: 'Barang yang Diterima',
    col: {
      item: 'Barang / Jasa',
      quantity: 'Diterima',
      accrual: 'Nilai Diakui',
    },
    totalAccrual: 'Total nilai diakui',
    void: 'Batalkan Penerimaan',
    voidTitle: 'Batalkan penerimaan',
    voidDescription:
      'Jurnal penerimaan akan dibalik dan jumlah yang diterima pada pesanan berkurang. Penerimaan yang sudah ditagih tidak bisa dibatalkan.',
  },
};
