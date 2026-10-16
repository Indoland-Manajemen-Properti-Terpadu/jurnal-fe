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
import { useNavigate } from 'react-router-dom';
import {
  AddressBook,
  Bank,
  Toolbox,
  ChartPieSlice,
  GearSix,
  Receipt,
  SignOut,
  Money,
  ListBullets,
  Truck,
  BoundingBox,
  ShoppingCart,
  Storefront,
  HouseLine,
  SidebarSimpleIcon,
  ShieldCheck,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/useAuthentications';
import { routes } from '@/router/routes';
import { usePendingChangesCount } from '@/module/PendingChanges/hooks/usePendingChangesQueries';
import { useTranslation } from '@/i18n';
import { LinksGroup } from './Links/page';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-brand-badge.svg';
import IconProapps from '@/assets/img/proapps-brand-icon.svg';
import { themeColors } from '@/theme';

const getNavGroups = (t: (key: string) => string) => [
  {
    title: t('groupMain').toUpperCase(),
    links: [
      { label: t('dashboard'), icon: HouseLine, link: '/dashboard' },
      { label: t('financialReports'), icon: ChartPieSlice, link: '/result-reports' },
      { label: t('budgetPlanning'), icon: Money, link: '/budget-planning' },
    ],
  },
  {
    title: t('groupTransactions').toUpperCase(),
    links: [
      { label: t('cashBank'), icon: Bank, link: '/bank-cash' },
      { label: t('sales'), icon: Storefront, link: '/sales' },
      { label: t('purchases'), icon: ShoppingCart, link: '/pembelian' },
      { label: t('expenses'), icon: Receipt, link: '/finance/cost' },
      { label: t('pendingChanges'), icon: ShieldCheck, link: routes.pendingChanges.main },
    ],
  },
  {
    title: t('groupOperations').toUpperCase(),
    links: [
      { label: t('products'), icon: BoundingBox, link: '/products' },
      {
        label: t('production'),
        icon: Storefront,
        link: '/production',
      },
      { label: t('fulfillment'), icon: Truck, link: '/fulfillment' },
    ],
  },
  {
    title: t('groupMasterData').toUpperCase(),
    links: [
      { label: t('chartOfAccounts'), icon: ListBullets, link: '/general-journal' },
      { label: t('assets'), icon: Toolbox, link: '/asset' },
      { label: t('contacts'), icon: AddressBook, link: '/contact' },
    ],
  },
  {
    title: t('groupOthers').toUpperCase(),
    links: [
      {
        label: t('settings'),
        icon: GearSix,
        link: routes.settings.main,
      },
    ],
  },
];

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
  const navGroups = getNavGroups(t);
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
    typeof rawCount === 'number' ? rawCount : ((rawCount as any)?.data?.count ?? 0);

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login);
  };

  const links = navGroups.map((item) => (
    <Box mb={collapsed ? 'sm' : rem(18)} key={item.title}>
      <Text pl={10} mb={8} className={classes.linkHeader} ta={collapsed ? 'center' : 'left'}>
        {collapsed ? '•••' : item.title}
      </Text>
      {item.links.map((linkItem) => {
        const isPendingChanges = 'link' in linkItem && linkItem.link === routes.pendingChanges.main;
        const badge =
          isPendingChanges && pendingCount > 0 ? (
            <Badge
              size="xs"
              color="orange"
              variant="filled"
              radius="xl"
              style={{
                padding: '0 6px',
                height: 18,
                minWidth: 18,
                fontSize: 10,
                fontWeight: 700,
                lineHeight: '18px',
              }}
            >
              {pendingCount > 99 ? '99+' : pendingCount}
            </Badge>
          ) : undefined;

        return (
          <LinksGroup
            {...linkItem}
            badge={badge}
            key={linkItem.label}
            closeSidebar={onClose}
            collapsed={collapsed}
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

      <ScrollArea className={classes.links} type={collapsed ? 'never' : 'hover'} scrollbarSize={6}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <div className={classes.userCard}>
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
              <Text fz={11} c="dimmed" truncate>
                Jurnal Accounting
              </Text>
            </Box>
          )}
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
