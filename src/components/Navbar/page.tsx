/* eslint-disable @typescript-eslint/no-unused-vars */
import { Box, Group, rem, ScrollArea, Text, Image, ActionIcon, UnstyledButton } from '@mantine/core';
import {
  IconChartPie3,
  IconReport,
  IconBuildingBank,
  IconBusinessplan,
  IconShoppingCart,
  IconReportMoney,
  IconAddressBook,
  IconReceipt2,
  IconSettings,
  IconPackages,
  IconPackage,
  IconBook2,
  IconDoorExit,
} from '@tabler/icons-react';
import { useMediaQuery } from '@mantine/hooks';
import { LinksGroup } from './Links/page';
import classes from './page.module.css';
import LogoProapps from '@/assets/img/proapps-md-transparent.svg';
import { themeColors } from '@/theme';

const mockdata = [
  {
    title: 'MAIN',
    links: [
      { label: 'Dashboard', icon: IconChartPie3, link: '/dashboard' },
      { label: 'Result Reports', icon: IconReport, link: '/result-reports' },
    ],
  },
  {
    title: 'Finance',
    links: [
      { label: 'Bank & Cash', icon: IconBuildingBank, link: '/bank-cash' },
      {
        label: 'Setting Budget',
        icon: IconBusinessplan,
        links: [
          {
            label: 'Budget Management',
            link: '/setting-budget/budget-management',
          },
          {
            label: 'Budget I/S',
            link: '/setting-budget/budget-is',
          },
        ],
      },
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
      { label: 'Contact', icon: IconAddressBook, link: '/contact' },
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
      // {
      //   label: 'Production',
      //   icon: IconPackage,
      //   links: [
      //     {
      //       label: 'List',
      //       link: '/invoices/list',
      //     },
      //     {
      //       label: 'Details',
      //       link: '/invoices/details',
      //     },
      //   ],
      // },
      { label: 'Fullfillment', icon: IconReceipt2, link: '/fullfillment' },
      { label: 'Assets', icon: IconPackages, link: '/assets' },
    ],
  },
  {
    title: 'Setting Menu',
    links: [
      { label: 'Chart of Account', icon: IconBook2, link: '/general-journal' },
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

        <UnstyledButton className={classes.user}>
          <Group justify='center' p={10}>
            <IconDoorExit size={14} color={themeColors.red[6]} />
          </Group>
        </UnstyledButton>
      </div>
    </nav>
  );
};

export default NavbarComponent;
