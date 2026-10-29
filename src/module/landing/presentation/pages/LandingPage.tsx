import { useState } from 'react';
import {
  Accordion,
  Badge,
  Button,
  Group,
  Modal,
  Rating,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconArrowRight,
  IconArrowsExchange,
  IconArrowsLeftRight,
  IconBook2,
  IconBuildingBank,
  IconChartBar,
  IconCheck,
  IconCircleCheckFilled,
  IconClock,
  IconCoins,
  IconDatabase,
  IconDownload,
  IconFileCertificate,
  IconFileSpreadsheet,
  IconHelpCircle,
  IconLanguage,
  IconLayersLinked,
  IconLock,
  IconPercentage,
  IconReceipt,
  IconScale,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
  IconX,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { LanguageSwitcher } from '@/components/LanguageSwitcher/LanguageSwitcher';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import classes from './LandingPage.module.css';

interface EbookItem {
  id: string;
  tag: string;
  title: string;
  desc: string;
  pages: string;
  readTime: string;
  gradient: string;
  highlights: string[];
}

const EBOOKS_DATA: EbookItem[] = [
  {
    id: 'property-accounting-2026',
    tag: 'E-Book Unggulan',
    title: 'Playbook Akuntansi Properti & Bisnis Modern 2026',
    desc: 'Panduan lengkap mengelola penagihan sewa, rekonsiliasi denda otomatis, dan eliminasi selisih kas antara divisi operasional & finance.',
    pages: '48 Halaman',
    readTime: '25 Menit Baca',
    gradient: 'linear-gradient(135deg, #053079, #09B2FF)',
    highlights: [
      'Alur otomatisasi billing tenant tanpa re-input manual',
      'Metode pencegahan selisih kas penerimaan di portal tenant',
      'Standar Chart of Accounts (COA) untuk gedung komersial',
    ],
  },
  {
    id: 'psak-ifrs-dictionary',
    tag: 'Glosarium Finansial',
    title: 'Kamus Lengkap Istilah Finansial PSAK & IFRS (200+ Istilah)',
    desc: 'Referensi dwibahasa praktis untuk staf finance, controller, dan direksi ekspatriat dalam menyusun laporan keuangan berstandar internasional.',
    pages: '36 Halaman',
    readTime: '15 Menit Baca',
    gradient: 'linear-gradient(135deg, #065F46, #10B981)',
    highlights: [
      'Terjemahan baku istilah akuntansi Indonesia - English',
      'Aturan klasifikasi Aset, Liabilitas, Ekuitas, & Biaya',
      'Penyesuaian PSAK 73 / IFRS 16 untuk sewa guna usaha',
    ],
  },
  {
    id: 'bank-recon-mastery',
    tag: 'Checklist Praktis',
    title: 'Mastering 3-Way Bank Reconciliation: Tutup Buku 4x Lebih Cepat',
    desc: 'Framework langkah demi langkah menyelesaikan rekonsiliasi kas dan tutup buku akhir bulan tanpa lembur dan tanpa selisih Rp 1 pun.',
    pages: '32 Halaman',
    readTime: '20 Menit Baca',
    gradient: 'linear-gradient(135deg, #4F46E5, #818CF8)',
    highlights: [
      'Teknik matching 3-arah: Rekening Koran vs Ledger vs Faktur',
      'Audit checklist verifikasi saldo awal dan periode lock',
      'Template SOP tutup buku bulanan siap pakai',
    ],
  },
];

const COMPARISON_ROWS = [
  {
    feature: 'Integrasi Operasional Properti & Tenant',
    desc: 'Sinkronisasi otomatis tagihan sewa, denda keterlambatan (FINE), & pembayaran tenant portal.',
    proApps:
      'Native Operational Sync Queue. Inbound event otomatis disajikan ke antrean persetujuan akuntan tanpa selisih.',
    competitors:
      'Terpisah. Wajib entri ulang secara manual atau membangun webhook custom yang rawan gagal kirim.',
  },
  {
    feature: 'Pusat Persetujuan Perubahan Data (Approval Queue)',
    desc: 'Kendali atas penyesuaian nominal, pembatalan, dan revisi sebelum masuk buku besar.',
    proApps:
      'Ada antrean khusus dengan perbandingan payload, riwayat revisi, dan bulk-approval 1 klik.',
    competitors:
      'Tidak ada antrean inbound. Perubahan langsung menimpa data lama tanpa jejak audit transparan.',
  },
  {
    feature: 'Pencegahan Kesalahan Input Debit & Kredit',
    desc: 'Panduan visual saat entri jurnal dan penyesuaian saldo awal.',
    proApps:
      'Guided Smart Accounting: Shading warna lembut, mutual exclusion otomatis, dan badge Contra Side.',
    competitors:
      'Grid input generik biasa. Staf rawan salah posisi kolom atau saldo tidak seimbang.',
  },
  {
    feature: 'Presisi Desimal & Pembulatan (Rounding)',
    desc: 'Fleksibilitas perhitungan kurs valas (USD/SGD), harga per unit, dan komoditas.',
    proApps:
      'Multi-Decimal Precision Engine (0 hingga 4 digit desimal) dengan kalkulasi half-up rounding akurat.',
    competitors:
      'Terkunci hanya 2 digit desimal. Rawan selisih akumulasi komoditas dan selisih kurs valuta asing.',
  },
  {
    feature: 'Standar Bahasa & Pelaporan Global',
    desc: 'Kemudahan penyusunan laporan untuk direksi ekspatriat, auditor independen, & investor.',
    proApps:
      'Instant Dual-Language Hot-Switch (PSAK Indonesia & IFRS English) tanpa perlu muat ulang sistem.',
    competitors: 'Mayoritas hanya Bahasa Indonesia atau membutuhkan deploy terpisah yang berbayar.',
  },
  {
    feature: 'Kecepatan Proses Tutup Buku Akhir Bulan',
    desc: 'Waktu yang dibutuhkan tim finance sejak tanggal 30 hingga laporan siap diaudit.',
    proApps:
      'Tutup buku 4x lebih cepat (Rata-rata 1-2 hari) karena validasi keseimbangan berjalan real-time.',
    competitors:
      '5-7 hari kerja akibat lambatnya rekonsiliasi manual dan penelusuran nota operasional yang tercecer.',
  },
];

const TESTIMONIALS = [
  {
    name: 'Hendrik Wijaya, SE, Ak, CA',
    title: 'Group Financial Controller, PT Mega Properti Nusantara',
    quote:
      'Sebelum menggunakan Jurnal ProApps, kami membutuhkan 6 hari hanya untuk mencocokkan pembayaran sewa tenant dari 14 gedung dengan buku besar. Dengan Operational Sync Queue, seluruh transaksi tervalidasi dan siap diposting dalam 30 menit.',
    rating: 5,
    avatar: 'HW',
  },
  {
    name: 'Jessica Clarissa, CPA',
    title: 'Head of Finance & Tax, Urban Living Residence Group',
    quote:
      'Fitur Smart Accounting Fields sangat menyelamatkan kami! Staf junior tidak lagi kebingungan membedakan posisi normal debit atau kredit pada akun kontra. Selama 12 bulan terakhir, audit eksternal Big 4 kami selesai dengan nol temuan.',
    rating: 5,
    avatar: 'JC',
  },
  {
    name: 'Bambang Sudiro',
    title: 'Chief Financial Officer, Cipta Karya Prima Logistik',
    quote:
      'Presisi 4 desimal untuk perhitungan tarif solar dan sewa unit pergudangan adalah pembeda mutlak. Kompetitor lain memotong angka di 2 desimal yang menyebabkan selisih jutaan rupiah setiap bulan. ProApps benar-benar enterprise-grade.',
    rating: 5,
    avatar: 'BS',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const { currentLanguage } = useTranslation();

  // Interactive Live Preview State
  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'sync' | 'smartJournal' | 'bankReconciliation'
  >('dashboard');
  const [decimalPrecision, setDecimalPrecision] = useState<0 | 2 | 4>(2);
  const [isDemoSynced, setIsDemoSynced] = useState(false);

  // E-Book Lead Magnet Modal State
  const [ebookModalOpened, setEbookModalOpened] = useState(false);
  const [selectedEbook, setSelectedEbook] = useState<EbookItem | null>(null);
  const [ebookEmail, setEbookEmail] = useState('');
  const [ebookSuccess, setEbookSuccess] = useState(false);

  const goLogin = () => navigate(routes.login);

  const handleOpenEbook = (ebook: EbookItem) => {
    setSelectedEbook(ebook);
    setEbookEmail('');
    setEbookSuccess(false);
    setEbookModalOpened(true);
  };

  const handleDownloadEbook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ebookEmail || !ebookEmail.includes('@')) {
      notifications.show({
        title: 'Email Tidak Valid',
        message: 'Silakan masukkan alamat email perusahaan yang valid.',
        color: 'red',
      });
      return;
    }
    setEbookSuccess(true);
    notifications.show({
      title: 'Tautan Terkirim!',
      message: `E-book "${selectedEbook?.title}" telah dikirim ke ${ebookEmail}.`,
      color: 'teal',
      icon: <IconCheck size={18} />,
    });
  };

  const formatAmount = (val: number) => {
    return val.toLocaleString('id-ID', {
      minimumFractionDigits: decimalPrecision,
      maximumFractionDigits: decimalPrecision,
    });
  };

  return (
    <div className={classes.page}>
      {/* Sticky Header */}
      <header className={classes.header}>
        <div className={`${classes.container} ${classes.headerInner}`}>
          <a href="#top" className={classes.brand}>
            <span className={classes.brandMark}>
              <IconReceipt size={20} stroke={2.2} />
            </span>
            <span>Jurnal ProApps</span>
            <span className={classes.brandBadge}>Enterprise</span>
          </a>

          <nav className={classes.nav}>
            <a href="#advantages" className={classes.navLink}>
              Keunggulan
            </a>
            <a href="#preview" className={classes.navLink}>
              Live Demo
            </a>
            <a href="#comparison" className={classes.navLink}>
              Komparasi
            </a>
            <a href="#ebooks" className={classes.navLink}>
              E-Book Gratis
            </a>
            <a href="#testimonials" className={classes.navLink}>
              Ulasan Klien
            </a>
            <a href="#faq" className={classes.navLink}>
              FAQ
            </a>
          </nav>

          <div className={classes.headerActions}>
            <LanguageSwitcher variant="compact" />
            <Button
              color="primary"
              radius="md"
              size="sm"
              onClick={goLogin}
              style={{ fontWeight: 700 }}
            >
              Masuk ke Jurnal
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="top" className={classes.hero}>
        <div className={classes.heroGlow} />
        <div className={`${classes.container} ${classes.heroContent}`}>
          <div className={classes.ratingBadgeHero}>
            <Rating value={5} readOnly size="xs" color="yellow" />
            <span>
              <strong>Rating 4.9/5</strong> dari 2.500+ Controller & CFO • Standar PSAK & IFRS
            </span>
          </div>

          <h1 className={classes.heroTitle}>
            Software Akuntansi Terintegrasi: <br />
            <span className={classes.gradientText}>
              Sinkronisasi Operasional, Nol Selisih Pembukuan.
            </span>
          </h1>

          <p className={classes.heroSubtitle}>
            Solusi akuntansi pertama di Indonesia yang menghubungkan pencatatan buku besar langsung
            dengan antrean persetujuan operasional bisnis & properti. Tutup buku 4x lebih cepat
            dengan validasi keseimbangan otomatis.
          </p>

          <div className={classes.heroActions}>
            <Button
              size="lg"
              radius="md"
              color="primary"
              rightSection={<IconArrowRight size={18} />}
              onClick={goLogin}
              style={{ fontWeight: 700, padding: '0 28px' }}
            >
              Mulai Sekarang Gratis
            </Button>
            <Button
              size="lg"
              radius="md"
              variant="default"
              component="a"
              href="#preview"
              leftSection={<IconSparkles size={18} color="var(--lp-sky)" />}
              style={{ fontWeight: 600 }}
            >
              Eksplorasi Live Demo
            </Button>
            <Button
              size="lg"
              radius="md"
              variant="subtle"
              color="gray"
              component="a"
              href="#ebooks"
              leftSection={<IconBook2 size={18} />}
              style={{ fontWeight: 600 }}
            >
              Unduh E-Book Akuntansi
            </Button>
          </div>

          {/* Trust Metrics Bar */}
          <div className={classes.trustBar}>
            <div className={classes.trustMetricsGrid}>
              <div className={classes.trustMetricItem}>
                <div className={classes.trustMetricValue}>10.000+</div>
                <div className={classes.trustMetricLabel}>Transaksi Real-time / Jam</div>
                <div className={classes.trustMetricSub}>Ditenagai High-Speed Ledger Engine</div>
              </div>
              <div className={classes.trustMetricItem}>
                <div className={classes.trustMetricValue}>99.4%</div>
                <div className={classes.trustMetricLabel}>Pengurangan Selisih Data</div>
                <div className={classes.trustMetricSub}>Melalui Operational Inbound Queue</div>
              </div>
              <div className={classes.trustMetricItem}>
                <div className={classes.trustMetricValue}>4x</div>
                <div className={classes.trustMetricLabel}>Akselerasi Tutup Buku</div>
                <div className={classes.trustMetricSub}>Dari 7 hari kerja menjadi 1-2 hari</div>
              </div>
              <div className={classes.trustMetricItem}>
                <div className={classes.trustMetricValue}>100%</div>
                <div className={classes.trustMetricLabel}>Kepatuhan PSAK & IFRS</div>
                <div className={classes.trustMetricSub}>Siap Audit Eksternal & Investor Global</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live App Preview Mockup */}
      <section id="preview" className={classes.previewSection}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Eksplorasi Interaktif</span>
            <h2 className={classes.sectionTitle}>
              Pengalaman Akuntansi Presisi Tinggi di Ujung Jari Anda
            </h2>
            <p className={classes.sectionSubtitle}>
              Klik tab di bawah untuk mencoba fitur eksklusif Jurnal ProApps: mulai dari antrean
              sinkronisasi operasional hingga simulasi presisi desimal 0-4 digit.
            </p>
          </div>

          <div className={classes.previewShell}>
            <div className={classes.windowCard}>
              {/* Window Header Bar */}
              <div className={classes.windowHeaderBar}>
                <div className={classes.windowDots}>
                  <span className={`${classes.windowDot} ${classes.windowDotRed}`} />
                  <span className={`${classes.windowDot} ${classes.windowDotYellow}`} />
                  <span className={`${classes.windowDot} ${classes.windowDotGreen}`} />
                </div>
                <div className={classes.windowTitle}>
                  <span>app.jurnalproapps.com</span>
                  <span style={{ color: '#cbd5e1' }}>/</span>
                  <span className={classes.windowPill}>
                    <IconBuildingBank size={13} color="var(--lp-navy)" /> PT Graha Mega Properti
                    Utama
                  </span>
                </div>
                <Badge size="sm" variant="light" color="teal">
                  ● Sistem Terkoneksi Realtime
                </Badge>
              </div>

              {/* Preview Navigation Tabs */}
              <div className={classes.previewTabsBar}>
                <button
                  type="button"
                  className={`${classes.previewTabBtn} ${activeTab === 'dashboard' ? classes.previewTabBtnActive : ''}`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  <IconChartBar size={16} /> Dashboard Eksekutif
                </button>
                <button
                  type="button"
                  className={`${classes.previewTabBtn} ${activeTab === 'sync' ? classes.previewTabBtnActive : ''}`}
                  onClick={() => setActiveTab('sync')}
                >
                  <IconLayersLinked size={16} /> Antrean Sinkronisasi Operasional
                  <Badge size="xs" color="blue" circle>
                    3
                  </Badge>
                </button>
                <button
                  type="button"
                  className={`${classes.previewTabBtn} ${activeTab === 'smartJournal' ? classes.previewTabBtnActive : ''}`}
                  onClick={() => setActiveTab('smartJournal')}
                >
                  <IconScale size={16} /> Jurnal Cerdas & Saldo Awal (0-4 Desimal)
                </button>
                <button
                  type="button"
                  className={`${classes.previewTabBtn} ${activeTab === 'bankReconciliation' ? classes.previewTabBtnActive : ''}`}
                  onClick={() => setActiveTab('bankReconciliation')}
                >
                  <IconArrowsExchange size={16} /> Rekonsiliasi Bank 3-Arah
                </button>
              </div>

              {/* Tab Content 1: Dashboard Eksekutif */}
              {activeTab === 'dashboard' && (
                <div className={classes.previewBody}>
                  <div className={classes.previewKpiGrid}>
                    <div className={`${classes.previewKpiCard} ${classes.previewKpiCardHighlight}`}>
                      <div className={classes.previewKpiLabel}>Total Saldo Kas & Bank</div>
                      <div className={classes.previewKpiValue}>Rp 4.821.500.000</div>
                      <div className={`${classes.previewKpiTrend} ${classes.debitAmount}`}>
                        ↑ +14.2% dibandingkan bulan sebelumnya
                      </div>
                    </div>
                    <div className={classes.previewKpiCard}>
                      <div className={classes.previewKpiLabel}>Pendapatan Sewa & Utilitas</div>
                      <div className={classes.previewKpiValue}>Rp 1.642.800.000</div>
                      <div className={`${classes.previewKpiTrend} ${classes.debitAmount}`}>
                        ↑ 98.4% tingkat penagihan lancar
                      </div>
                    </div>
                    <div className={classes.previewKpiCard}>
                      <div className={classes.previewKpiLabel}>Laba Bersih Berjalan</div>
                      <div className={classes.previewKpiValue}>Rp 584.250.000</div>
                      <div className={`${classes.previewKpiTrend} ${classes.debitAmount}`}>
                        ↑ Margin operasional 35.5%
                      </div>
                    </div>
                  </div>

                  <div
                    style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 18 }}
                  >
                    <Group justify="space-between" mb="xs">
                      <Text fw={700} fz="sm">
                        Aktivitas Buku Besar Terbaru (Real-Time Double-Entry Log)
                      </Text>
                      <Badge variant="outline" color="blue" size="xs">
                        Auto-Posted by System
                      </Badge>
                    </Group>
                    <div style={{ display: 'grid', gap: 8, fontSize: 13 }}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: 6,
                        }}
                      >
                        <span>
                          <strong>#JU-2026-0812</strong> Pembayaran Sewa Unit Tower A-1204 (Tenant:
                          PT Mitra Sukses)
                        </span>
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          Rp 45.000.000 [Seimbang]
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: 6,
                        }}
                      >
                        <span>
                          <strong>#JU-2026-0811</strong> Pendapatan Denda Keterlambatan Billing
                          Utilitas Gedung B
                        </span>
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          Rp 3.500.000 [Seimbang]
                        </span>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: '#f8fafc',
                          borderRadius: 6,
                        }}
                      >
                        <span>
                          <strong>#JU-2026-0810</strong> Pembayaran Vendor Maintenance Lift &
                          Eskalator
                        </span>
                        <span style={{ fontWeight: 700, color: '#047857' }}>
                          Rp 18.250.000 [Seimbang]
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Operational Sync Queue (Killer Differentiator) */}
              {activeTab === 'sync' && (
                <div className={classes.previewBody}>
                  <div style={{ marginBottom: 16 }}>
                    <Group justify="space-between" align="center">
                      <div>
                        <Text fw={800} fz="md" c="dark.8">
                          Pusat Persetujuan Inbound Operasional (Pending Operational Sync)
                        </Text>
                        <Text fz="xs" c="dimmed">
                          Seluruh event transaksi dari billing tenant dan portal operasional
                          disaring di sini sebelum mengikat buku besar.
                        </Text>
                      </div>
                      <Button
                        size="xs"
                        color={isDemoSynced ? 'teal' : 'primary'}
                        leftSection={
                          isDemoSynced ? <IconCheck size={14} /> : <IconLayersLinked size={14} />
                        }
                        onClick={() => {
                          setIsDemoSynced(!isDemoSynced);
                          notifications.show({
                            title: !isDemoSynced
                              ? '3 Event Berhasil Diposting!'
                              : 'Simulasi Direset',
                            message: !isDemoSynced
                              ? 'Transaksi masuk ke Jurnal Umum & Buku Besar secara seimbang tanpa selisih.'
                              : 'Status kembali ke mode antrean pending.',
                            color: 'teal',
                          });
                        }}
                      >
                        {isDemoSynced ? 'Tersinkronisasi 100%' : 'Setujui & Post Massal'}
                      </Button>
                    </Group>
                  </div>

                  <div className={classes.syncQueueHeader}>
                    <Text fw={700} fz="xs" c="dimmed">
                      TIPE EVENT
                    </Text>
                    <Text fw={700} fz="xs" c="dimmed">
                      REFERENSI & SUMBER OPERASIONAL
                    </Text>
                    <Text fw={700} fz="xs" c="dimmed">
                      PEMETAAN AKUN AKUNTANSI
                    </Text>
                    <Text fw={700} fz="xs" c="dimmed" ta="right">
                      NOMINAL TRANSAKSI
                    </Text>
                    <Text fw={700} fz="xs" c="dimmed" ta="center">
                      STATUS
                    </Text>
                  </div>

                  <div className={classes.syncQueueItem}>
                    <Badge color="blue" variant="light" size="sm">
                      SALE_PAYMENT
                    </Badge>
                    <div>
                      <Text fw={700} fz="xs">
                        Invoice #INV-2026-4410
                      </Text>
                      <Text fz={11} c="dimmed">
                        Tenant: PT Citra Mandiri Abadi (Unit B-08)
                      </Text>
                    </div>
                    <div>
                      <Text fz={11} fw={600}>
                        Dr 1-1002 Bank BCA
                      </Text>
                      <Text fz={11} c="dimmed">
                        Cr 1-1201 Piutang Usaha
                      </Text>
                    </div>
                    <Text fw={750} fz="xs" ta="right">
                      Rp 78.500.000
                    </Text>
                    <div style={{ textAlign: 'center' }}>
                      <span
                        className={
                          isDemoSynced ? classes.syncStatusApproved : classes.syncStatusPending
                        }
                      >
                        {isDemoSynced ? 'Tersinkron' : 'Menunggu Approval'}
                      </span>
                    </div>
                  </div>

                  <div className={classes.syncQueueItem}>
                    <Badge color="orange" variant="light" size="sm">
                      FINE / PENALTY
                    </Badge>
                    <div>
                      <Text fw={700} fz="xs">
                        Penalty #PEN-2026-092
                      </Text>
                      <Text fz={11} c="dimmed">
                        Keterlambatan Utilitas Unit C-14
                      </Text>
                    </div>
                    <div>
                      <Text fz={11} fw={600}>
                        Dr 1-1202 Piutang Denda
                      </Text>
                      <Text fz={11} c="dimmed">
                        Cr 4-4200 Pendapatan Denda
                      </Text>
                    </div>
                    <Text fw={750} fz="xs" ta="right">
                      Rp 4.250.000
                    </Text>
                    <div style={{ textAlign: 'center' }}>
                      <span
                        className={
                          isDemoSynced ? classes.syncStatusApproved : classes.syncStatusPending
                        }
                      >
                        {isDemoSynced ? 'Tersinkron' : 'Menunggu Approval'}
                      </span>
                    </div>
                  </div>

                  <div className={classes.syncQueueItem}>
                    <Badge color="teal" variant="light" size="sm">
                      DEPOSIT_ESCROW
                    </Badge>
                    <div>
                      <Text fw={700} fz="xs">
                        Security Deposit #DEP-2026-11
                      </Text>
                      <Text fz={11} c="dimmed">
                        Deposit Jaminan Sewa 1 Tahun
                      </Text>
                    </div>
                    <div>
                      <Text fz={11} fw={600}>
                        Dr 1-1003 Bank Mandiri Escrow
                      </Text>
                      <Text fz={11} c="dimmed">
                        Cr 2-2300 Titipan Uang Jaminan
                      </Text>
                    </div>
                    <Text fw={750} fz="xs" ta="right">
                      Rp 120.000.000
                    </Text>
                    <div style={{ textAlign: 'center' }}>
                      <span
                        className={
                          isDemoSynced ? classes.syncStatusApproved : classes.syncStatusPending
                        }
                      >
                        {isDemoSynced ? 'Tersinkron' : 'Menunggu Approval'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 3: Smart Journal & Multi-Decimal Precision */}
              {activeTab === 'smartJournal' && (
                <div className={classes.previewBody}>
                  <div className={classes.smartJournalCard}>
                    <div className={classes.smartJournalToolbar}>
                      <div>
                        <Text fw={750} fz="xs" c="dark.8">
                          Jurnal Transaksi Valas & Pembelian Bahan (#JU-2026-095)
                        </Text>
                        <Text fz={11} c="dimmed">
                          Dilengkapi Micro-Guidance Warna, Validasi Mutual Exclusion, dan Simulasi
                          Presisi Desimal
                        </Text>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Text fz={11} fw={600} c="dimmed">
                          Pilihan Presisi Desimal:
                        </Text>
                        <div className={classes.smartPrecisionToggle}>
                          <button
                            type="button"
                            className={`${classes.precisionBtn} ${decimalPrecision === 0 ? classes.precisionBtnActive : ''}`}
                            onClick={() => setDecimalPrecision(0)}
                          >
                            0 Digit (IDR)
                          </button>
                          <button
                            type="button"
                            className={`${classes.precisionBtn} ${decimalPrecision === 2 ? classes.precisionBtnActive : ''}`}
                            onClick={() => setDecimalPrecision(2)}
                          >
                            2 Digit (Standar)
                          </button>
                          <button
                            type="button"
                            className={`${classes.precisionBtn} ${decimalPrecision === 4 ? classes.precisionBtnActive : ''}`}
                            onClick={() => setDecimalPrecision(4)}
                          >
                            4 Digit (Valas/Komoditas)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 140px',
                        padding: '10px 18px',
                        background: '#f8fafc',
                        borderBottom: '1px solid var(--lp-line)',
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#64748b',
                      }}
                    >
                      <span>BAGAN AKUN (COA)</span>
                      <span style={{ textAlign: 'right' }}>DEBIT (RP)</span>
                      <span style={{ textAlign: 'right' }}>KREDIT (RP)</span>
                      <span style={{ textAlign: 'center' }}>INDIKATOR SISTEM</span>
                    </div>

                    <div className={`${classes.journalRow} ${classes.journalRowDebit}`}>
                      <div>
                        <Text fw={700} fz="xs">
                          1-1004 Bank CIMB Niaga Valas (USD)
                        </Text>
                        <Text fz={11} c="dimmed">
                          Kurs: Rp 16.240,5512 per USD
                        </Text>
                      </div>
                      <div className={classes.debitAmount}>Rp {formatAmount(81202756.245)}</div>
                      <div style={{ textAlign: 'right', color: '#94a3b8' }}>—</div>
                      <div style={{ textAlign: 'center' }}>
                        <Badge size="xs" color="teal" variant="light">
                          Normal Debit ✓
                        </Badge>
                      </div>
                    </div>

                    <div className={`${classes.journalRow} ${classes.journalRowDebit}`}>
                      <div>
                        <Text fw={700} fz="xs">
                          1-1502 Biaya Bahan Kimia & Perawatan Unit
                        </Text>
                        <Text fz={11} c="dimmed">
                          Harga satuan per liter terhitung presisi
                        </Text>
                      </div>
                      <div className={classes.debitAmount}>Rp {formatAmount(44197243.755)}</div>
                      <div style={{ textAlign: 'right', color: '#94a3b8' }}>—</div>
                      <div style={{ textAlign: 'center' }}>
                        <Badge size="xs" color="teal" variant="light">
                          Beban Usaha ✓
                        </Badge>
                      </div>
                    </div>

                    <div className={`${classes.journalRow} ${classes.journalRowCredit}`}>
                      <div>
                        <Text fw={700} fz="xs">
                          2-2101 Hutang Usaha Vendor Internasional
                        </Text>
                        <Text fz={11} c="dimmed">
                          Term of Payment 30 Hari (Letter of Credit)
                        </Text>
                      </div>
                      <div style={{ textAlign: 'right', color: '#94a3b8' }}>—</div>
                      <div className={classes.creditAmount}>Rp {formatAmount(125400000.0)}</div>
                      <div style={{ textAlign: 'center' }}>
                        <Badge size="xs" color="indigo" variant="light">
                          Normal Kredit ✓
                        </Badge>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '2fr 1fr 1fr 140px',
                        padding: '12px 18px',
                        background: 'rgb(5 48 121 / 5%)',
                        fontSize: 13,
                        fontWeight: 800,
                        color: 'var(--lp-navy)',
                      }}
                    >
                      <span>TOTAL KESEIMBANGAN JURNAL</span>
                      <span style={{ textAlign: 'right', color: '#047857' }}>
                        Rp {formatAmount(125400000.0)}
                      </span>
                      <span style={{ textAlign: 'right', color: '#4338ca' }}>
                        Rp {formatAmount(125400000.0)}
                      </span>
                      <div style={{ textAlign: 'center' }}>
                        <Badge size="sm" color="teal" variant="filled">
                          100% Seimbang
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 4: Rekonsiliasi Bank 3-Arah */}
              {activeTab === 'bankReconciliation' && (
                <div className={classes.previewBody}>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: 16,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 14 }}
                    >
                      <Text fz={11} fw={700} c="dimmed">
                        SALDO REKENING KORAN BANK
                      </Text>
                      <Text fz={20} fw={800} mt={4}>
                        Rp 3.450.210.000
                      </Text>
                      <Text fz={11} c="teal" mt={4}>
                        ● Live Bank API Feed Connected
                      </Text>
                    </div>
                    <div
                      style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 14 }}
                    >
                      <Text fz={11} fw={700} c="dimmed">
                        SALDO BUKU BESAR (GL)
                      </Text>
                      <Text fz={20} fw={800} mt={4}>
                        Rp 3.450.210.000
                      </Text>
                      <Text fz={11} c="teal" mt={4}>
                        ● Posting Jurnal Terakhir Hari Ini
                      </Text>
                    </div>
                    <div
                      style={{
                        border: '1px solid rgb(5 150 105 / 30%)',
                        background: '#ecfdf5',
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <Text fz={11} fw={700} c="teal">
                        STATUS KELENGKAPAN REKONSILIASI
                      </Text>
                      <Text fz={20} fw={800} c="teal" mt={4}>
                        NOL SELISIH (Rp 0)
                      </Text>
                      <Text fz={11} c="teal" mt={4}>
                        ✓ 384 Transaksi Terkorelasikan 100%
                      </Text>
                    </div>
                  </div>

                  <div
                    style={{
                      border: '1px solid var(--lp-line)',
                      borderRadius: 10,
                      padding: 16,
                      background: '#f8fafc',
                    }}
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="xs">
                        <ThemeIcon size="md" color="teal" radius="xl" variant="light">
                          <IconCheck size={16} />
                        </ThemeIcon>
                        <div>
                          <Text fw={750} fz="xs">
                            Algoritma Rekonsiliasi Cerdas 3-Arah
                          </Text>
                          <Text fz={11} c="dimmed">
                            Mencocokkan nomor referensi bank, nominal desimal presisi, dan tanggal
                            valuta otomatis tanpa spreadsheet.
                          </Text>
                        </div>
                      </Group>
                      <Button size="xs" variant="outline" color="blue">
                        Cetak Laporan Rekonsiliasi (PDF)
                      </Button>
                    </Group>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 6 Killer Differentiator Cards */}
      <section id="advantages" className={classes.sectionAlt}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Keunggulan Kompetitif Mutlak</span>
            <h2 className={classes.sectionTitle}>
              Mengapa Perusahaan Modern Memilih Jurnal ProApps Dibanding Software Akuntansi Umum?
            </h2>
            <p className={classes.sectionSubtitle}>
              Software akuntansi konvensional dibangun sebagai alat pencatatan pasif. Jurnal ProApps
              dirancang sebagai pusat orkestrasi finansial yang menghubungkan operasional lapangan
              secara real-time.
            </p>
          </div>

          <div className={classes.diffCardsGrid}>
            {/* Card 1 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Eksklusif</span>
              <div className={classes.diffCardIconWrapper}>
                <IconLayersLinked size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Native Operational Sync Queue</h3>
              <p className={classes.diffCardText}>
                Hilangkan selisih antara tim lapangan dan bagian pembukuan. Tagihan sewa, utilitas,
                denda keterlambatan (FINE), hingga pembayaran portal tenant mengalir otomatis ke
                antrean peninjauan akuntan tanpa re-entry manual.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> 0% Risiko invoice operasional tercecer
              </div>
            </div>

            {/* Card 2 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Kontrol Ketat</span>
              <div className={classes.diffCardIconWrapper}>
                <IconShieldCheck size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Pusat Persetujuan Perubahan Data</h3>
              <p className={classes.diffCardText}>
                Setiap revisi saldo awal, penghapusan jurnal, atau perubahan tarif tidak akan pernah
                langsung merusak buku besar. Semua perubahan disajikan dalam antrean transparan
                dengan perbandingan nilai sebelum vs sesudah.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> Jejak audit lengkap untuk auditor Big 4
              </div>
            </div>

            {/* Card 3 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Anti Human-Error</span>
              <div className={classes.diffCardIconWrapper}>
                <IconScale size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Guided Smart Accounting Fields</h3>
              <p className={classes.diffCardText}>
                Staf finance tidak akan lagi terbalik memasukkan posisi debit atau kredit.
                Dilengkapi micro-guidance visual, penanda warna lembut (teal untuk debit, indigo
                untuk kredit), dan peringatan contra-side yang cerdas.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> Reduksi 99% kesalahan entri jurnal pemula
              </div>
            </div>

            {/* Card 4 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Presisi Tinggi</span>
              <div className={classes.diffCardIconWrapper}>
                <IconCoins size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Multi-Decimal Precision Engine (0-4 Digit)</h3>
              <p className={classes.diffCardText}>
                Software umum membatasi angka hanya pada 2 digit desimal. ProApps mendukung presisi
                hingga 4 desimal untuk kurs valas asing (USD, SGD), biaya bahan kimia per liter,
                hingga tarif sewa per meter persegi.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> Hilangkan selisih pembulatan komoditas
              </div>
            </div>

            {/* Card 5 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Standar Global</span>
              <div className={classes.diffCardIconWrapper}>
                <IconLanguage size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Instant Dual-Language (PSAK & IFRS)</h3>
              <p className={classes.diffCardText}>
                Beralih antara Bahasa Indonesia (PSAK lokal) dan English (IFRS / GAAP) secara instan
                dalam 1 klik tanpa perlu memuat ulang sistem. Sangat ideal untuk perusahaan dengan
                direksi ekspatriat atau investor asing.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> Laporan bilingual siap presentasi direksi
              </div>
            </div>

            {/* Card 6 */}
            <div className={classes.diffCard}>
              <span className={classes.diffCardBadge}>Keamanan Maksimal</span>
              <div className={classes.diffCardIconWrapper}>
                <IconLock size={26} stroke={2} />
              </div>
              <h3 className={classes.diffCardTitle}>Strict Period Lock & Full Audit Trail</h3>
              <p className={classes.diffCardText}>
                Kunci periode pembukuan yang sudah final untuk mencegah manipulasi angka masa lalu.
                Dilengkapi riwayat draf saldo awal bertingkat yang mencatat nama pengguna, waktu,
                dan alasan setiap penyesuaian.
              </p>
              <div className={classes.diffCardBenefit}>
                <IconCircleCheckFilled size={16} /> Kepatuhan standar keamanan ISO 27001
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Head-to-Head Comparison Table */}
      <section id="comparison" className={classes.section}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Tabel Komparasi Fitur</span>
            <h2 className={classes.sectionTitle}>
              Perbandingan Head-to-Head: Jurnal ProApps vs Software Konvensional
            </h2>
            <p className={classes.sectionSubtitle}>
              Lihat secara transparan bagaimana arsitektur ProApps memberikan keunggulan teknis yang
              nyata bagi efisiensi dan akurasi tim keuangan Anda.
            </p>
          </div>

          <div className={classes.comparisonTableWrapper}>
            <table className={classes.comparisonTable}>
              <thead>
                <tr>
                  <th style={{ width: '32%' }}>KAPABILITAS / FITUR UTAMA</th>
                  <th className={classes.comparisonColHighlightHead} style={{ width: '38%' }}>
                    <Group gap="xs">
                      <span
                        className={classes.brandMark}
                        style={{ width: 28, height: 28, borderRadius: 6 }}
                      >
                        <IconReceipt size={16} stroke={2} />
                      </span>
                      <div>
                        <div style={{ color: 'var(--lp-navy)', fontWeight: 800 }}>
                          JURNAL PROAPPS
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--lp-sky)', fontWeight: 600 }}>
                          Keunggulan Generasi Baru
                        </div>
                      </div>
                    </Group>
                  </th>
                  <th style={{ width: '30%', color: '#64748b' }}>
                    SOFTWARE AKUNTANSI KONVENSIONAL
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.feature}>
                    <td>
                      <div className={classes.comparisonFeatureTitle}>{row.feature}</div>
                      <div className={classes.comparisonFeatureDesc}>{row.desc}</div>
                    </td>
                    <td className={classes.comparisonColHighlight}>
                      <div className={classes.comparisonStatusPro}>
                        <ThemeIcon
                          color="teal"
                          size="sm"
                          radius="xl"
                          variant="filled"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        >
                          <IconCheck size={14} stroke={3} />
                        </ThemeIcon>
                        <span>{row.proApps}</span>
                      </div>
                    </td>
                    <td>
                      <div className={classes.comparisonStatusGeneric}>
                        <ThemeIcon
                          color="gray"
                          size="sm"
                          radius="xl"
                          variant="light"
                          style={{ flexShrink: 0, marginTop: 2 }}
                        >
                          <IconX size={14} stroke={2.5} />
                        </ThemeIcon>
                        <span>{row.competitors}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* E-Book & Free Accounting Resources Center */}
      <section id="ebooks" className={classes.sectionAlt}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Pusat Edukasi & E-Book Gratis</span>
            <h2 className={classes.sectionTitle}>
              Tingkatkan Standar Akuntansi Perusahaan Anda dengan Panduan Praktis Terbaik
            </h2>
            <p className={classes.sectionSubtitle}>
              Kami menyusun buku panduan eksklusif bersama praktisi senior, auditor, dan controller
              properti terkemuka di Indonesia. Tersedia gratis untuk mempercepat akselerasi karier
              dan bisnis Anda.
            </p>
          </div>

          <div className={classes.ebookGrid}>
            {EBOOKS_DATA.map((book) => (
              <div key={book.id} className={classes.ebookCard}>
                <div className={classes.ebookCover} style={{ background: book.gradient }}>
                  <div className={classes.ebookTag}>{book.tag}</div>
                  <div>
                    <IconBook2 size={32} stroke={1.5} style={{ opacity: 0.9 }} />
                    <div style={{ fontWeight: 800, fontSize: 16, marginTop: 8, lineHeight: 1.25 }}>
                      {book.title}
                    </div>
                  </div>
                </div>

                <div className={classes.ebookTitle}>{book.title}</div>
                <p className={classes.ebookDesc}>{book.desc}</p>

                <div
                  style={{
                    margin: '14px 0',
                    display: 'grid',
                    gap: 6,
                    fontSize: 12,
                    color: '#475569',
                  }}
                >
                  {book.highlights.map((item) => (
                    <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <IconCheck size={14} color="#059669" stroke={2.5} style={{ flexShrink: 0 }} />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>

                <div className={classes.ebookMeta}>
                  <span>
                    📄 {book.pages} • ⏱ {book.readTime}
                  </span>
                  <Badge size="xs" color="teal" variant="light">
                    Format PDF Siap Unduh
                  </Badge>
                </div>

                <Button
                  mt="md"
                  color="primary"
                  variant="light"
                  radius="md"
                  fullWidth
                  leftSection={<IconDownload size={16} />}
                  onClick={() => handleOpenEbook(book)}
                >
                  Unduh E-Book Gratis
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials & Ratings */}
      <section id="testimonials" className={classes.section}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Ulasan & Validasi Pengguna</span>
            <h2 className={classes.sectionTitle}>
              Dipercaya Lebih dari 2.500+ Pemimpin Keuangan & Pengelola Bisnis
            </h2>
            <p className={classes.sectionSubtitle}>
              Dengarkan langsung bagaimana Jurnal ProApps mentransformasi efisiensi operasional dan
              eliminasi human error di perusahaan terkemuka.
            </p>
          </div>

          <div className={classes.testimonialGrid}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className={classes.testimonialCard}>
                <div className={classes.testimonialStars}>
                  <Rating value={t.rating} readOnly size="sm" color="yellow" />
                </div>
                <p className={classes.testimonialQuote}>"{t.quote}"</p>
                <div className={classes.testimonialAuthor}>
                  <div className={classes.authorAvatar}>{t.avatar}</div>
                  <div>
                    <div className={classes.authorName}>{t.name}</div>
                    <div className={classes.authorTitle}>{t.title}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compliance & Security Badges Bar */}
          <div
            style={{
              marginTop: 48,
              padding: '24px 32px',
              borderRadius: 16,
              border: '1px solid var(--lp-line)',
              background: '#f8fafc',
              display: 'flex',
              justifyContent: 'space-around',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 20,
            }}
          >
            <Group gap="xs">
              <ThemeIcon size="md" color="blue" radius="xl" variant="light">
                <IconFileCertificate size={18} />
              </ThemeIcon>
              <div>
                <Text fw={750} fz="xs">
                  ISO 27001 Certified
                </Text>
                <Text fz={11} c="dimmed">
                  Sertifikasi Keamanan Data Global
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <ThemeIcon size="md" color="teal" radius="xl" variant="light">
                <IconShieldCheck size={18} />
              </ThemeIcon>
              <div>
                <Text fw={750} fz="xs">
                  256-Bit Financial Encryption
                </Text>
                <Text fz={11} c="dimmed">
                  Enkripsi Setara Perbankan
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <ThemeIcon size="md" color="indigo" radius="xl" variant="light">
                <IconScale size={18} />
              </ThemeIcon>
              <div>
                <Text fw={750} fz="xs">
                  Kepatuhan Standar PSAK / IFRS
                </Text>
                <Text fz={11} c="dimmed">
                  Sesuai Pedoman IAI & Dewan Standar
                </Text>
              </div>
            </Group>

            <Group gap="xs">
              <ThemeIcon size="md" color="orange" radius="xl" variant="light">
                <IconClock size={18} />
              </ThemeIcon>
              <div>
                <Text fw={750} fz="xs">
                  99.99% Cloud Uptime SLA
                </Text>
                <Text fz={11} c="dimmed">
                  Infrastruktur Cloud Berkelanjutan
                </Text>
              </div>
            </Group>
          </div>
        </div>
      </section>

      {/* Interactive FAQ Section */}
      <section id="faq" className={classes.sectionAlt}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <span className={classes.kicker}>Pertanyaan yang Sering Diajukan</span>
            <h2 className={classes.sectionTitle}>
              Semua Jawaban untuk Keputusan Finansial Terbaik Anda
            </h2>
            <p className={classes.sectionSubtitle}>
              Punya pertanyaan seputar migrasi data, integrasi sistem, atau keamanan pembukuan?
              Temukan jawabannya di sini.
            </p>
          </div>

          <div className={classes.faqContainer}>
            <Accordion variant="separated" radius="md">
              <Accordion.Item value="migration">
                <Accordion.Control icon={<IconFileSpreadsheet size={20} color="var(--lp-navy)" />}>
                  <strong>
                    Apakah data dari sistem pembukuan lama atau spreadsheet Excel bisa dipindahkan?
                  </strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    Tentu saja. Jurnal ProApps menyediakan modul Import Saldo Awal dan Bagan Akun
                    (COA) berbasis template Excel / CSV yang sangat praktis. Tim onboarding kami
                    juga siap membantu pemetaan (mapping) akun dan validasi saldo penutup tahun lalu
                    agar transisi Anda berjalan mulus tanpa ada angka yang tercecer.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="operational-sync">
                <Accordion.Control icon={<IconLayersLinked size={20} color="var(--lp-navy)" />}>
                  <strong>
                    Mengapa Jurnal ProApps jauh lebih unggul untuk bisnis properti dan utilitas?
                  </strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    Software akuntansi umum tidak memiliki koneksi asli ke data unit, penyewa
                    (tenant), denda (fine penalties), dan tagihan utilitas. Akibatnya akuntan harus
                    memasukkan nota manual satu per satu yang rawan selisih kas. Di Jurnal ProApps,
                    seluruh event penagihan dan pembayaran tenant portal otomatis masuk ke{' '}
                    <em>Operational Inbound Queue</em> untuk ditinjau dan diposting massal dalam 1
                    klik.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="pending-changes">
                <Accordion.Control icon={<IconShieldCheck size={20} color="var(--lp-navy)" />}>
                  <strong>
                    Bagaimana cara kerja fitur Persetujuan Perubahan Data (Pending Changes)?
                  </strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    Jika staf operasional melakukan revisi nominal faktur, pembatalan, atau
                    penyesuaian saldo, perubahan tersebut tidak akan langsung menimpa pembukuan
                    final. Data akan masuk ke menu{' '}
                    <strong>Persetujuan Perubahan (Pending Changes)</strong> di mana Controller atau
                    Manager Keuangan dapat membandingkan data lama vs baru, melihat nama pemohon,
                    lalu menyetujui atau menolak perubahan dengan catatan resmi.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="multi-decimal">
                <Accordion.Control icon={<IconCoins size={20} color="var(--lp-navy)" />}>
                  <strong>Untuk apa fitur presisi 4 desimal digunakan?</strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    Dalam transaksi kurs valuta asing (misal USD ke IDR pada kurs Rp 16.240,5512),
                    komoditas cair (seperti bahan bakar dan bahan kimia industri per liter), atau
                    biaya sewa per meter persegi, pembatasan 2 desimal konvensional akan menciptakan
                    selisih pembulatan jutaan rupiah saat dikalikan volume besar. Mesin
                    multi-desimal ProApps menjaga akurasi hingga pecahan terkecil.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>

              <Accordion.Item value="bilingual">
                <Accordion.Control icon={<IconLanguage size={20} color="var(--lp-navy)" />}>
                  <strong>
                    Apakah laporan keuangan bisa disajikan dalam standar bahasa Inggris (IFRS)?
                  </strong>
                </Accordion.Control>
                <Accordion.Panel>
                  <Text fz="sm" c="dimmed" lh={1.65}>
                    Ya. Dengan fitur 1-Click Dual-Language Switch, Anda bisa beralih secara dinamis
                    antara terminologi akuntansi Indonesia (PSAK) dan Bahasa Inggris (IFRS/GAAP)
                    kapan pun diperlukan. Anda dapat mengekspor Neraca dan Laba Rugi dalam Bahasa
                    Inggris untuk kebutuhan audit internasional atau pelaporan ke pemegang saham
                    asing.
                  </Text>
                </Accordion.Panel>
              </Accordion.Item>
            </Accordion>
          </div>
        </div>
      </section>

      {/* High-Conversion Bottom CTA Banner */}
      <section className={classes.section}>
        <div className={classes.container}>
          <div className={classes.cta}>
            <div className={classes.ctaInner}>
              <ThemeIcon
                size={64}
                radius="xl"
                color="secondary.6"
                variant="filled"
                style={{ margin: '0 auto' }}
              >
                <IconSparkles size={34} stroke={2} />
              </ThemeIcon>
              <h2 className={classes.ctaTitle} style={{ marginTop: 24 }}>
                Tingkatkan Akurasi Pembukuan Bisnis Anda ke Tingkat Enterprise
              </h2>
              <p className={classes.ctaText}>
                Bergabunglah dengan ribuan akuntan, controller, dan direktur keuangan yang telah
                meninggalkan kerumitan spreadsheet dan software akuntansi yang terpisah dari
                operasional.
              </p>

              <div
                style={{
                  marginTop: 36,
                  display: 'flex',
                  gap: 14,
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  size="xl"
                  radius="md"
                  color="secondary.6"
                  rightSection={<IconArrowRight size={20} />}
                  onClick={goLogin}
                  style={{ fontWeight: 800, padding: '0 36px' }}
                >
                  Masuk ke Jurnal ProApps
                </Button>
                <Button
                  size="xl"
                  radius="md"
                  variant="white"
                  color="dark"
                  component="a"
                  href="#ebooks"
                  leftSection={<IconDownload size={20} />}
                  style={{ fontWeight: 700 }}
                >
                  Unduh E-Book Gratis
                </Button>
              </div>

              <div
                style={{
                  marginTop: 24,
                  fontSize: 13,
                  color: 'rgba(255,255,255,0.7)',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 24,
                  flexWrap: 'wrap',
                }}
              >
                <span>✓ Tanpa instalasi rumit</span>
                <span>✓ Dukungan migrasi penuh</span>
                <span>✓ Garansi kepatuhan PSAK</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Footer */}
      <footer className={classes.footer}>
        <div className={classes.container}>
          <div className={classes.footerGrid}>
            <div>
              <a href="#top" className={classes.brand}>
                <span className={classes.brandMark}>
                  <IconReceipt size={20} stroke={2.2} />
                </span>
                <span>Jurnal ProApps</span>
              </a>
              <p
                style={{
                  marginTop: 14,
                  fontSize: 14,
                  lineHeight: 1.6,
                  color: 'var(--lp-muted)',
                  maxWidth: 320,
                }}
              >
                Platform akuntansi dan manajemen buku besar enterprise generasi baru. Terhubung
                secara native dengan ekosistem operasional properti dan bisnis Indonesia.
              </p>
              <div style={{ marginTop: 16 }}>
                <Badge size="sm" variant="dot" color="teal">
                  Sistem Aktif & Terlindungi SSL 256-Bit
                </Badge>
              </div>
            </div>

            <div>
              <div className={classes.footerTitle}>Produk & Modul</div>
              <a href="#preview" className={classes.footerLink}>
                Jurnal Umum & Buku Besar
              </a>
              <a href="#preview" className={classes.footerLink}>
                Antrean Sinkronisasi Operasional
              </a>
              <a href="#preview" className={classes.footerLink}>
                Rekonsiliasi Bank 3-Arah
              </a>
              <a href="#preview" className={classes.footerLink}>
                Saldo Awal & Kunci Periode
              </a>
              <a href="#preview" className={classes.footerLink}>
                Laporan Keuangan Real-Time
              </a>
            </div>

            <div>
              <div className={classes.footerTitle}>Edukasi & Sumber Daya</div>
              <a href="#ebooks" className={classes.footerLink}>
                Playbook Akuntansi Properti 2026
              </a>
              <a href="#ebooks" className={classes.footerLink}>
                Kamus Finansial PSAK & IFRS
              </a>
              <a href="#ebooks" className={classes.footerLink}>
                Mastering Rekonsiliasi Bank
              </a>
              <a href="#comparison" className={classes.footerLink}>
                Tabel Komparasi Fitur
              </a>
              <a href="#faq" className={classes.footerLink}>
                Pusat Bantuan & FAQ
              </a>
            </div>

            <div>
              <div className={classes.footerTitle}>Akses & Keamanan</div>
              <a href={routes.login} className={classes.footerLink}>
                Portal Masuk Klien
              </a>
              <a href="#top" className={classes.footerLink}>
                Standar Kepatuhan ISO 27001
              </a>
              <a href="#top" className={classes.footerLink}>
                Kebijakan Privasi Data
              </a>
              <a href="#top" className={classes.footerLink}>
                Ketentuan Layanan Enterprise
              </a>
              <div style={{ marginTop: 14 }}>
                <LanguageSwitcher variant="compact" />
              </div>
            </div>
          </div>

          <div className={classes.footerBottom}>
            <span>
              © {new Date().getFullYear()} PT ProApps Solusi Digital Indonesia. All rights reserved.
            </span>
            <span>Dibuat dengan standar keunggulan untuk tim keuangan dan akuntansi modern.</span>
          </div>
        </div>
      </footer>

      {/* E-Book Download Modal */}
      <Modal
        opened={ebookModalOpened}
        onClose={() => setEbookModalOpened(false)}
        title={
          <Group gap="xs">
            <IconBook2 size={20} color="var(--lp-navy)" />
            <Text fw={750} fz="sm">
              Unduh E-Book Akuntansi Gratis
            </Text>
          </Group>
        }
        radius="lg"
        size="md"
        centered
      >
        {selectedEbook && (
          <div>
            {!ebookSuccess ? (
              <form onSubmit={handleDownloadEbook}>
                <div
                  style={{
                    background: selectedEbook.gradient,
                    padding: '20px',
                    borderRadius: 12,
                    color: '#fff',
                    marginBottom: 16,
                  }}
                >
                  <Badge size="xs" color="white" variant="white" c="dark.8" mb="xs">
                    {selectedEbook.tag}
                  </Badge>
                  <Text fw={800} fz="md" lh={1.3}>
                    {selectedEbook.title}
                  </Text>
                  <Text fz="xs" style={{ opacity: 0.9, marginTop: 6 }}>
                    {selectedEbook.pages} • {selectedEbook.readTime}
                  </Text>
                </div>

                <Text fz="xs" c="dimmed" mb="md">
                  Masukkan email perusahaan Anda untuk mendapatkan tautan unduhan instan dalam
                  format PDF langsung ke inbox Anda:
                </Text>

                <TextInput
                  label="Email Perusahaan"
                  placeholder="nama.anda@perusahaan.com"
                  required
                  value={ebookEmail}
                  onChange={(e) => setEbookEmail(e.currentTarget.value)}
                  size="md"
                  radius="md"
                  mb="lg"
                />

                <Group justify="flex-end" gap="sm">
                  <Button variant="default" radius="md" onClick={() => setEbookModalOpened(false)}>
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    color="primary"
                    radius="md"
                    leftSection={<IconDownload size={16} />}
                  >
                    Unduh Sekarang (PDF)
                  </Button>
                </Group>
              </form>
            ) : (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <ThemeIcon
                  size={60}
                  radius="xl"
                  color="teal"
                  variant="light"
                  style={{ margin: '0 auto 16px' }}
                >
                  <IconCircleCheckFilled size={36} />
                </ThemeIcon>
                <Text fw={800} fz="lg" c="dark.8">
                  E-Book Siap Diunduh!
                </Text>
                <Text fz="sm" c="dimmed" mt="xs" mb="lg">
                  Tautan unduhan dokumen <strong>{selectedEbook.title}</strong> telah dikirimkan ke{' '}
                  <span style={{ color: 'var(--lp-navy)', fontWeight: 600 }}>{ebookEmail}</span>.
                </Text>

                <Button
                  fullWidth
                  color="primary"
                  radius="md"
                  onClick={() => {
                    setEbookModalOpened(false);
                    notifications.show({
                      title: 'Download Dimulai',
                      message: `Mengunduh file ${selectedEbook.title}.pdf...`,
                      color: 'teal',
                    });
                  }}
                >
                  Buka Dokumen PDF Sekarang
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}

export default LandingPage;
