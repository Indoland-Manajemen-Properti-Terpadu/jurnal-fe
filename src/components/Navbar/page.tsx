/* eslint-disable @typescript-eslint/no-unused-vars */
import { ActionIcon, Box, Code, Flex, Group, rem, ScrollArea, Text, Image } from '@mantine/core';
import {
  IconChartPie3,
  IconReport,
  IconBuildingBank,
  IconBusinessplan,
  IconShoppingCart,
  IconReportMoney,
  IconAddressBook,
  IconReceipt2,
  IconLayersSubtract,
  IconFileInvoice,
  IconList,
  IconSettings,
  icons,
  IconPackages,
  IconPackage,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { LinksGroup } from './Links/page';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-md-transparent.svg';
import UserProfileButton from '../UserButton/page';
import UserProfileData from '../../../public/mocks/UserProfile.json';

const mockdata = [
  {
    title: 'MAIN',
    links: [
      { label: 'Dashboard', icon: IconChartPie3, link: '/dashboard' },
      {
        label: 'Result Reports',
        icon: IconReport,
        links: [
          {
            label: 'List',
            link: '/invoices/list',
          },
          {
            label: 'Details',
            link: '/invoices/details',
          },
        ],
      },
    ],
  },
  {
    title: 'Finance',
    links: [
      { label: 'Bank & Cash', icon: IconBuildingBank, link: '/finance/bank-cash' },
      { label: 'Setting Budget', icon: IconBusinessplan, link: '/finance/setting-budget' },
      {
        label: 'Purchasing',
        icon: IconShoppingCart,
        links: [
          {
            label: 'List',
            link: '/invoices/list',
          },
          {
            label: 'Details',
            link: '/invoices/details',
          },
        ],
      },
      { label: 'Cost', icon: IconReportMoney, link: '/finance/cost' },
      { label: 'Contact', icon: IconAddressBook, link: '/finance/contact' },
    ],
  },
  {
    title: 'Stock & Production',
    links: [
      {
        label: 'Stock',
        icon: IconReceipt2,
        links: [
          {
            label: 'List',
            link: '/invoices/list',
          },
          {
            label: 'Details',
            link: '/invoices/details',
          },
        ],
      },
      {
        label: 'Production',
        icon: IconPackage,
        links: [
          {
            label: 'List',
            link: '/invoices/list',
          },
          {
            label: 'Details',
            link: '/invoices/details',
          },
        ],
      },
      { label: 'Fullfillment', icon: IconReceipt2, link: '/fullfillment' },
      { label: 'Assets', icon: IconPackages, link: '/assets' },
    ],
  },
  {
    title: 'Setting Menu',
    links: [
      { label: 'General Ledger', icon: IconList, link: '/general-ledger' },
      {
        label: 'Settings',
        icon: IconSettings,
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
  },
];

type NavigationProps = {
  onClose: () => void;
};

const NavbarComponent = ({ onClose }: NavigationProps) => {
  const tablet_match = useMediaQuery('(max-width: 768px)');

  const links = mockdata.map((item) => (
    <Box pl={0} mb="md" key={item.title}>
      <Text tt="uppercase" size="xs" pl="md" fw={500} mb="sm" className={classes.linkHeader}>
        {item.title}
      </Text>
      {item.links.map((linkItem) => (
        <LinksGroup {...linkItem} key={linkItem.label} closeSidebar={onClose} />
      ))}
    </Box>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.header}>
        <Group justify="space-between">
          <Image src={LogoProapps} style={{ width: rem(120) }} />
        </Group>
      </div>

      <ScrollArea className={classes.links}>
        <div className={classes.linksInner}>{links}</div>
      </ScrollArea>

      <div className={classes.footer}>
        <UserProfileButton
          email={UserProfileData.email}
          image={UserProfileData.avatar}
          name={UserProfileData.name}
        />
      </div>
    </nav>
  );
};

export default NavbarComponent;
