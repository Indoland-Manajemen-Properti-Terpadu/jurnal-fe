import { ReactNode } from 'react';
import { AppShell, Container, rem } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import AppMain from '@/components/AppMain';
import FooterNav from '@/components/FooterNav';
import HeaderNav from '@/components/HeaderNav/page';
import NavbarComponent from '@/components/Navbar/page';
import { semanticColors } from '@/theme/constants';
import { primaryColor } from '@/theme';

export const appShellLayout = {
    headerHeight: 72,
    footerHeight: 48,
    footerActionHeight: 72,
    navbarExpandedWidth: 280,
    navbarCollapsedWidth: 84,
    breakpoint: 'md',
    headerPadding: 16,
} as const;

type AppShellLayoutProps = {
    children: ReactNode;
    footer?: ReactNode;
    withFooter?: boolean;
    footerHeight?: number;
};

const AppShellLayout = ({
    children,
    footer,
    withFooter = false,
    footerHeight = footer ? appShellLayout.footerActionHeight : appShellLayout.footerHeight,
}: AppShellLayoutProps) => {
    const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
    const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

    return (
        <AppShell
            layout="alt"
            header={{
                height: appShellLayout.headerHeight,
            }}
            footer={withFooter || footer ? { height: footerHeight } : undefined}
            navbar={{
                width: desktopOpened ? appShellLayout.navbarExpandedWidth : appShellLayout.navbarCollapsedWidth,
                breakpoint: appShellLayout.breakpoint,
                collapsed: { mobile: !mobileOpened },
            }}
            padding={0}
        >
            <AppShell.Header
                style={{
                    height: rem(appShellLayout.headerHeight),
                    borderBottom: '1px solid rgba(15, 23, 42, 0.06)',
                    background: 'rgba(255, 255, 255, 0.78)',
                    backdropFilter: 'blur(16px) saturate(160%)',
                    WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                }}
            >
                <Container fluid h="100%" px={{ base: 'md', sm: 'lg' }}>
                    <HeaderNav
                        desktopOpened={desktopOpened}
                        mobileOpened={mobileOpened}
                        toggleDesktop={toggleDesktop}
                        toggleMobile={toggleMobile}
                    />
                </Container>
            </AppShell.Header>

            <AppShell.Navbar>
                <NavbarComponent
                    onClose={toggleMobile}
                    collapsed={!desktopOpened}
                    desktopOpened={desktopOpened}
                    toggleDesktop={toggleDesktop}
                />
            </AppShell.Navbar>

            <AppShell.Main>
                <AppMain>{children}</AppMain>
            </AppShell.Main>

            {(withFooter || footer) && (
                <AppShell.Footer
                    p={footer ? 0 : 0}
                    px={footer ? 'lg' : undefined}
                    style={{
                        borderTop: '1px solid rgba(15, 23, 42, 0.06)',
                        background: 'rgba(255, 255, 255, 0.82)',
                        backdropFilter: 'blur(16px) saturate(160%)',
                        WebkitBackdropFilter: 'blur(16px) saturate(160%)',
                    }}
                >
                    {footer ?? (
                        <Container fluid h="100%" px={{ base: 'md', sm: 'lg' }}>
                            <FooterNav />
                        </Container>
                    )}
                </AppShell.Footer>
            )}
        </AppShell>
    );
};

export default AppShellLayout;
