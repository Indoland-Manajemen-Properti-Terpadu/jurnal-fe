import { ReactNode } from 'react';
import AppShellLayout from '@/components/AppShellLayout';

type Props = {
    children: ReactNode;
};

function BudgetPlanningLayout({ children }: Readonly<Props>) {
    return <AppShellLayout>{children}</AppShellLayout>;
}

export default BudgetPlanningLayout;
