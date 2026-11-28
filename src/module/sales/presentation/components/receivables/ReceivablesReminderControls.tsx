import { useState } from 'react';
import type { ReceivableCustomerRow, ReceivableInvoiceRow } from '@/module/sales/domain/saleReceivables';
import { useSendInvoiceReminder } from '../../hooks/useSaleMutations';
import { CustomerReminderDialog } from './CustomerReminderDialog';
import { InvoiceReminderDialog, type ReminderTarget } from './InvoiceReminderDialog';

export function ReceivablesReminderControls({
  customer,
  invoice,
  onCloseCustomer,
  onCloseInvoice,
  onSent,
}: Readonly<{
  customer: ReceivableCustomerRow | null;
  invoice: ReceivableInvoiceRow | null;
  onCloseCustomer: () => void;
  onCloseInvoice: () => void;
  onSent: () => Promise<void>;
}>) {
  const reminder = useSendInvoiceReminder();
  const [selected, setSelected] = useState<ReminderTarget | null>(null);
  const active = invoice || selected;
  const close = () => {
    setSelected(null);
    onCloseInvoice();
    onCloseCustomer();
  };
  const send = (target: ReminderTarget & { email: string; message: string }) => reminder.mutate(
    { ...target, number: target.transactionNumber },
    { onSuccess: async () => {
      close();
      await onSent();
    } }
  );

  return (
    <>
      <CustomerReminderDialog
        customerId={selected ? null : customer?.customer.id || null}
        customerName={customer?.customer.name || ''}
        onClose={onCloseCustomer}
        onSelect={setSelected}
      />
      {active && <InvoiceReminderDialog key={active.id} target={active} sending={reminder.isPending} onClose={close} onSend={send} />}
    </>
  );
}
