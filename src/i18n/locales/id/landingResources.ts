export const landingResources = {
  ebooks: {
    kicker: 'Pusat Edukasi & E-Book Gratis',
    title: 'Tingkatkan Standar Akuntansi Perusahaan Anda dengan Panduan Praktis Terbaik',
    subtitle:
      'Kami menyusun buku panduan eksklusif bersama praktisi senior, auditor, dan controller properti terkemuka di Indonesia. Tersedia gratis untuk mempercepat akselerasi karier dan bisnis Anda.',
    pagesLabel: '{count} Halaman',
    readTimeLabel: '{count} Menit Baca',
    meta: '📄 {pages} • ⏱ {readTime}',
    pdfBadge: 'Format PDF Siap Unduh',
    download: 'Unduh E-Book Gratis',
    items: {
      'property-accounting-2026': {
        tag: 'E-Book Unggulan',
        title: 'Playbook Akuntansi Properti & Bisnis Modern 2026',
        desc: 'Panduan lengkap mengelola penagihan sewa, rekonsiliasi denda otomatis, dan eliminasi selisih kas antara divisi operasional & finance.',
        highlights: {
          first: 'Alur otomatisasi billing tenant tanpa re-input manual',
          second: 'Metode pencegahan selisih kas penerimaan di portal tenant',
          third: 'Standar Chart of Accounts (COA) untuk gedung komersial',
        },
      },
      'psak-ifrs-dictionary': {
        tag: 'Glosarium Finansial',
        title: 'Kamus Lengkap Istilah Finansial PSAK & IFRS (200+ Istilah)',
        desc: 'Referensi dwibahasa praktis untuk staf finance, controller, dan direksi ekspatriat dalam menyusun laporan keuangan berstandar internasional.',
        highlights: {
          first: 'Terjemahan baku istilah akuntansi Indonesia - English',
          second: 'Aturan klasifikasi Aset, Liabilitas, Ekuitas, & Biaya',
          third: 'Penyesuaian PSAK 73 / IFRS 16 untuk sewa guna usaha',
        },
      },
      'bank-recon-mastery': {
        tag: 'Checklist Praktis',
        title: 'Mastering 3-Way Bank Reconciliation: Tutup Buku 4x Lebih Cepat',
        desc: 'Framework langkah demi langkah menyelesaikan rekonsiliasi kas dan tutup buku akhir bulan tanpa lembur dan tanpa selisih Rp 1 pun.',
        highlights: {
          first: 'Teknik matching 3-arah: Rekening Koran vs Ledger vs Faktur',
          second: 'Audit checklist verifikasi saldo awal dan periode lock',
          third: 'Template SOP tutup buku bulanan siap pakai',
        },
      },
    },
    modal: {
      title: 'Unduh E-Book Akuntansi Gratis',
      metaLine: '{pages} • {readTime}',
      intro:
        'Masukkan email perusahaan Anda untuk mendapatkan tautan unduhan instan dalam format PDF langsung ke inbox Anda:',
      emailLabel: 'Email Perusahaan',
      emailPlaceholder: 'nama.anda@perusahaan.com',
      cancel: 'Batal',
      submit: 'Unduh Sekarang (PDF)',
      successTitle: 'E-Book Siap Diunduh!',
      sentBefore: 'Tautan unduhan dokumen',
      sentAfter: 'telah dikirimkan ke',
      openPdf: 'Buka Dokumen PDF Sekarang',
    },
    notify: {
      invalidTitle: 'Email Tidak Valid',
      invalidMessage: 'Silakan masukkan alamat email perusahaan yang valid.',
      sentTitle: 'Tautan Terkirim!',
      sentMessage: 'E-book "{title}" telah dikirim ke {email}.',
      downloadTitle: 'Download Dimulai',
      downloadMessage: 'Mengunduh file {title}.pdf...',
    },
  },

  testimonials: {
    kicker: 'Ulasan & Validasi Pengguna',
    title: 'Dipercaya Lebih dari 2.500+ Pemimpin Keuangan & Pengelola Bisnis',
    subtitle:
      'Dengarkan langsung bagaimana Jurnal ProApps mentransformasi efisiensi operasional dan eliminasi human error di perusahaan terkemuka.',
    items: {
      hendrik: {
        name: 'Hendrik Wijaya, SE, Ak, CA',
        title: 'Group Financial Controller, PT Mega Properti Nusantara',
        quote:
          'Sebelum menggunakan Jurnal ProApps, kami membutuhkan 6 hari hanya untuk mencocokkan pembayaran sewa tenant dari 14 gedung dengan buku besar. Dengan Operational Sync Queue, seluruh transaksi tervalidasi dan siap diposting dalam 30 menit.',
      },
      jessica: {
        name: 'Jessica Clarissa, CPA',
        title: 'Head of Finance & Tax, Urban Living Residence Group',
        quote:
          'Fitur Smart Accounting Fields sangat menyelamatkan kami! Staf junior tidak lagi kebingungan membedakan posisi normal debit atau kredit pada akun kontra. Selama 12 bulan terakhir, audit eksternal Big 4 kami selesai dengan nol temuan.',
      },
      bambang: {
        name: 'Bambang Sudiro',
        title: 'Chief Financial Officer, Cipta Karya Prima Logistik',
        quote:
          'Presisi 4 desimal untuk perhitungan tarif solar dan sewa unit pergudangan adalah pembeda mutlak. Kompetitor lain memotong angka di 2 desimal yang menyebabkan selisih jutaan rupiah setiap bulan. ProApps benar-benar enterprise-grade.',
      },
    },
    badges: {
      iso: {
        title: 'ISO 27001 Certified',
        desc: 'Sertifikasi Keamanan Data Global',
      },
      encryption: {
        title: '256-Bit Financial Encryption',
        desc: 'Enkripsi Setara Perbankan',
      },
      compliance: {
        title: 'Kepatuhan Standar PSAK / IFRS',
        desc: 'Sesuai Pedoman IAI & Dewan Standar',
      },
      uptime: {
        title: '99.99% Cloud Uptime SLA',
        desc: 'Infrastruktur Cloud Berkelanjutan',
      },
    },
  },

  faq: {
    kicker: 'Pertanyaan yang Sering Diajukan',
    title: 'Semua Jawaban untuk Keputusan Finansial Terbaik Anda',
    subtitle:
      'Punya pertanyaan seputar migrasi data, integrasi sistem, atau keamanan pembukuan? Temukan jawabannya di sini.',
    items: {
      migration: {
        question: 'Apakah data dari sistem pembukuan lama atau spreadsheet Excel bisa dipindahkan?',
        answer:
          'Tentu saja. Jurnal ProApps menyediakan modul Import Saldo Awal dan Bagan Akun (COA) berbasis template Excel / CSV yang sangat praktis. Tim onboarding kami juga siap membantu pemetaan (mapping) akun dan validasi saldo penutup tahun lalu agar transisi Anda berjalan mulus tanpa ada angka yang tercecer.',
      },
      operationalSync: {
        question: 'Mengapa Jurnal ProApps jauh lebih unggul untuk bisnis properti dan utilitas?',
        answerBefore:
          'Software akuntansi umum tidak memiliki koneksi asli ke data unit, penyewa (tenant), denda (fine penalties), dan tagihan utilitas. Akibatnya akuntan harus memasukkan nota manual satu per satu yang rawan selisih kas. Di Jurnal ProApps, seluruh event penagihan dan pembayaran tenant portal otomatis masuk ke',
        answerEmphasis: 'Operational Inbound Queue',
        answerAfter: 'untuk ditinjau dan diposting massal dalam 1 klik.',
      },
      pendingChanges: {
        question: 'Bagaimana cara kerja fitur Persetujuan Perubahan Data (Pending Changes)?',
        answerBefore:
          'Jika staf operasional melakukan revisi nominal faktur, pembatalan, atau penyesuaian saldo, perubahan tersebut tidak akan langsung menimpa pembukuan final. Data akan masuk ke menu',
        answerEmphasis: 'Persetujuan Perubahan (Pending Changes)',
        answerAfter:
          'di mana Controller atau Manager Keuangan dapat membandingkan data lama vs baru, melihat nama pemohon, lalu menyetujui atau menolak perubahan dengan catatan resmi.',
      },
      multiDecimal: {
        question: 'Untuk apa fitur presisi 4 desimal digunakan?',
        answer:
          'Dalam transaksi kurs valuta asing (misal USD ke IDR pada kurs Rp 16.240,5512), komoditas cair (seperti bahan bakar dan bahan kimia industri per liter), atau biaya sewa per meter persegi, pembatasan 2 desimal konvensional akan menciptakan selisih pembulatan jutaan rupiah saat dikalikan volume besar. Mesin multi-desimal ProApps menjaga akurasi hingga pecahan terkecil.',
      },
      bilingual: {
        question: 'Apakah laporan keuangan bisa disajikan dalam standar bahasa Inggris (IFRS)?',
        answer:
          'Ya. Dengan fitur 1-Click Dual-Language Switch, Anda bisa beralih secara dinamis antara terminologi akuntansi Indonesia (PSAK) dan Bahasa Inggris (IFRS/GAAP) kapan pun diperlukan. Anda dapat mengekspor Neraca dan Laba Rugi dalam Bahasa Inggris untuk kebutuhan audit internasional atau pelaporan ke pemegang saham asing.',
      },
    },
  },
};

export default landingResources;
