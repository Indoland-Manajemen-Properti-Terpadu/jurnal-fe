import { landingPreview } from './landingPreview';
import { landingMarketing } from './landingMarketing';
import { landingResources } from './landingResources';

export const landing = {
  ...landingPreview,
  ...landingMarketing,
  ...landingResources,
  brandName: 'Jurnal ProApps',

  header: {
    badge: 'Enterprise',
    navAdvantages: 'Keunggulan',
    navPreview: 'Live Demo',
    navComparison: 'Komparasi',
    navEbooks: 'E-Book Gratis',
    navTestimonials: 'Ulasan Klien',
    navFaq: 'FAQ',
    login: 'Masuk ke Jurnal',
  },

  hero: {
    ratingStrong: 'Rating 4.9/5',
    ratingRest: 'dari 2.500+ Controller & CFO • Standar PSAK & IFRS',
    titleLead: 'Software Akuntansi Terintegrasi:',
    titleHighlight: 'Sinkronisasi Operasional, Nol Selisih Pembukuan.',
    subtitle:
      'Solusi akuntansi pertama di Indonesia yang menghubungkan pencatatan buku besar langsung dengan antrean persetujuan operasional bisnis & properti. Tutup buku 4x lebih cepat dengan validasi keseimbangan otomatis.',
    ctaStart: 'Mulai Sekarang Gratis',
    ctaDemo: 'Eksplorasi Live Demo',
    ctaEbook: 'Unduh E-Book Akuntansi',
  },

  trust: {
    throughput: {
      label: 'Transaksi Real-time / Jam',
      sub: 'Ditenagai High-Speed Ledger Engine',
    },
    discrepancy: {
      label: 'Pengurangan Selisih Data',
      sub: 'Melalui Operational Inbound Queue',
    },
    closing: {
      label: 'Akselerasi Tutup Buku',
      sub: 'Dari 7 hari kerja menjadi 1-2 hari',
    },
    compliance: {
      label: 'Kepatuhan PSAK & IFRS',
      sub: 'Siap Audit Eksternal & Investor Global',
    },
  },

  cta: {
    title: 'Tingkatkan Akurasi Pembukuan Bisnis Anda ke Tingkat Enterprise',
    text: 'Bergabunglah dengan ribuan akuntan, controller, dan direktur keuangan yang telah meninggalkan kerumitan spreadsheet dan software akuntansi yang terpisah dari operasional.',
    login: 'Masuk ke Jurnal ProApps',
    ebook: 'Unduh E-Book Gratis',
    perkInstall: '✓ Tanpa instalasi rumit',
    perkMigration: '✓ Dukungan migrasi penuh',
    perkGuarantee: '✓ Garansi kepatuhan PSAK',
  },

  footer: {
    tagline:
      'Platform akuntansi dan manajemen buku besar enterprise generasi baru. Terhubung secara native dengan ekosistem operasional properti dan bisnis Indonesia.',
    status: 'Sistem Aktif & Terlindungi SSL 256-Bit',
    productsTitle: 'Produk & Modul',
    products: {
      ledger: 'Jurnal Umum & Buku Besar',
      sync: 'Antrean Sinkronisasi Operasional',
      reconciliation: 'Rekonsiliasi Bank 3-Arah',
      openingBalance: 'Saldo Awal & Kunci Periode',
      reports: 'Laporan Keuangan Real-Time',
    },
    resourcesTitle: 'Edukasi & Sumber Daya',
    resources: {
      playbook: 'Playbook Akuntansi Properti 2026',
      dictionary: 'Kamus Finansial PSAK & IFRS',
      reconciliation: 'Mastering Rekonsiliasi Bank',
      comparison: 'Tabel Komparasi Fitur',
      help: 'Pusat Bantuan & FAQ',
    },
    accessTitle: 'Akses & Keamanan',
    access: {
      login: 'Portal Masuk Klien',
      iso: 'Standar Kepatuhan ISO 27001',
      privacy: 'Kebijakan Privasi Data',
      terms: 'Ketentuan Layanan Enterprise',
    },
    copyright: '© {year} PT ProApps Solusi Digital Indonesia. All rights reserved.',
    madeWith: 'Dibuat dengan standar keunggulan untuk tim keuangan dan akuntansi modern.',
  },
};

export default landing;
