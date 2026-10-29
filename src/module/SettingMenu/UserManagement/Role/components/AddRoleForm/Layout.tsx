import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

function AddRoleFormLayout({ children, footer }: Readonly<Props>) {
  return <AppShellLayout footer={footer}>{children}</AppShellLayout>;
}

export default AddRoleFormLayout;
