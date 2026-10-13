import { Button } from '@mantine/core';
import {
  IconArrowRight,
  IconBook2,
  IconBuildingBank,
  IconBuildingWarehouse,
  IconCalculator,
  IconChartBar,
  IconChartPie,
  IconCheck,
  IconClipboardCheck,
  IconCoins,
  IconFileInvoice,
  IconLayoutDashboard,
  IconLock,
  IconPackage,
  IconReceipt,
  IconScale,
  IconShieldCheck,
  IconShoppingCart,
  IconTruckDelivery,
  IconUsers,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import classes from './LandingPage.module.css';

const navLinks = [
  { label: 'Fitur', href: '#features' },
  { label: 'Modul', href: '#modules' },
  { label: 'Cara Kerja', href: '#how' },
];

const features = [
  {
    icon: IconBook2,
    title: 'Jurnal Umum & Buku Besar',
    text: 'Catat transaksi double-entry dengan bagan akun yang terstruktur, lengkap dengan detail mutasi per akun.',
  },
  {
    icon: IconBuildingBank,
    title: 'Kas & Bank',
    text: 'Kelola penerimaan, pengeluaran, dan transfer dana antar rekening dalam satu alur yang rapi.',
  },
  {
    icon: IconChartPie,
    title: 'Laporan Keuangan',
    text: 'Ringkasan bisnis, laba rugi, dan neraca tersaji otomatis dari setiap jurnal yang Anda posting.',
  },
  {
    icon: IconCalculator,
    title: 'Perencanaan Anggaran',
    text: 'Susun anggaran per periode dan bandingkan realisasinya untuk keputusan yang lebih terukur.',
  },
  {
    icon: IconLock,
    title: 'Kunci Periode & Tutup Buku',
    text: 'Amankan periode yang sudah final dan jalankan proses tutup buku tanpa risiko perubahan data.',
  },
  {
    icon: IconShieldCheck,
    title: 'Approval & Hak Akses',
    text: 'Atur alur persetujuan transaksi dan peran pengguna agar setiap angka punya penanggung jawab.',
  },
];

const modules = [
  { icon: IconLayoutDashboard, name: 'Dashboard', desc: 'Pantau kinerja harian' },
  { icon: IconBook2, name: 'Jurnal Umum', desc: 'Akun & transaksi' },
  { icon: IconScale, name: 'Saldo Awal', desc: 'Mulai buku dengan benar' },
  { icon: IconBuildingBank, name: 'Kas & Bank', desc: 'Terima, kirim, transfer' },
  { icon: IconUsers, name: 'Kontak', desc: 'Pelanggan & vendor' },
  { icon: IconShoppingCart, name: 'Pembelian', desc: 'Pesanan & tagihan' },
  { icon: IconPackage, name: 'Produk', desc: 'Katalog & stok' },
  { icon: IconBuildingWarehouse, name: 'Aset', desc: 'Aset tetap perusahaan' },
  { icon: IconCoins, name: 'Biaya', desc: 'Pengeluaran operasional' },
  { icon: IconClipboardCheck, name: 'Produksi', desc: 'Proses manufaktur' },
  { icon: IconTruckDelivery, name: 'Fulfillment', desc: 'Pengiriman pesanan' },
  { icon: IconUsersGroup, name: 'Manajemen User', desc: 'Peran & approval' },
];

const steps = [
  {
    title: 'Siapkan bagan akun',
    text: 'Gunakan struktur akun yang tersedia atau sesuaikan dengan kebutuhan bisnis, lalu isi saldo awal.',
  },
  {
    title: 'Catat transaksi harian',
    text: 'Input jurnal, kas & bank, pembelian, hingga biaya. Lampirkan tag dan dokumen pendukung.',
  },
  {
    title: 'Analisa & tutup buku',
    text: 'Baca laporan real-time, bandingkan dengan anggaran, lalu kunci periode saat semuanya sudah final.',
  },
];

const ledgerRows = [
  { account: '1-1001 Kas', debit: '25.000.000', credit: '—' },
  { account: '4-4001 Pendapatan Jasa', debit: '—', credit: '22.500.000' },
  { account: '2-2105 PPN Keluaran', debit: '—', credit: '2.500.000' },
];

const bars = [38, 52, 44, 68, 58, 76, 64, 88, 72, 94, 80, 100];

function LandingPage() {
  const navigate = useNavigate();
  const goLogin = () => navigate(routes.login);

  return (
    <div className={classes.page}>
      {/* Header */}
      <header className={classes.header}>
        <div className={`${classes.container} ${classes.headerInner}`}>
          <a href="#top" className={classes.brand}>
            <span className={classes.brandMark}>
              <IconReceipt size={18} stroke={2} />
            </span>
            Jurnal
          </a>
          <nav className={classes.nav}>
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={classes.navLink}>
                {link.label}
              </a>
            ))}
          </nav>
          <Button color="primary" radius="md" onClick={goLogin}>
            Masuk
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section id="top" className={classes.hero}>
        <div className={classes.heroGlow} />
        <div className={`${classes.container} ${classes.heroContent}`}>
          <span className={classes.eyebrow}>
            <span className={classes.eyebrowTag}>Baru</span>
            Approval transaksi & tutup buku kini tersedia
          </span>
          <h1 className={classes.heroTitle}>
            Akuntansi bisnis yang <span className={classes.gradientText}>rapi, akurat,</span> dan
            selalu siap diaudit.
          </h1>
          <p className={classes.heroSubtitle}>
            Satu platform untuk jurnal umum, kas & bank, pembelian, aset, anggaran, hingga laporan
            keuangan. Dirancang agar tim finance bekerja lebih cepat tanpa mengorbankan ketelitian.
          </p>
          <div className={classes.heroActions}>
            <Button
              size="lg"
              radius="md"
              color="primary"
              rightSection={<IconArrowRight size={18} />}
              onClick={goLogin}
            >
              Mulai Sekarang
            </Button>
            <Button size="lg" radius="md" variant="default" component="a" href="#features">
              Lihat Fitur
            </Button>
          </div>
          <p className={classes.heroNote}>Terintegrasi dengan ekosistem ProApps</p>

          {/* Product preview */}
          <div className={classes.preview}>
            <div className={classes.window}>
              <div className={classes.windowBar}>
                <span className={classes.dot} />
                <span className={classes.dot} />
                <span className={classes.dot} />
              </div>
              <div className={classes.windowBody}>
                <aside className={classes.sidebar}>
                  <div className={classes.sideItemActive}>
                    <IconLayoutDashboard size={16} /> Dashboard
                  </div>
                  <div className={classes.sideItem}>
                    <IconBook2 size={16} /> Jurnal Umum
                  </div>
                  <div className={classes.sideItem}>
                    <IconBuildingBank size={16} /> Kas & Bank
                  </div>
                  <div className={classes.sideItem}>
                    <IconShoppingCart size={16} /> Pembelian
                  </div>
                  <div className={classes.sideItem}>
                    <IconFileInvoice size={16} /> Laporan
                  </div>
                  <div className={classes.sideItem}>
                    <IconCalculator size={16} /> Anggaran
                  </div>
                </aside>
                <div className={classes.main}>
                  <div className={classes.kpiGrid}>
                    <div className={classes.kpi}>
                      <div className={classes.kpiLabel}>Saldo Kas & Bank</div>
                      <div className={classes.kpiValue}>Rp 1,28 M</div>
                      <div className={classes.kpiTrend}>+12,4% bulan ini</div>
                    </div>
                    <div className={classes.kpi}>
                      <div className={classes.kpiLabel}>Pendapatan</div>
                      <div className={classes.kpiValue}>Rp 842 Jt</div>
                      <div className={classes.kpiTrend}>+8,1% bulan ini</div>
                    </div>
                    <div className={classes.kpi}>
                      <div className={classes.kpiLabel}>Laba Bersih</div>
                      <div className={classes.kpiValue}>Rp 214 Jt</div>
                      <div className={classes.kpiTrend}>+5,6% bulan ini</div>
                    </div>
                  </div>
                  <div className={classes.chartCard}>
                    <div className={classes.kpiLabel}>Arus kas 12 bulan terakhir</div>
                    <div className={classes.bars}>
                      {bars.map((h, i) => (
                        <div
                          // eslint-disable-next-line react/no-array-index-key
                          key={i}
                          className={i % 3 === 2 ? classes.bar : classes.barMuted}
                          style={{ height: `${h}%` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className={classes.trust}>
        <div className={classes.container}>
          <div className={classes.stats}>
            <div>
              <div className={classes.statValue}>12+</div>
              <div className={classes.statLabel}>Modul terintegrasi</div>
            </div>
            <div>
              <div className={classes.statValue}>100%</div>
              <div className={classes.statLabel}>Jurnal double-entry</div>
            </div>
            <div>
              <div className={classes.statValue}>Real-time</div>
              <div className={classes.statLabel}>Laporan keuangan</div>
            </div>
            <div>
              <div className={classes.statValue}>Multi-level</div>
              <div className={classes.statLabel}>Approval transaksi</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={classes.section}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <div className={classes.kicker}>Fitur Utama</div>
            <h2 className={classes.sectionTitle}>Semua yang dibutuhkan tim finance modern</h2>
            <p className={classes.sectionSubtitle}>
              Dari pencatatan pertama hingga laporan akhir periode, setiap proses terhubung dalam
              satu sumber data yang konsisten.
            </p>
          </div>
          <div className={classes.featureGrid}>
            {features.map((f) => (
              <div key={f.title} className={classes.feature}>
                <div className={classes.featureIcon}>
                  <f.icon size={22} stroke={1.8} />
                </div>
                <div className={classes.featureTitle}>{f.title}</div>
                <p className={classes.featureText}>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Highlight */}
      <section className={classes.sectionAlt}>
        <div className={`${classes.container} ${classes.split}`}>
          <div>
            <div className={classes.kicker}>Akurasi Akuntansi</div>
            <h2 className={classes.sectionTitle}>
              Setiap transaksi seimbang, setiap angka terlacak
            </h2>
            <p className={classes.sectionSubtitle}>
              Jurnal dirancang mengikuti prinsip double-entry sehingga debit dan kredit selalu
              seimbang sebelum diposting ke buku besar.
            </p>
            <ul className={classes.checkList}>
              {[
                'Validasi debit-kredit sebelum transaksi tersimpan',
                'Tag, memo, dan lampiran untuk setiap jurnal',
                'Riwayat mutasi detail per akun dan per kontak',
                'Ekspor laporan ke PDF dalam satu klik',
              ].map((item) => (
                <li key={item} className={classes.checkItem}>
                  <span className={classes.checkIcon}>
                    <IconCheck size={14} stroke={3} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className={classes.ledgerCard}>
            <div className={classes.ledgerHead}>
              <strong>Jurnal #JU-2026-0142</strong>
              <span className={classes.balanced}>
                <IconCheck size={12} stroke={3} /> Seimbang
              </span>
            </div>
            <div className={classes.ledgerRowHead}>
              <span>Akun</span>
              <span className={classes.num}>Debit</span>
              <span className={classes.num}>Kredit</span>
            </div>
            {ledgerRows.map((r) => (
              <div key={r.account} className={classes.ledgerRow}>
                <span>{r.account}</span>
                <span className={classes.num}>{r.debit}</span>
                <span className={classes.num}>{r.credit}</span>
              </div>
            ))}
            <div className={classes.ledgerTotal}>
              <span>Total</span>
              <span className={classes.num}>25.000.000</span>
              <span className={classes.num}>25.000.000</span>
            </div>
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className={classes.section}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <div className={classes.kicker}>Modul</div>
            <h2 className={classes.sectionTitle}>Satu platform, seluruh operasional bisnis</h2>
            <p className={classes.sectionSubtitle}>
              Setiap modul otomatis menghasilkan jurnal, sehingga laporan keuangan selalu
              mencerminkan kondisi bisnis yang sebenarnya.
            </p>
          </div>
          <div className={classes.moduleGrid}>
            {modules.map((m) => (
              <div key={m.name} className={classes.module}>
                <div className={classes.moduleIcon}>
                  <m.icon size={20} stroke={1.8} />
                </div>
                <div>
                  <div className={classes.moduleName}>{m.name}</div>
                  <div className={classes.moduleDesc}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className={classes.sectionAlt}>
        <div className={classes.container}>
          <div className={classes.sectionHead}>
            <div className={classes.kicker}>Cara Kerja</div>
            <h2 className={classes.sectionTitle}>Mulai dalam tiga langkah sederhana</h2>
          </div>
          <div className={classes.steps}>
            {steps.map((s, i) => (
              <div key={s.title} className={i === 0 ? classes.stepActive : classes.step}>
                <div className={classes.stepNum}>0{i + 1}</div>
                <div className={classes.featureTitle}>{s.title}</div>
                <p className={classes.featureText}>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={classes.section}>
        <div className={classes.container}>
          <div className={classes.cta}>
            <div className={classes.ctaInner}>
              <IconChartBar size={40} stroke={1.5} />
              <h2 className={classes.ctaTitle}>Siap merapikan pembukuan bisnis Anda?</h2>
              <p className={classes.ctaText}>
                Masuk dengan akun ProApps Anda dan mulai kelola keuangan perusahaan dengan lebih
                percaya diri.
              </p>
              <Button
                mt={32}
                size="lg"
                radius="md"
                color="secondary.6"
                rightSection={<IconArrowRight size={18} />}
                onClick={goLogin}
              >
                Masuk ke Jurnal
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={classes.footer}>
        <div className={classes.container}>
          <div className={classes.footerGrid}>
            <div>
              <a href="#top" className={classes.brand}>
                <span className={classes.brandMark}>
                  <IconReceipt size={18} stroke={2} />
                </span>
                Jurnal
              </a>
              <p className={classes.featureText} style={{ maxWidth: 300 }}>
                Software akuntansi untuk bisnis yang tumbuh. Bagian dari ekosistem ProApps.
              </p>
            </div>
            <div>
              <div className={classes.footerTitle}>Produk</div>
              <a href="#features" className={classes.footerLink}>
                Fitur
              </a>
              <a href="#modules" className={classes.footerLink}>
                Modul
              </a>
              <a href="#how" className={classes.footerLink}>
                Cara Kerja
              </a>
            </div>
            <div>
              <div className={classes.footerTitle}>Akuntansi</div>
              <a href="#modules" className={classes.footerLink}>
                Jurnal Umum
              </a>
              <a href="#modules" className={classes.footerLink}>
                Kas & Bank
              </a>
              <a href="#modules" className={classes.footerLink}>
                Laporan
              </a>
            </div>
            <div>
              <div className={classes.footerTitle}>Akun</div>
              <a href={routes.login} className={classes.footerLink}>
                Masuk
              </a>
            </div>
          </div>
          <div className={classes.footerBottom}>
            <span>© {new Date().getFullYear()} ProApps. All rights reserved.</span>
            <span>Dibuat untuk tim finance Indonesia</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
