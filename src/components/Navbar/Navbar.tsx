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
  Coins,
  Wallet,
  Buildings,
  Calculator,
  ArrowsLeftRight,
  UsersThree,
  IdentificationCard,
  Sliders,
  TreeStructure,
  Percent,
  ClockCountdown,
  CreditCard,
  Hash,
  Tag,
  UserCircle,
} from '@phosphor-icons/react';
import { useAuthStore } from '@/store/useAuthentications';
import { routes } from '@/router/routes';
import { settingsGroups } from '@/components/Navbar/settingsMenu';
import { usePendingChangesCount } from '@/module/pending-changes';
import { useTranslation } from '@/i18n';
import { LinksGroup } from '@/components/Navbar/Links/NavLinksGroup';
import classes from '@/components/Navbar/Navbar.module.css';
import LogoProapps from '@/assets/images/brand/badge.svg';
import IconProapps from '@/assets/images/brand/mark.svg';
import { themeColors } from '@/theme';

const settingsGroupIcons: Record<string, React.ElementType> = {
  general: Buildings,
  accounting: Calculator,
  transactions: ArrowsLeftRight,
  access: UsersThree,
};

const settingsItemIcons: Record<string, React.ElementType> = {
  company: IdentificationCard,
  general: Sliders,
  accountMapping: TreeStructure,
  taxes: Percent,
  paymentTerms: ClockCountdown,
  paymentMethods: CreditCard,
  numberFormats: Hash,
  tags: Tag,
};

// Remembered across page changes: every page mounts its own shell, which would otherwise
// reset the sidebar scroll to the top after each navigation.
let savedSidebarScroll = 0;

const getNavGroups = (t: (key: string) => string, ts: (key: string) => string) => [
  {
    title: t('groupMain').toUpperCase(),
    links: [
      { label: t('dashboard'), icon: HouseLine, link: routes.dashboard },
      { label: t('financialReports'), icon: ChartPieSlice, link: routes.reports.main },
      { label: t('budgetPlanning'), icon: Money, link: routes.budgeting.planning },
    ],
  },
  {
    title: t('groupTransactions').toUpperCase(),
    links: [
      {
        label: t('cashBank'),
        icon: Bank,
        link: routes.bankCash.main,
        links: [
          { label: t('cashBankAccounts'), icon: Wallet, link: routes.bankCash.main },
          { label: t('pettyCash'), icon: Coins, link: routes.pettyCash.main },
        ],
      },
      { label: t('sales'), icon: Storefront, link: routes.sales.main },
      { label: t('purchases'), icon: ShoppingCart, link: routes.purchases.main },
      { label: t('expenses'), icon: Receipt, link: routes.costs.main },
      { label: t('pendingChanges'), icon: ShieldCheck, link: routes.pendingChanges.main },
    ],
  },
  {
    title: t('groupOperations').toUpperCase(),
    links: [
      { label: t('products'), icon: BoundingBox, link: routes.products.main },
      {
        label: t('production'),
        icon: Storefront,
        link: routes.production.main,
      },
      { label: t('fulfillment'), icon: Truck, link: routes.fulfillment.main },
    ],
  },
  {
    title: t('groupMasterData').toUpperCase(),
    links: [
      { label: t('chartOfAccounts'), icon: ListBullets, link: routes.chartOfAccounts.main },
      { label: t('assets'), icon: Toolbox, link: routes.assets.main },
      { label: t('contacts'), icon: AddressBook, link: routes.contacts.main },
    ],
  },
  {
    title: t('groupSettings').toUpperCase(),
    links: [
      ...settingsGroups.map((group) => {
        const Icon = settingsGroupIcons[group.key] ?? GearSix;
        const [first] = group.items;
        if (group.items.length === 1) {
          return { label: ts(`item.${first.key}`), icon: Icon, link: first.path };
        }
        return {
          label: ts(`group.${group.key}`),
          icon: Icon,
          link: first.path,
          expandOnly: true,
          links: group.items.map((item) => ({
            label: ts(`item.${item.key}`),
            icon: settingsItemIcons[item.key],
            link: item.path,
          })),
        };
      }),
      { label: t('profile'), icon: UserCircle, link: routes.profile },
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
  const { t: ts } = useTranslation('settings');
  const navGroups = getNavGroups(t, ts);
  const navigationLinks = navGroups.flatMap((group) =>
    group.links.flatMap((item) => ('link' in item && item.link ? [item.link] : []))
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
            {...linkItem}
            badge={badge}
            key={linkItem.label}
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
