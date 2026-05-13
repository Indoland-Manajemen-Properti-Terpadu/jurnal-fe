import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

function AddAccountLedgerFormLayout({ children, footer }: Props) {
  return <AppShellLayout footer={footer}>{children}</AppShellLayout>;
}

export default AddAccountLedgerFormLayout;
