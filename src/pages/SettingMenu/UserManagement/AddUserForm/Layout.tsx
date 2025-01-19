import React, { ReactNode } from 'react';
import '@mantine/core/styles.css';
import {
  MantineProvider,
  Container,
  Group,
  AppShell,
  useMantineTheme,
  Burger,
  rem,
  Switch,
  Button,
} from '@mantine/core';
import styles from './CompanyProfile.module.css';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import AppMain from '@/components/AppMain';
import FooterNav from '@/components/FooterNav';
import HeaderNav from '@/components/HeaderNav/page';
import NavbarComponent from '@/components/Navbar/page';
import classes from './AddUserForm.module.css';
import { routes } from '@/router';
import { useNavigate } from 'react-router-dom';

type Props = {
  children: ReactNode;
};

function AddUserFormLayout({ children }: Props) {
  const theme = useMantineTheme();
  const navigate = useNavigate();
  const tablet_match = useMediaQuery('(max-width: 768px)');
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const actionButtons = [
    {
      label: 'Cancel',
      variant: 'light',
      color: '#F1F3F5',
      textColor: '#495057',
      onClick: () => console.log('Add Role Clicked'),
    },
    {
      label: 'Add User',
      variant: 'gradient',
      gradient: { from: 'blue', to: 'cyan', deg: 90 },
      textColor: 'white',
      onClick: () => navigate(routes.addUserForm),
    },
  ];

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      footer={{ height: 60 }}
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
      <AppShell.Footer p="md">
        <Container fluid px="lg">
          <Group grow>
            <Switch
              defaultChecked
              color="cyan"
              label="Active"
              size="lg"
              classNames={{ track: classes.switches }}
            />
            <Group justify="flex-end">
              {actionButtons.map((button, index) => (
                <Button
                  key={index}
                  variant={button.variant}
                  gradient={button.gradient}
                  onClick={button.onClick}
                  style={{
                    backgroundColor: button.color || '#F1F3F5',
                    color: button.textColor || '#495057',
                  }}
                >
                  {button.label}
                </Button>
              ))}
            </Group>
          </Group>
        </Container>
      </AppShell.Footer>
    </AppShell>
  );
}

export default AddUserFormLayout;
