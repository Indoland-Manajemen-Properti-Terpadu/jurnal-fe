import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
  children: ReactNode;
};

function AssetLayout({ children }: Readonly<Props>) {
  return <AppShellLayout>{children}</AppShellLayout>;
}

export default AssetLayout;
