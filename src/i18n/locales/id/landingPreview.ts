export const landingPreview = {
  preview: {
    kicker: 'Eksplorasi Interaktif',
    title: 'Pengalaman Akuntansi Presisi Tinggi di Ujung Jari Anda',
    subtitle:
      'Klik tab di bawah untuk mencoba fitur eksklusif Jurnal ProApps: mulai dari antrean sinkronisasi operasional hingga simulasi presisi desimal 0-4 digit.',
    company: 'PT Graha Mega Properti Utama',
    connectionStatus: '● Sistem Terkoneksi Realtime',
    tabs: {
      dashboard: 'Dashboard Eksekutif',
      sync: 'Antrean Sinkronisasi Operasional',
      smartJournal: 'Jurnal Cerdas & Saldo Awal (0-4 Desimal)',
      bankReconciliation: 'Rekonsiliasi Bank 3-Arah',
    },

    dashboard: {
      cash: {
        label: 'Total Saldo Kas & Bank',
        trend: '↑ +14.2% dibandingkan bulan sebelumnya',
      },
      revenue: {
        label: 'Pendapatan Sewa & Utilitas',
        trend: '↑ 98.4% tingkat penagihan lancar',
      },
      profit: {
        label: 'Laba Bersih Berjalan',
        trend: '↑ Margin operasional 35.5%',
      },
      ledgerTitle: 'Aktivitas Buku Besar Terbaru (Real-Time Double-Entry Log)',
      autoPosted: 'Auto-Posted by System',
      balancedAmount: 'Rp {amount} [Seimbang]',
      entries: {
        rent: 'Pembayaran Sewa Unit Tower A-1204 (Tenant: PT Mitra Sukses)',
        penalty: 'Pendapatan Denda Keterlambatan Billing Utilitas Gedung B',
        vendor: 'Pembayaran Vendor Maintenance Lift & Eskalator',
      },
    },

    sync: {
      title: 'Pusat Persetujuan Inbound Operasional (Pending Operational Sync)',
      subtitle:
        'Seluruh event transaksi dari billing tenant dan portal operasional disaring di sini sebelum mengikat buku besar.',
      approveAll: 'Setujui & Post Massal',
      syncedAll: 'Tersinkronisasi 100%',
      statusSynced: 'Tersinkron',
      statusPending: 'Menunggu Approval',
      postedTitle: '3 Event Berhasil Diposting!',
      postedMessage: 'Transaksi masuk ke Jurnal Umum & Buku Besar secara seimbang tanpa selisih.',
      resetTitle: 'Simulasi Direset',
      resetMessage: 'Status kembali ke mode antrean pending.',
      columns: {
        eventType: 'TIPE EVENT',
        reference: 'REFERENSI & SUMBER OPERASIONAL',
        accountMapping: 'PEMETAAN AKUN AKUNTANSI',
        amount: 'NOMINAL TRANSAKSI',
        status: 'STATUS',
      },
      items: {
        salePayment: {
          title: 'Invoice #INV-2026-4410',
          subtitle: 'Tenant: PT Citra Mandiri Abadi (Unit B-08)',
          debit: 'Dr 1-1002 Bank BCA',
          credit: 'Cr 1-1201 Piutang Usaha',
        },
        penalty: {
          title: 'Penalty #PEN-2026-092',
          subtitle: 'Keterlambatan Utilitas Unit C-14',
          debit: 'Dr 1-1202 Piutang Denda',
          credit: 'Cr 4-4200 Pendapatan Denda',
        },
        deposit: {
          title: 'Security Deposit #DEP-2026-11',
          subtitle: 'Deposit Jaminan Sewa 1 Tahun',
          debit: 'Dr 1-1003 Bank Mandiri Escrow',
          credit: 'Cr 2-2300 Titipan Uang Jaminan',
        },
      },
    },

    smartJournal: {
      title: 'Jurnal Transaksi Valas & Pembelian Bahan (#JU-2026-095)',
      subtitle:
        'Dilengkapi Micro-Guidance Warna, Validasi Mutual Exclusion, dan Simulasi Presisi Desimal',
      precisionLabel: 'Pilihan Presisi Desimal:',
      precision0: '0 Digit (IDR)',
      precision2: '2 Digit (Standar)',
      precision4: '4 Digit (Valas/Komoditas)',
      colAccount: 'BAGAN AKUN (COA)',
      colDebit: 'DEBIT (RP)',
      colCredit: 'KREDIT (RP)',
      colIndicator: 'INDIKATOR SISTEM',
      totalLabel: 'TOTAL KESEIMBANGAN JURNAL',
      balanced: '100% Seimbang',
      rows: {
        bank: {
          account: '1-1004 Bank CIMB Niaga Valas (USD)',
          note: 'Kurs: Rp 16.240,5512 per USD',
          badge: 'Normal Debit ✓',
        },
        chemicals: {
          account: '1-1502 Biaya Bahan Kimia & Perawatan Unit',
          note: 'Harga satuan per liter terhitung presisi',
          badge: 'Beban Usaha ✓',
        },
        payable: {
          account: '2-2101 Hutang Usaha Vendor Internasional',
          note: 'Term of Payment 30 Hari (Letter of Credit)',
          badge: 'Normal Kredit ✓',
        },
      },
    },

    bankReconciliation: {
      bankBalanceLabel: 'SALDO REKENING KORAN BANK',
      bankBalanceNote: '● Live Bank API Feed Connected',
      glBalanceLabel: 'SALDO BUKU BESAR (GL)',
      glBalanceNote: '● Posting Jurnal Terakhir Hari Ini',
      statusLabel: 'STATUS KELENGKAPAN REKONSILIASI',
      statusValue: 'NOL SELISIH (Rp 0)',
      statusNote: '✓ 384 Transaksi Terkorelasikan 100%',
      algorithmTitle: 'Algoritma Rekonsiliasi Cerdas 3-Arah',
      algorithmDesc:
        'Mencocokkan nomor referensi bank, nominal desimal presisi, dan tanggal valuta otomatis tanpa spreadsheet.',
      printReport: 'Cetak Laporan Rekonsiliasi (PDF)',
    },
  },
};

export default landingPreview;
