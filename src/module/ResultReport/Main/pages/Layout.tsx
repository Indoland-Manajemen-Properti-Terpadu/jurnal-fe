import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
    children: ReactNode;
};

function ResultReportLayout({ children }: Readonly<Props>) {
    return <AppShellLayout>{children}</AppShellLayout>;
}

export default ResultReportLayout;
