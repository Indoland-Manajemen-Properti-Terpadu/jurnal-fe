import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
    children: ReactNode;
};

function ApprovalSettingLayout({ children }: Readonly<Props>) {
    return <AppShellLayout>{children}</AppShellLayout>;
}

export default ApprovalSettingLayout;
