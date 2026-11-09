export const plannedModules = {
  common: {
    title: 'Modul ini sedang disiapkan',
    subtitle:
      'Menu ini sudah ada di navigasi, tetapi fiturnya belum dibuka. Berikut cakupan yang direncanakan.',
    featuresTitle: 'Rencana cakupan',
    backToDashboard: 'Kembali ke Ringkasan',
  },
  prototype: {
    title: 'Contoh tampilan',
    body: 'Halaman ini masih berupa contoh tampilan. Angka yang tampil belum berasal dari pembukuan Anda dan belum disimpan.',
  },
  modules: {
    expenses: {
      title: 'Biaya',
      description: 'Catat dan kelola pengeluaran operasional perusahaan.',
      features: {
        one: 'Catat biaya harian dengan akun dan pajak',
        two: 'Lampirkan bukti pembayaran',
        three: 'Persetujuan sebelum dibukukan',
        four: 'Laporan biaya per kategori dan periode',
      },
    },
    budgeting: {
      title: 'Anggaran',
      description: 'Susun anggaran per akun dan periode, lalu bandingkan dengan realisasi.',
      features: {
        one: 'Anggaran per akun dan periode',
        two: 'Perbandingan anggaran dengan realisasi',
        three: 'Revisi anggaran dengan riwayat perubahan',
        four: 'Peringatan saat realisasi mendekati batas',
      },
    },
    production: {
      title: 'Produksi',
      description: 'Kelola pesanan produksi dari bahan baku sampai barang jadi.',
      features: {
        one: 'Daftar bahan untuk setiap produk jadi',
        two: 'Pesanan produksi dan statusnya',
        three: 'Pemakaian bahan baku dan hasil produksi',
        four: 'Biaya produksi per pesanan',
      },
    },
    fulfillment: {
      title: 'Pemenuhan',
      description: 'Pantau pemenuhan pesanan sampai barang diterima pelanggan.',
      features: {
        one: 'Daftar pesanan yang siap dikirim',
        two: 'Pengiriman dan surat jalan',
        three: 'Status pengiriman per pesanan',
        four: 'Pemenuhan sebagian dan sisa pesanan',
      },
    },
    warehouses: {
      title: 'Gudang',
      description: 'Kelola lokasi penyimpanan barang dan stok di tiap lokasi.',
      features: {
        one: 'Daftar gudang dan lokasi penyimpanan',
        two: 'Stok per gudang',
        three: 'Gudang utama untuk transaksi',
        four: 'Pindah barang antar gudang',
      },
    },
    stockMovements: {
      title: 'Mutasi Stok',
      description: 'Lihat setiap barang masuk, keluar, dan berpindah.',
      features: {
        one: 'Riwayat barang masuk dan keluar',
        two: 'Asal dokumen setiap mutasi',
        three: 'Saldo stok per produk dan gudang',
        four: 'Nilai persediaan dan jurnalnya',
      },
    },
    stockTake: {
      title: 'Stok Opname',
      description: 'Hitung stok fisik dan samakan dengan catatan pembukuan.',
      features: {
        one: 'Penghitungan stok fisik per gudang',
        two: 'Selisih terhadap catatan',
        three: 'Penyesuaian stok dengan jurnal otomatis',
        four: 'Berita acara opname',
      },
    },
    salesQuotations: {
      title: 'Penawaran',
      description: 'Buat penawaran harga untuk pelanggan sebelum pesanan dibuat.',
      features: {
        one: 'Penawaran dengan masa berlaku',
        two: 'Ubah penawaran menjadi pesanan atau faktur',
        three: 'Status penawaran: dikirim, diterima, ditolak',
        four: 'Riwayat penawaran per pelanggan',
      },
    },
    salesOrders: {
      title: 'Pesanan Penjualan',
      description: 'Catat pesanan pelanggan sebelum barang dikirim dan ditagih.',
      features: {
        one: 'Pesanan dari pelanggan',
        two: 'Ubah pesanan menjadi faktur',
        three: 'Pantau barang yang belum dikirim',
        four: 'Status pesanan dari draf sampai selesai',
      },
    },
    salesPayments: {
      title: 'Pembayaran Masuk',
      description: 'Catat uang yang diterima dari pelanggan dan alokasikan ke faktur.',
      features: {
        one: 'Penerimaan pembayaran per pelanggan',
        two: 'Alokasi ke satu atau beberapa faktur',
        three: 'Uang muka pelanggan',
        four: 'Kwitansi pembayaran',
      },
    },
    salesReturns: {
      title: 'Retur Penjualan',
      description: 'Catat barang yang dikembalikan pelanggan dan koreksi tagihannya.',
      features: {
        one: 'Retur atas faktur yang sudah terbit',
        two: 'Nota kredit untuk pelanggan',
        three: 'Barang kembali ke stok',
        four: 'Pengurangan piutang otomatis',
      },
    },
    receivables: {
      title: 'Piutang Usaha',
      description: 'Pantau tagihan pelanggan yang belum lunas dan umurnya.',
      features: {
        one: 'Piutang per pelanggan',
        two: 'Umur piutang: belum jatuh tempo sampai lebih dari 90 hari',
        three: 'Faktur yang sudah lewat jatuh tempo',
        four: 'Ekspor laporan piutang',
      },
    },
    sites: {
      title: 'Kelola Site',
      description: 'Kelola perusahaan atau lokasi yang memakai aplikasi ini.',
      features: {
        one: 'Daftar site dan statusnya',
        two: 'Tambah dan ubah site',
        three: 'Atur pengguna per site',
        four: 'Pengaturan khusus untuk tiap site',
      },
    },
    accountingPeriods: {
      title: 'Periode Akuntansi',
      description: 'Buka dan kunci periode pembukuan agar angka yang sudah ditutup tidak berubah.',
      features: {
        one: 'Daftar periode dan statusnya',
        two: 'Kunci periode yang sudah selesai',
        three: 'Buka kembali periode dengan alasan',
        four: 'Riwayat pembukaan dan penguncian',
      },
    },
    approvalFlow: {
      title: 'Alur Persetujuan',
      description: 'Tentukan siapa yang menyetujui setiap tahap persetujuan.',
      features: {
        one: 'Tingkat persetujuan berurutan',
        two: 'Peran yang menyetujui di tiap tingkat',
        three: 'Pemisahan tugas antara pembuat dan penyetuju',
        four: 'Berlaku untuk pembelian dan dokumen lain',
      },
    },
  },
};

export default plannedModules;
