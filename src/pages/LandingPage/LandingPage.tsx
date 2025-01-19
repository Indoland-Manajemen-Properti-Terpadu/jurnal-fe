import '@mantine/core/styles.css';
import { NavbarHeader } from '@/components/SideNavbar/page';
import { MantineProvider, Container, Group, AppShell, useMantineTheme } from '@mantine/core';
import styles from './CompanyProfile.module.css';
import IconsCarousell from '../../../public/images/Circle-TealWhite.svg';
import { CarouselCompanyProfile } from '@/components/Carousell/Carousell';
import { Welcome } from '@/components/Welcome/Welcome';
// import { HeaderNavbar } from '@/components/HeaderNav/page';
import { CarouselLoginComponent } from '@/components/Carousell/CarouselLogin';
import { HeroComponent } from '@/components/Hero/page';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import HeaderNav from '@/components/HeaderNav/page';
import { HeaderLandingPage } from '@/components/HeaderLandingPage/HeaderLandingPage';

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
