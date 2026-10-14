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
import { useAuthStore } from '@/store/useAuthentications';
import { routes } from '@/router/routes';
import { usePendingChangesCount } from '@/module/PendingChanges/hooks/usePendingChangesQueries';
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
import { LinksGroup } from './Links/page';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-md-transparent.svg';
import { themeColors } from '@/theme';

const mockdata = [
  {
    title: 'UTAMA',
    links: [
      { label: 'Ringkasan', icon: HouseLine, link: '/dashboard' },
      { label: 'Laporan Keuangan', icon: ChartPieSlice, link: '/result-reports' },
      { label: 'Perencanaan Anggaran', icon: Money, link: '/budget-planning' },
    ],
  },
  {
    title: 'TRANSAKSI',
    links: [
      { label: 'Kas & Bank', icon: Bank, link: '/bank-cash' },
      { label: 'Penjualan', icon: Storefront, link: '/sales' },
      { label: 'Pembelian', icon: ShoppingCart, link: '/pembelian' },
      { label: 'Biaya', icon: Receipt, link: '/finance/cost' },
      { label: 'Persetujuan Perubahan', icon: ShieldCheck, link: routes.pendingChanges.main },
    ],
  },
  {
    title: 'OPERASIONAL',
    links: [
      { label: 'Produk', icon: BoundingBox, link: '/products' },
      {
        label: 'Produksi',
        icon: Storefront,
        link: '/production',
      },
      { label: 'Pemenuhan', icon: Truck, link: '/fulfillment' },
    ],
  },
  {
    title: 'MASTER DATA',
    links: [
      { label: 'Daftar Akun', icon: ListBullets, link: '/general-journal' },
      { label: 'Asset', icon: Toolbox, link: '/asset' },
      { label: 'Kontak', icon: AddressBook, link: '/contact' },
    ],
  },
  {
    title: 'LAINNYA',
    links: [
      {
        label: 'Settings',
        icon: GearSix,
        links: [
          {
            label: 'Pusat Pengaturan',
            link: routes.settings.main,
          },
          {
            label: 'Pengaturan Umum',
            link: routes.settings.general,
          },
          {
            label: 'Pemetaan Akun',
            link: routes.settings.accountMapping,
          },
          {
            label: 'Pajak',
            link: routes.settings.taxes,
          },
          {
            label: 'Syarat Pembayaran',
            link: routes.settings.paymentTerms,
          },
          {
            label: 'Metode Pembayaran',
            link: routes.settings.paymentMethods,
          },
          {
            label: 'Format Penomoran',
            link: routes.settings.numberFormats,
          },
          {
            label: 'Tag Transaksi',
            link: routes.settings.tags,
          },
          {
            label: 'Company Setting',
            link: routes.baseModules.companySetting,
          },
          {
            label: 'User Management',
            link: routes.userManagement.main,
          },
          {
            label: 'Approval Setting',
            link: routes.pendingChanges.main,
          },
        ],
      },
    ],
  }
];

type NavigationProps = {
  onClose: () => void;
  collapsed?: boolean;
  desktopOpened?: boolean;
  toggleDesktop?: () => void;
};

const NavbarComponent = ({ onClose, collapsed = false, desktopOpened = true, toggleDesktop }: NavigationProps) => {
  const navigate = useNavigate();
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
  const pendingCount = typeof rawCount === 'number' ? rawCount : (rawCount as any)?.data?.count ?? 0;

  const handleLogout = () => {
    clearTokens();
    navigate(routes.login);
  };

  const links = mockdata.map((item) => (
    <Box mb={collapsed ? 'sm' : rem(18)} key={item.title}>
      <Text pl={10} mb={8} className={classes.linkHeader} ta={collapsed ? 'center' : 'left'}>
        {collapsed ? '•••' : item.title}
      </Text>
      {item.links.map((linkItem) => {
        const isPendingChanges = 'link' in linkItem && linkItem.link === routes.pendingChanges.main;
        const badge = isPendingChanges && pendingCount > 0 ? (
          <Badge size="xs" color="orange" variant="filled" circle>
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
          {!collapsed && <Image src={LogoProapps} style={{ width: rem(118) }} />}
          <Tooltip label={desktopOpened ? 'Ciutkan menu' : 'Perluas menu'} position="right" withArrow>
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
            <Tooltip label="Keluar" withArrow>
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
