import {
  IconBuildingStore,
  IconCalendar,
  IconCalendarDue,
  IconCash,
  IconCreditCard,
  IconListDetails,
  IconTruckDelivery,
  IconWallet,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type {
  GoodsReceipt,
  PaymentVoucher,
  PurchaseBill,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseReturn,
} from '@/module/purchases/domain/purchaseDocuments';
import { isBillOverdue } from '@/module/purchases/domain/purchaseActions';
import {
  DetailHighlights,
  type Highlight,
} from '@/module/purchases/presentation/components/shared/DetailHighlights';
import {
  formatAmount,
  formatDay,
  todayIso,
} from '@/module/purchases/presentation/components/shared/format';

const DASH = '-';

/** Builds the label/value helpers every document's highlight strip shares. */
const useHighlightText = () => {
  const { t, currentLanguage } = useTranslation('purchases');
  return {
    label: (key: string) => t(`highlights.${key}`),
    day: (value: string | null | undefined) => (value ? formatDay(value, currentLanguage) : DASH),
  };
};

export const RequestHighlights = ({ doc }: Readonly<{ doc: PurchaseRequest }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconCalendar, label: label('date'), value: day(doc.date) },
    {
      icon: IconCalendarDue,
      label: label('requiredDate'),
      value: day(doc.requiredDate),
    },
    {
      icon: IconBuildingStore,
      label: label('department'),
      value: doc.department || DASH,
    },
    {
      icon: IconListDetails,
      label: label('items'),
      value: String(doc.items.length),
    },
  ];
  return <DetailHighlights items={items} />;
};

export const OrderHighlights = ({ doc }: Readonly<{ doc: PurchaseOrder }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconBuildingStore, label: label('vendor'), value: doc.vendor.name },
    { icon: IconCalendar, label: label('date'), value: day(doc.date) },
    {
      icon: IconTruckDelivery,
      label: label('expectedDate'),
      value: day(doc.expectedDate),
    },
    {
      icon: IconCash,
      label: label('total'),
      value: formatAmount(doc.finalAmount),
    },
  ];
  return <DetailHighlights items={items} />;
};

export const ReceiptHighlights = ({ doc }: Readonly<{ doc: GoodsReceipt }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconBuildingStore, label: label('vendor'), value: doc.vendor.name },
    { icon: IconCalendar, label: label('date'), value: day(doc.date) },
    {
      icon: IconTruckDelivery,
      label: label('deliveryNote'),
      value: doc.deliveryNote || DASH,
    },
    {
      icon: IconListDetails,
      label: label('items'),
      value: String(doc.items.length),
    },
  ];
  return <DetailHighlights items={items} />;
};

export const BillHighlights = ({ doc }: Readonly<{ doc: PurchaseBill }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconBuildingStore, label: label('vendor'), value: doc.vendor.name },
    {
      icon: IconCalendarDue,
      label: label('dueDate'),
      value: day(doc.dueDate),
      alert: isBillOverdue(doc, todayIso()),
    },
    {
      icon: IconCash,
      label: label('total'),
      value: formatAmount(doc.finalAmount),
    },
    {
      icon: IconWallet,
      label: label('remaining'),
      value: formatAmount(doc.remainingAmount),
    },
  ];
  return <DetailHighlights items={items} />;
};

export const PaymentHighlights = ({ doc }: Readonly<{ doc: PaymentVoucher }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconBuildingStore, label: label('vendor'), value: doc.vendor.name },
    { icon: IconCalendar, label: label('date'), value: day(doc.paidAt ?? doc.date) },
    {
      icon: IconCash,
      label: label('total'),
      value: formatAmount(doc.totalAmount),
    },
    {
      icon: IconCreditCard,
      label: label('method'),
      value: doc.paymentMethod?.name ?? DASH,
    },
  ];
  return <DetailHighlights items={items} />;
};

export const ReturnHighlights = ({ doc }: Readonly<{ doc: PurchaseReturn }>) => {
  const { label, day } = useHighlightText();
  const items: Highlight[] = [
    { icon: IconBuildingStore, label: label('vendor'), value: doc.vendor.name },
    { icon: IconCalendar, label: label('date'), value: day(doc.date) },
    {
      icon: IconCash,
      label: label('total'),
      value: formatAmount(doc.finalAmount),
    },
    {
      icon: IconWallet,
      label: label('appliedToBill'),
      value: formatAmount(doc.appliedToBill),
    },
  ];
  return <DetailHighlights items={items} />;
};
