import { useState, useCallback, useEffect } from 'react';
import { notifications } from '@mantine/notifications';
import { CreatePurchaseFormValues, PayPurchasePayload, PurchaseBill } from '@/module/purchases/domain/purchase';
import { loadStoredPurchases, persistPurchases } from '@/module/purchases/infrastructure/purchaseStorage';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchPurchases = useCallback(() => {
    setIsLoading(true);
    try {
      const data = loadStoredPurchases();
      // Dynamically recalculate OVERDUE status
      const now = Date.now();
      const mapped = data.map((b) => {
        if (b.status === 'PAID' || b.status === 'CANCELLED' || b.status === 'DRAFT') return b;
        const isOverdue = b.remainingAmount > 0 && b.dueDate && new Date(b.dueDate).getTime() < now;
        return {
          ...b,
          status: isOverdue ? ('OVERDUE' as const) : b.status,
        };
      });
      setPurchases(mapped);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const createPurchase = useCallback((values: CreatePurchaseFormValues): boolean => {
    try {
      let subtotal = 0;
      let taxAmount = 0;

      const items = values.items.map((it, idx) => {
        const qty = Number(it.quantity) || 1;
        const price = Number(it.unitPrice) || 0;
        const rate = Number(it.taxRate) || 0;
        const lineSubtotal = qty * price;
        const lineTax = (lineSubtotal * rate) / 100;
        const lineTotal = lineSubtotal + lineTax;

        subtotal += lineSubtotal;
        taxAmount += lineTax;

        return {
          id: `line-${Date.now()}-${idx}`,
          itemName: it.itemName,
          description: it.description,
          quantity: qty,
          unitPrice: price,
          taxRate: rate,
          total: lineTotal,
        };
      });

      const totalAmount = subtotal + taxAmount;
      const billNumber =
        values.billNumber?.trim() ||
        `BILL/${new Date().getFullYear()}/${String(new Date().getMonth() + 1).padStart(2, '0')}/${Math.floor(100 + Math.random() * 900)}`;

      const newBill: PurchaseBill = {
        id: `bill-${Date.now()}`,
        billNumber,
        vendorName: values.vendorName,
        transactionDate: values.transactionDate,
        dueDate: values.dueDate,
        status: 'UNPAID',
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        remainingAmount: totalAmount,
        paymentTerm: values.paymentTerm || 'Net 30',
        items,
        notes: values.notes,
      };

      setPurchases((prev) => {
        const next = [newBill, ...prev];
        persistPurchases(next);
        return next;
      });

      notifications.show({
        color: 'teal',
        title: 'Faktur Tagihan Dibuat',
        message: `Faktur tagihan ${billNumber} berhasil dicatat ke sistem.`,
      });

      return true;
    } catch (e: any) {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: e?.message || 'Gagal menyimpan faktur pembelian.',
      });
      return false;
    }
  }, []);

  const payPurchase = useCallback((payload: PayPurchasePayload): boolean => {
    try {
      setPurchases((prev) => {
        const next = prev.map((b) => {
          if (b.id !== payload.purchaseId) return b;
          const newPaid = b.paidAmount + payload.amount;
          const newRemaining = Math.max(0, b.totalAmount - newPaid);
          const isFullyPaid = newRemaining === 0;

          return {
            ...b,
            paidAmount: newPaid,
            remainingAmount: newRemaining,
            status: isFullyPaid ? ('PAID' as const) : ('PARTIAL' as const),
          };
        });

        persistPurchases(next);
        return next;
      });

      notifications.show({
        color: 'teal',
        title: 'Pembayaran Dicatat',
        message: 'Pembayaran tagihan pembelian berhasil dibukukan.',
      });

      return true;
    } catch (e: any) {
      notifications.show({
        color: 'red',
        title: 'Gagal',
        message: e?.message || 'Gagal mencatat pembayaran.',
      });
      return false;
    }
  }, []);

  const deletePurchase = useCallback((id: string, billNumber: string) => {
    setPurchases((prev) => {
      const next = prev.filter((b) => b.id !== id);
      persistPurchases(next);
      return next;
    });

    notifications.show({
      color: 'teal',
      title: 'Faktur Dihapus',
      message: `Faktur tagihan ${billNumber} berhasil dihapus.`,
    });
  }, []);

  return {
    purchases,
    isLoading,
    refetch: fetchPurchases,
    createPurchase,
    payPurchase,
    deletePurchase,
  };
};
