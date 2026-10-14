import {
  IconArrowsExchange,
  IconBook2,
  IconCashBanknote,
  IconChartBar,
  IconChartPie,
  IconFileAnalytics,
  IconReportMoney,
  IconScale,
  IconTimeline,
  type Icon,
} from '@tabler/icons-react';
import { routes } from '@/router/routes';

export type ReportCategory = 'all' | 'financial' | 'ledger' | 'management';

export interface ReportItem {
  id: string;
  title: string;
  englishTitle: string;
  description: string;
  route: string;
  category: 'financial' | 'ledger' | 'management';
  icon: Icon;
  color: string;
  badge?: string;
  badgeColor?: string;
  featured?: boolean;
}

export const reportCategories: Array<{ value: ReportCategory; label: string; count?: number }> = [
  { value: 'all', label: 'Semua Laporan' },
  { value: 'financial', label: 'Laporan Keuangan Utama' },
  { value: 'ledger', label: 'Buku & Jurnal Transaksi' },
  { value: 'management', label: 'Anggaran & Analisis' },
];

export const reportCatalogData: ReportItem[] = [
  {
    id: 'general-ledger',
    title: 'Buku Besar',
    englishTitle: 'General Ledger',
    description: 'Telusuri mutasi debit, kredit, dan pergerakan saldo berjalan setiap akun secara komprehensif dalam satu periode pembukuan.',
    route: routes.resultReport.generalLedgerReport,
    category: 'ledger',
    icon: IconBook2,
    color: 'violet',
    badge: 'Aktif & Real-time',
    badgeColor: 'teal',
    featured: true,
  },
  {
    id: 'balance-sheet',
    title: 'Neraca',
    englishTitle: 'Balance Sheet',
    description: 'Menampilkan posisi keuangan perusahaan yang mencakup total aset, liabilitas, dan ekuitas modal pada titik waktu tertentu.',
    route: routes.resultReport.balanceSheet,
    category: 'financial',
    icon: IconScale,
    color: 'blue',
    badge: 'Standar PSAK',
    badgeColor: 'blue',
    featured: true,
  },
  {
    id: 'income-statement',
    title: 'Laba Rugi',
    englishTitle: 'Income Statement / Profit & Loss',
    description: 'Ringkasan pendapatan usaha dikurangi seluruh beban operasional untuk menghitung laba atau rugi bersih bisnis dalam periode terpilih.',
    route: routes.resultReport.incomeStatement,
    category: 'financial',
    icon: IconChartBar,
    color: 'teal',
    badge: 'Populer',
    badgeColor: 'orange',
    featured: true,
  },
  {
    id: 'trial-balance',
    title: 'Neraca Saldo',
    englishTitle: 'Trial Balance',
    description: 'Memastikan keseimbangan total debit dan kredit dari seluruh akun sebelum proses penutupan buku dan laporan akhir.',
    route: routes.resultReport.trialBalance,
    category: 'financial',
    icon: IconFileAnalytics,
    color: 'cyan',
  },
  {
    id: 'cash-flow',
    title: 'Arus Kas',
    englishTitle: 'Cash Flow Statement',
    description: 'Melacak seluruh aliran kas masuk dan keluar yang terbagi menjadi aktivitas operasi, investasi, dan pendanaan perusahaan.',
    route: routes.resultReport.cashFlow,
    category: 'financial',
    icon: IconCashBanknote,
    color: 'emerald',
  },
  {
    id: 'journal-entry',
    title: 'Jurnal Umum',
    englishTitle: 'Journal Entry Log',
    description: 'Daftar kronologis dari seluruh pencatatan transaksi jurnal debit-kredit dengan referensi transaksi dan memo penjelasan.',
    route: routes.resultReport.journalEntry,
    category: 'ledger',
    icon: IconTimeline,
    color: 'indigo',
  },
  {
    id: 'equity-changes',
    title: 'Perubahan Ekuitas',
    englishTitle: 'Statement of Changes in Equity',
    description: 'Menganalisis pergerakan modal pemilik, tambahan modal disetor, penarikan prive, serta akumulasi laba ditahan selama periode berjalan.',
    route: routes.resultReport.equityChanges,
    category: 'financial',
    icon: IconArrowsExchange,
    color: 'grape',
  },
  {
    id: 'business-summary',
    title: 'Ringkasan Bisnis',
    englishTitle: 'Business Executive Summary',
    description: 'Ikhtisar ringkas metrik performa utama perusahaan dari penjualan, kas, hingga laba operasional untuk manajemen.',
    route: routes.resultReport.businessSumary,
    category: 'management',
    icon: IconChartPie,
    color: 'pink',
  },
  {
    id: 'income-statement-budget',
    title: 'Laba Rugi Anggaran',
    englishTitle: 'Budget vs Actual Income Statement',
    description: 'Membandingkan realisasi laba rugi dengan target anggaran belanja untuk melihat deviasi dan efisiensi pengeluaran.',
    route: routes.resultReport.incomeStatementBudget,
    category: 'management',
    icon: IconReportMoney,
    color: 'yellow',
  },
];

