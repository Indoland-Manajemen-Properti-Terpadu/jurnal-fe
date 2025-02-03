// import '@mantine/core/styles.css';
import { AppShell, useMantineTheme } from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
// import { HeaderNavbar } from '@/components/HeaderNav/page';
import { HeroComponent } from '@/components/Hero/page';
import { HeaderLandingPage } from '@/module/LandingPage/components/HeaderLandingPage/HeaderLandingPage';

function LandingPage() {
  const theme = useMantineTheme();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  return (
    <>
      <AppShell
        header={{ height: 60 }}
        // navbar={{
        //   width: 300,
        //   breakpoint: 'sm',
        //   collapsed: { mobile: !mobileOpened },
        // }}
        padding="md"
      >
        <AppShell.Header>
          <HeaderLandingPage />
        </AppShell.Header>
        <AppShell.Main>
          <HeroComponent />
        </AppShell.Main>
      </AppShell>
    </>
  );
}

export default LandingPage;
