import { ReactNode } from 'react';
import { Container } from '@mantine/core';
import { AppShellLayout } from '@/components/AppShellLayout';
import { PrototypeNotice } from '@/components/PlannedModule';

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

/** Every period closing screen is sample data for now, so each one opens with the notice. */
function PeriodClosingLayout({ children, footer }: Props) {
  return (
    <AppShellLayout footer={footer}>
      <Container fluid pt="md">
        <PrototypeNotice />
      </Container>
      {children}
    </AppShellLayout>
  );
}

export default PeriodClosingLayout;
