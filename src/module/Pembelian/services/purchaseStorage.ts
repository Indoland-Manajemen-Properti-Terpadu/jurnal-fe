import { PurchaseBill } from '../types/purchase';

const STORAGE_KEY = 'jurnal_purchase_bills_data';

export const INITIAL_PURCHASE_BILLS: PurchaseBill[] = [
  {
    id: 'bill-001',
    billNumber: 'BILL/2026/04/001',
    vendorName: 'PT Sumber Makmur Sejahtera',
    transactionDate: '2026-04-01',
    dueDate: '2026-04-30',
    status: 'UNPAID',
    subtotal: 18500000,
    taxAmount: 2035000,
    totalAmount: 20535000,
    paidAmount: 0,
    remainingAmount: 20535000,
    paymentTerm: 'Net 30',
    notes: 'Pembelian stok bahan baku gelombang awal April.',
    items: [
      {
        id: 'item-1',
        itemName: 'Bahan Baku Primer Grade A (100 Roll)',
        description: 'Bahan baku impor standard mutu ISO',
        quantity: 100,
        unitPrice: 150000,
        taxRate: 11,
        total: 16650000,
      },
      {
        id: 'item-2',
        itemName: 'Packaging Karton Corrugated Box (500 pcs)',
        description: 'Karton cetak logo resmi',
        quantity: 500,
        unitPrice: 7000,
        taxRate: 11,
        total: 3885000,
      },
    ],
  },
  {
    id: 'bill-002',
    billNumber: 'BILL/2026/03/018',
    vendorName: 'CV Logistik Prima Cargo',
    transactionDate: '2026-03-15',
    dueDate: '2026-04-14',
    status: 'OVERDUE',
    subtotal: 7800000,
    taxAmount: 858000,
    totalAmount: 8658000,
    paidAmount: 2000000,
    remainingAmount: 6658000,
    paymentTerm: 'Net 30',
    notes: 'Biaya ekspedisi pengiriman kontainer Surabaya-Jakarta.',
    items: [
      {
        id: 'item-3',
        itemName: 'Jasa Freight & Container Shipping',
        description: 'Pengiriman 20ft container armada truk tronton',
        quantity: 1,
        unitPrice: 7800000,
        taxRate: 11,
        total: 8658000,
      },
    ],
  },
  {
    id: 'bill-003',
    billNumber: 'BILL/2026/04/005',
    vendorName: 'PT Digital Solusi Nusantara',
    transactionDate: '2026-04-05',
    dueDate: '2026-05-05',
    status: 'PAID',
    subtotal: 12000000,
    taxAmount: 1320000,
    totalAmount: 13320000,
    paidAmount: 13320000,
    remainingAmount: 0,
    paymentTerm: 'Net 30',
    notes: 'Langganan lisensi server cloud tahunan.',
    items: [
      {
        id: 'item-4',
        itemName: 'Annual Cloud Enterprise Subscription',
        description: 'Dedicated cloud server 64GB RAM 16 Core',
        quantity: 1,
        unitPrice: 12000000,
        taxRate: 11,
        total: 13320000,
      },
    ],
  },
  {
    id: 'bill-004',
    billNumber: 'BILL/2026/04/010',
    vendorName: 'Mitra Usaha Jaya ATK',
    transactionDate: '2026-04-10',
    dueDate: '2026-04-25',
    status: 'PARTIAL',
    subtotal: 4500000,
    taxAmount: 495000,
    totalAmount: 4995000,
    paidAmount: 2500000,
    remainingAmount: 2495000,
    paymentTerm: 'Net 15',
    notes: 'Perlengkapan ATK dan kertas continuous form audit.',
    items: [
      {
        id: 'item-5',
        itemName: 'Kertas HVS Continuous Form & Toner Printer',
        description: 'Paket perlengkapan departemen accounting',
        quantity: 1,
        unitPrice: 4500000,
        taxRate: 11,
        total: 4995000,
      },
    ],
  },
];

export const loadStoredPurchases = (): PurchaseBill[] => {
  if (typeof window === 'undefined') return INITIAL_PURCHASE_BILLS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PURCHASE_BILLS));
      return INITIAL_PURCHASE_BILLS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PURCHASE_BILLS;
  } catch {
    return INITIAL_PURCHASE_BILLS;
  }
};

export const persistPurchases = (bills: PurchaseBill[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
  } catch (e) {
    console.error('[PurchaseStorage] Persist failed:', e);
  }
};
