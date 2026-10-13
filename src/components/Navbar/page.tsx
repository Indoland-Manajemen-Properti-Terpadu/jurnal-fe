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
  Divider,
} from '@mantine/core';
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
      { label: 'Penjualan', icon: Storefront, link: '/setting-budget/budget-management' },
      { label: 'Pembelian', icon: ShoppingCart, link: '/pembelian' },
      { label: 'Biaya', icon: Receipt, link: '/finance/cost' },
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
            label: 'Company Setting',
            link: '/settings/company-setting',
          },
          {
            label: 'User Management',
            link: '/settings/user-management',
          },
          {
            label: 'Approval Setting',
            link: '/settings/approval-setting',
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
  const links = mockdata.map((item, index) => (
    <Box pl={0} mb={collapsed ? 'xs' : rem(12)} key={item.title}>
      <Text
        tt="uppercase"
        size="xs"
        pl={8}
        fw={500}
        mb={8}
        className={classes.linkHeader}
        ta={collapsed ? 'center' : 'left'}
      >
        {collapsed ? item.title.slice(0, 3) : item.title}
      </Text>
      {item.links.map((linkItem) => (
        <LinksGroup {...linkItem} key={linkItem.label} closeSidebar={onClose} collapsed={collapsed} />

      ))}
      {index < mockdata.length - 1 && <Divider color={themeColors.slate[4]} my={12} size="xs" />}
    </Box>
  ));

  return (
    <nav className={classes.navbar} data-collapsed={collapsed || undefined}>
      <div className={classes.header}>
        <Group justify={collapsed ? 'center' : 'space-between'} w="100%" wrap="nowrap">
          {!collapsed && <Image src={LogoProapps} style={{ width: rem(120) }} />}
          <Tooltip label="Toggle side navigation" position="right">
            <ActionIcon
              visibleFrom="md"
              onClick={toggleDesktop}
              variant="subtle"
              color="gray"
              radius="sm"
              size={36}
              ml={collapsed ? 'auto' : 0}
            >
              <SidebarSimpleIcon
                size={20}
                weight="duotone"
                style={{ transform: desktopOpened ? 'none' : 'scaleX(-1)' }}
              />
            </ActionIcon>
          </Tooltip>
        </Group>
      </div>

      <ScrollArea className={classes.links} type={collapsed ? 'never' : 'auto'}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <Tooltip label="Logout" position="right" disabled={!collapsed}>
          <UnstyledButton className={classes.user}>
            <Group justify="center" h={40} px={8} gap="xs">
              <SignOut size={20} color={themeColors.red[6]} weight="duotone" />
              {!collapsed && (
                <Text fz="sm" fw={600} c={themeColors.red[6]}>
                  Logout
                </Text>
              )}
            </Group>
          </UnstyledButton>
        </Tooltip>
      </div>
    </nav>
  );
};

export default NavbarComponent;
