import { ReactNode } from 'react';
// import '@mantine/core/styles.css';
import { Container, AppShell, useMantineTheme, rem } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import AppMain from '@/components/AppMain';
import HeaderNav from '@/components/HeaderNav/page';
import NavbarComponent from '@/components/Navbar/page';

type Props = {
  children: ReactNode;
  footer: ReactNode;
};

function AddAccountLedgerFormLayout({ children, footer }: Props) {
  const theme = useMantineTheme();

  const tablet_match = useMediaQuery('(max-width: 768px)');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      footer={{ height: 70 }}
      navbar={{
        width: 300,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding={0}
    >
      <AppShell.Header
        style={{
          height: rem(60),
          border: 'none',
          boxShadow: tablet_match ? theme.shadows.md : theme.shadows.sm,
        }}
      >
        <Container fluid py="sm" px="lg">
          <HeaderNav
            desktopOpened={desktopOpened}
            mobileOpened={mobileOpened}
            toggleDesktop={toggleDesktop}
            toggleMobile={toggleMobile}
          />
        </Container>
      </AppShell.Header>
      <AppShell.Navbar>
        <NavbarComponent onClose={toggleMobile} />
      </AppShell.Navbar>
      <AppShell.Main>
        <AppMain>{children}</AppMain>
      </AppShell.Main>
      <AppShell.Footer px="lg">
        {footer}
      </AppShell.Footer>
    </AppShell >
  );
}

export default AddAccountLedgerFormLayout;
