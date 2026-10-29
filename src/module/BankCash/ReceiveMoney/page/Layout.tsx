import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
    children: ReactNode;
    footer: ReactNode;
};

function ReceiveMoneyLayout({ children, footer }: Props) {
    return <AppShellLayout footer={footer}>{children}</AppShellLayout>;
}

export default ReceiveMoneyLayout;
