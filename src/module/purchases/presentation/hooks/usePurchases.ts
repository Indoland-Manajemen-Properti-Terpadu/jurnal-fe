import { useState, useCallback, useEffect, useRef } from 'react';
import { notifications } from '@mantine/notifications';
import { t } from '@/i18n';
import {
  CreatePurchaseFormValues,
  PayPurchasePayload,
  PurchaseBill,
} from '@/module/purchases/domain/purchase';
import {
  applyPayment,
  calculateLine,
  calculateTotals,
  withDerivedStatus,
} from '@/module/purchases/domain/purchaseTotals';
import { localStoragePurchaseRepository as repository } from '@/module/purchases/infrastructure/localStoragePurchaseRepository';

const NAMESPACE = 'purchases';
const tr = (key: string, params?: Record<string, string | number>) => t(key, params, NAMESPACE);

const errorMessage = (error: unknown, fallbackKey: string): string =>
  (error instanceof Error && error.message) || tr(fallbackKey);

const notifyFailure = (message: string) =>
  notifications.show({ color: 'red', title: tr('notify.failedTitle'), message });

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<PurchaseBill[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const latest = useRef<PurchaseBill[]>([]);

  const commit = useCallback((next: PurchaseBill[]) => {
    repository.save(next);
    latest.current = next;
    setPurchases(next);
  }, []);

  const fetchPurchases = useCallback(() => {
    setIsLoading(true);
    try {
      const now = Date.now();
      const mapped = repository.load().map((bill) => withDerivedStatus(bill, now));
      latest.current = mapped;
      setPurchases(mapped);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPurchases();
  }, [fetchPurchases]);

  const createPurchase = useCallback(
    (values: CreatePurchaseFormValues): boolean => {
      try {
        const inputs = values.items.map((item) => ({
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice) || 0,
          taxRate: Number(item.taxRate) || 0,
        }));
        const { subtotal, taxAmount, totalAmount } = calculateTotals(inputs);

        const items = values.items.map((item, idx) => ({
          id: `line-${Date.now()}-${idx}`,
          itemName: item.itemName,
          description: item.description,
          quantity: inputs[idx].quantity,
          unitPrice: inputs[idx].unitPrice,
          taxRate: inputs[idx].taxRate,
          total: calculateLine(inputs[idx]).total,
        }));

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

        commit([newBill, ...latest.current]);

        notifications.show({
          color: 'teal',
          title: tr('notify.createdTitle'),
          message: tr('notify.createdMessage', { billNumber }),
        });
        return true;
      } catch (error) {
        notifyFailure(errorMessage(error, 'notify.createFailed'));
        return false;
      }
    },
    [commit]
  );

  const payPurchase = useCallback(
    (payload: PayPurchasePayload): boolean => {
      try {
        commit(
          latest.current.map((bill) =>
            bill.id === payload.purchaseId
              ? { ...bill, ...applyPayment(bill, payload.amount) }
              : bill
          )
        );

        notifications.show({
          color: 'teal',
          title: tr('notify.paidTitle'),
          message: tr('notify.paidMessage'),
        });
        return true;
      } catch (error) {
        notifyFailure(errorMessage(error, 'notify.payFailed'));
        return false;
      }
    },
    [commit]
  );

  const deletePurchase = useCallback(
    (id: string, billNumber: string) => {
      try {
        commit(latest.current.filter((bill) => bill.id !== id));
        notifications.show({
          color: 'teal',
          title: tr('notify.deletedTitle'),
          message: tr('notify.deletedMessage', { billNumber }),
        });
      } catch (error) {
        notifyFailure(errorMessage(error, 'notify.deleteFailed'));
      }
    },
    [commit]
  );

  return {
    purchases,
    isLoading,
    refetch: fetchPurchases,
    createPurchase,
    payPurchase,
    deletePurchase,
  };
};
