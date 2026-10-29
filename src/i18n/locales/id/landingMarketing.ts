export const landingMarketing = {
  advantages: {
    kicker: 'Keunggulan Kompetitif Mutlak',
    title: 'Mengapa Perusahaan Modern Memilih Jurnal ProApps Dibanding Software Akuntansi Umum?',
    subtitle:
      'Software akuntansi konvensional dibangun sebagai alat pencatatan pasif. Jurnal ProApps dirancang sebagai pusat orkestrasi finansial yang menghubungkan operasional lapangan secara real-time.',
    cards: {
      syncQueue: {
        badge: 'Eksklusif',
        title: 'Native Operational Sync Queue',
        text: 'Hilangkan selisih antara tim lapangan dan bagian pembukuan. Tagihan sewa, utilitas, denda keterlambatan (FINE), hingga pembayaran portal tenant mengalir otomatis ke antrean peninjauan akuntan tanpa re-entry manual.',
        benefit: '0% Risiko invoice operasional tercecer',
      },
      approval: {
        badge: 'Kontrol Ketat',
        title: 'Pusat Persetujuan Perubahan Data',
        text: 'Setiap revisi saldo awal, penghapusan jurnal, atau perubahan tarif tidak akan pernah langsung merusak buku besar. Semua perubahan disajikan dalam antrean transparan dengan perbandingan nilai sebelum vs sesudah.',
        benefit: 'Jejak audit lengkap untuk auditor Big 4',
      },
      guided: {
        badge: 'Anti Human-Error',
        title: 'Guided Smart Accounting Fields',
        text: 'Staf finance tidak akan lagi terbalik memasukkan posisi debit atau kredit. Dilengkapi micro-guidance visual, penanda warna lembut (teal untuk debit, indigo untuk kredit), dan peringatan contra-side yang cerdas.',
        benefit: 'Reduksi 99% kesalahan entri jurnal pemula',
      },
      precision: {
        badge: 'Presisi Tinggi',
        title: 'Multi-Decimal Precision Engine (0-4 Digit)',
        text: 'Software umum membatasi angka hanya pada 2 digit desimal. ProApps mendukung presisi hingga 4 desimal untuk kurs valas asing (USD, SGD), biaya bahan kimia per liter, hingga tarif sewa per meter persegi.',
        benefit: 'Hilangkan selisih pembulatan komoditas',
      },
      dualLanguage: {
        badge: 'Standar Global',
        title: 'Instant Dual-Language (PSAK & IFRS)',
        text: 'Beralih antara Bahasa Indonesia (PSAK lokal) dan English (IFRS / GAAP) secara instan dalam 1 klik tanpa perlu memuat ulang sistem. Sangat ideal untuk perusahaan dengan direksi ekspatriat atau investor asing.',
        benefit: 'Laporan bilingual siap presentasi direksi',
      },
      periodLock: {
        badge: 'Keamanan Maksimal',
        title: 'Strict Period Lock & Full Audit Trail',
        text: 'Kunci periode pembukuan yang sudah final untuk mencegah manipulasi angka masa lalu. Dilengkapi riwayat draf saldo awal bertingkat yang mencatat nama pengguna, waktu, dan alasan setiap penyesuaian.',
        benefit: 'Kepatuhan standar keamanan ISO 27001',
      },
    },
  },

  comparison: {
    kicker: 'Tabel Komparasi Fitur',
    title: 'Perbandingan Head-to-Head: Jurnal ProApps vs Software Konvensional',
    subtitle:
      'Lihat secara transparan bagaimana arsitektur ProApps memberikan keunggulan teknis yang nyata bagi efisiensi dan akurasi tim keuangan Anda.',
    colFeature: 'KAPABILITAS / FITUR UTAMA',
    brandTitle: 'JURNAL PROAPPS',
    brandTagline: 'Keunggulan Generasi Baru',
    colCompetitors: 'SOFTWARE AKUNTANSI KONVENSIONAL',
    rows: {
      integration: {
        feature: 'Integrasi Operasional Properti & Tenant',
        desc: 'Sinkronisasi otomatis tagihan sewa, denda keterlambatan (FINE), & pembayaran tenant portal.',
        proApps:
          'Native Operational Sync Queue. Inbound event otomatis disajikan ke antrean persetujuan akuntan tanpa selisih.',
        competitors:
          'Terpisah. Wajib entri ulang secara manual atau membangun webhook custom yang rawan gagal kirim.',
      },
      approvalQueue: {
        feature: 'Pusat Persetujuan Perubahan Data (Approval Queue)',
        desc: 'Kendali atas penyesuaian nominal, pembatalan, dan revisi sebelum masuk buku besar.',
        proApps:
          'Ada antrean khusus dengan perbandingan payload, riwayat revisi, dan bulk-approval 1 klik.',
        competitors:
          'Tidak ada antrean inbound. Perubahan langsung menimpa data lama tanpa jejak audit transparan.',
      },
      inputErrors: {
        feature: 'Pencegahan Kesalahan Input Debit & Kredit',
        desc: 'Panduan visual saat entri jurnal dan penyesuaian saldo awal.',
        proApps:
          'Guided Smart Accounting: Shading warna lembut, mutual exclusion otomatis, dan badge Contra Side.',
        competitors:
          'Grid input generik biasa. Staf rawan salah posisi kolom atau saldo tidak seimbang.',
      },
      decimals: {
        feature: 'Presisi Desimal & Pembulatan (Rounding)',
        desc: 'Fleksibilitas perhitungan kurs valas (USD/SGD), harga per unit, dan komoditas.',
        proApps:
          'Multi-Decimal Precision Engine (0 hingga 4 digit desimal) dengan kalkulasi half-up rounding akurat.',
        competitors:
          'Terkunci hanya 2 digit desimal. Rawan selisih akumulasi komoditas dan selisih kurs valuta asing.',
      },
      language: {
        feature: 'Standar Bahasa & Pelaporan Global',
        desc: 'Kemudahan penyusunan laporan untuk direksi ekspatriat, auditor independen, & investor.',
        proApps:
          'Instant Dual-Language Hot-Switch (PSAK Indonesia & IFRS English) tanpa perlu muat ulang sistem.',
        competitors:
          'Mayoritas hanya Bahasa Indonesia atau membutuhkan deploy terpisah yang berbayar.',
      },
      closing: {
        feature: 'Kecepatan Proses Tutup Buku Akhir Bulan',
        desc: 'Waktu yang dibutuhkan tim finance sejak tanggal 30 hingga laporan siap diaudit.',
        proApps:
          'Tutup buku 4x lebih cepat (Rata-rata 1-2 hari) karena validasi keseimbangan berjalan real-time.',
        competitors:
          '5-7 hari kerja akibat lambatnya rekonsiliasi manual dan penelusuran nota operasional yang tercecer.',
      },
    },
  },
};

export default landingMarketing;
