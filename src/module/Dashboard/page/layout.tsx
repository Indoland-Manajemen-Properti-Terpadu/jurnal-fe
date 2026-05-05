import React, { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
    children: ReactNode;
};

function MainDashboardLayout({ children }: Props) {
    return <AppShellLayout withFooter>{children}</AppShellLayout>;
}

export default MainDashboardLayout;
