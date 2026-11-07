import {
  Box,
  Group,
  rem,
  ScrollArea,
  Text,
  Image,
  UnstyledButton,
  Tooltip,
  ActionIcon,
  Avatar,
  Badge,
} from '@mantine/core';
import { useLayoutEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { SignOut, SidebarSimpleIcon } from '@phosphor-icons/react';
import { useAuthStore } from '@/store/useAuthentications';
import { routes } from '@/router/routes';
import { filterNavigation, type CanReadMenu } from '@/components/Navbar/navigationAccess';
import { navigationSections } from '@/components/Navbar/navigationRegistry';
import { useNavigationAccess } from '@/components/Navbar/useNavigationAccess';
import { usePendingChangesCount } from '@/module/pending-changes';
import { useTranslation } from '@/i18n';
import { LinksGroup, type LinksGroupChild } from '@/components/Navbar/Links/NavLinksGroup';
import classes from '@/components/Navbar/Navbar.module.css';
import LogoProapps from '@/assets/images/brand/badge.svg';
import IconProapps from '@/assets/images/brand/mark.svg';
import { themeColors } from '@/theme';

// Remembered across page changes: every page mounts its own shell, which would otherwise
// reset the sidebar scroll to the top after each navigation.
let savedSidebarScroll = 0;

type NavLinkEntry = {
  id: string;
  label: string;
  icon: React.ElementType;
  link: string;
  match?: string;
  badge?: 'pendingChanges';
  links?: LinksGroupChild[];
};
type NavGroupEntry = { id: string; title: string; links: NavLinkEntry[] };

const getNavGroups = (t: (key: string) => string, canRead: CanReadMenu): NavGroupEntry[] =>
  filterNavigation(navigationSections, canRead).map((section) => ({
    id: section.id,
    title: t(section.groupKey).toUpperCase(),
    links: section.items.map((item) => ({
      id: item.id,
      label: t(item.labelKey),
      icon: item.icon,
      link: item.link,
      match: item.match,
      badge: item.badge,
      links: item.children?.map((child) => ({
        label: t(child.labelKey),
        link: child.link,
        icon: child.icon,
      })),
    })),
  }));

type NavigationProps = {
  onClose: () => void;
  collapsed?: boolean;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

const NavbarComponent = ({
  onClose,
  collapsed = false,
  desktopOpened = true,
  toggleDesktop,
}: NavigationProps) => {
  const navigate = useNavigate();
  const { t } = useTranslation('navigation');
  const canRead = useNavigationAccess();
  const navGroups = getNavGroups(t, canRead);
  const navigationLinks = navGroups.flatMap((group) =>
    group.links.flatMap((item) =>
      (item.match ?? item.link) ? [item.match ?? (item.link as string)] : []
    )
  );
  const { userName, clearTokens } = useAuthStore();
  const displayName = userName || 'Finance';
  const initials = displayName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const pendingCountQuery = usePendingChangesCount();
  const rawCount = pendingCountQuery.data;
  const pendingCount =
    typeof rawCount === 'number'
      ? rawCount
      : ((rawCount as { data?: { count?: number } } | undefined)?.data?.count ?? 0);

  const viewportRef = useRef<HTMLDivElement>(null);
  const restoredRef = useRef(false);
  useLayoutEffect(() => {
    if (viewportRef.current) viewportRef.current.scrollTop = savedSidebarScroll;
    restoredRef.current = true;
  }, []);

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login);
  };

  const links = navGroups.map((item) => (
    <Box mb={collapsed ? 'sm' : rem(18)} key={item.id}>
      <Text pl={10} mb={8} className={classes.linkHeader} ta={collapsed ? 'center' : 'left'}>
        {collapsed ? '•••' : item.title}
      </Text>
      {item.links.map((linkItem) => {
        const badge =
          linkItem.badge === 'pendingChanges' && pendingCount > 0 ? (
            <Badge
              size="xs"
              color="orange"
              variant="filled"
              radius="xl"
              style={{
                padding: '0 6px',
                height: 18,
                minWidth: 18,
                fontSize: 'var(--jurnal-text-xs)',
                fontWeight: 700,
                lineHeight: '18px',
              }}
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          ) : undefined;

        return (
          <LinksGroup
            label={linkItem.label}
            icon={linkItem.icon}
            link={linkItem.link}
            match={linkItem.match}
            links={linkItem.links}
            expandOnly={Boolean(linkItem.links?.length)}
            badge={badge}
            key={linkItem.id}
            closeSidebar={onClose}
            collapsed={collapsed}
            siblingLinks={navigationLinks}
          />
        );
      })}
    </Box>
  ));

  return (
    <nav className={classes.navbar} data-collapsed={collapsed || undefined}>
      <div className={classes.header}>
        <Group justify={collapsed ? 'center' : 'space-between'} w="100%" wrap="nowrap">
          {collapsed ? (
            <Tooltip label="Perluas menu" position="right" withArrow>
              <UnstyledButton
                onClick={toggleDesktop}
                style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                aria-label="Perluas menu navigasi"
              >
                <Image
                  src={IconProapps}
                  style={{ width: rem(34), height: rem(34) }}
                  alt="Proapps Icon"
                />
              </UnstyledButton>
            </Tooltip>
          ) : (
            <Image src={LogoProapps} style={{ width: rem(138) }} alt="Proapps Logo" />
          )}

          {!collapsed && (
            <Tooltip
              label={desktopOpened ? 'Ciutkan menu' : 'Perluas menu'}
              position="right"
              withArrow
            >
              <ActionIcon
                visibleFrom="md"
                onClick={toggleDesktop}
                variant="light"
                color="primary"
                radius="md"
                size={34}
                aria-label="Toggle side navigation"
              >
                <SidebarSimpleIcon
                  size={18}
                  weight="duotone"
                  style={{ transform: desktopOpened ? 'none' : 'scaleX(-1)' }}
                />
              </ActionIcon>
            </Tooltip>
          )}
        </Group>
      </div>

      <ScrollArea
        className={classes.links}
        type={collapsed ? 'never' : 'hover'}
        scrollbarSize={6}
        viewportRef={viewportRef}
        onScrollPositionChange={({ y }) => {
          if (restoredRef.current) savedSidebarScroll = y;
        }}
      >
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <div className={classes.userCard}>
          <Tooltip label={t('profile')} position="right" withArrow>
            <UnstyledButton
              className={classes.userLink}
              onClick={() => {
                navigate(routes.profile);
                onClose();
              }}
              aria-label={t('profile')}
            >
              <Avatar
                radius="md"
                size={36}
                variant="gradient"
                gradient={{ from: themeColors.primary[7], to: themeColors.primary[4], deg: 135 }}
              >
                {initials || 'F'}
              </Avatar>
              {!collapsed && (
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={700} c="dark.8" truncate>
                    {displayName}
                  </Text>
                  <Text fz="var(--jurnal-text-xs)" c="dimmed" truncate>
                    Jurnal Accounting
                  </Text>
                </Box>
              )}
            </UnstyledButton>
          </Tooltip>
          {!collapsed && (
            <Tooltip label={t('logout')} withArrow>
              <UnstyledButton className={classes.logout} onClick={handleLogout} aria-label="Logout">
                <SignOut size={18} weight="bold" />
              </UnstyledButton>
            </Tooltip>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;
