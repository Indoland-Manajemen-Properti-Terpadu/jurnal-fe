import {
  IconArrowsExchange,
  IconBook2,
  IconChartBar,
  IconFileAnalytics,
  IconScale,
  IconTimeline,
} from '@tabler/icons-react';
import { routes } from '@/router/routes';

export type ReportGroup = 'statement' | 'journal';

export const reportCatalog = [
  {
    title: 'Buku Besar',
    englishTitle: 'General Ledger',
    description: 'Telusuri mutasi debit, kredit, dan saldo berjalan setiap akun dalam satu periode.',
    route: routes.resultReport.generalLedgerReport,
    group: 'journal',
    icon: IconBook2,
    featured: true,
  },
  {
    title: 'Neraca',
    englishTitle: 'Balance Sheet',
    description: 'Lihat posisi aset, liabilitas, dan ekuitas pada tanggal laporan.',
    route: routes.resultReport.balanceSheet,
    group: 'statement',
    icon: IconScale,
  },
  {
    title: 'Laba Rugi',
    englishTitle: 'Income Statement',
    description: 'Tinjau pendapatan dan beban untuk memahami hasil usaha selama periode.',
    route: routes.resultReport.incomeStatement,
    group: 'statement',
    icon: IconChartBar,
  },
  {
    title: 'Neraca Saldo',
    englishTitle: 'Trial Balance',
    description: 'Periksa saldo debit dan kredit akun sebelum menyusun laporan keuangan.',
    route: routes.resultReport.trialBalance,
    group: 'statement',
    icon: IconFileAnalytics,
  },
  {
    title: 'Jurnal Umum',
    englishTitle: 'Journal Entry',
    description: 'Periksa daftar pencatatan transaksi dan detail jurnal dalam periode.',
    route: routes.resultReport.journalEntry,
    group: 'journal',
    icon: IconTimeline,
  },
  {
    title: 'Perubahan Ekuitas',
    englishTitle: 'Equity Changes',
    description: 'Tinjau perubahan modal dan komponen ekuitas selama periode.',
    route: routes.resultReport.equityChanges,
    group: 'statement',
    icon: IconArrowsExchange,
  },
] as const;
