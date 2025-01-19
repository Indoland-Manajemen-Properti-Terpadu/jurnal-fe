'use client';

import {
  ActionIcon,
  Breadcrumbs,
  BreadcrumbsProps,
  Button,
  Divider,
  Flex,
  MantineGradient,
  Paper,
  PaperProps,
  rem,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconPlus, IconRefresh } from '@tabler/icons-react';
// import { FilterDateMenu, Surface } from '@/components';
import { useColorScheme } from '@mantine/hooks';
import BreadcrumbsStyle from '@mantine/core';
('@mantine/core/styles/Breadcrumbs.css');

type PageHeaderProps = {
  title: string;
  withActions?: boolean;
  breadcrumbItems?: any;
  actionButtons?: {
    variant: string;
    gradient?: MantineGradient;
    label: string;
    icon?: any;
    color?: string;
    textColor?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
  }[];
} & PaperProps;

const PageHeader = (props: PageHeaderProps) => {
  const { withActions, breadcrumbItems, title, actionButtons, ...others } = props;
  const theme = useMantineTheme();
  const colorScheme = useColorScheme();

  const BREADCRUMBS_PROPS: Omit<BreadcrumbsProps, 'children'> = {
    style: {
      a: {
        padding: rem(8),
        borderRadius: theme.radius.sm,
        fontWeight: 500,
        color: colorScheme === 'dark' ? theme.white : theme.black,

        '&:hover': {
          transition: 'all ease 150ms',
          backgroundColor: colorScheme === 'dark' ? theme.colors.dark[5] : theme.colors.gray[2],
          textDecoration: 'none',
        },
      },
    },
  };

  return (
    <>
      {withActions ? (
        <Flex
          justify="space-between"
          direction={{ base: 'column', sm: 'row' }}
          gap={{ base: 'sm', sm: 4 }}
        >
          <Stack gap={4}>
            <Title order={3}>{title}</Title>
            <Text c="blue">Welcome back, Kelvin!</Text>
          </Stack>
          <Flex align="center" gap="sm">
            <ActionIcon variant="subtle">
              <IconRefresh size={16} />
            </ActionIcon>
            {/* <FilterDateMenu /> */}
          </Flex>
        </Flex>
      ) : actionButtons ? (
        <Flex
          align="center"
          justify="space-between"
          direction={{ base: 'row', sm: 'row' }}
          gap={{ base: 'sm', sm: 4 }}
        >
          <Stack>
            <Title order={3}>{title}</Title>
            <Breadcrumbs {...BREADCRUMBS_PROPS}>{breadcrumbItems}</Breadcrumbs>
          </Stack>
          <Flex gap="sm">
            {actionButtons.map((button, index) => (
              <Button
                key={index}
                variant={button.variant}
                gradient={button.gradient}
                leftSection={button.icon ? <button.icon size={18} /> : null}
                onClick={button.onClick}
                style={{
                  backgroundColor: button.color || '#F1F3F5',
                  color: button.textColor || '#495057',
                  ...button.style,
                }}
              >
                {button.label}
              </Button>
            ))}
          </Flex>
        </Flex>
      ) : (
        <Stack gap="sm">
          <Title order={3}>{title}</Title>
          <Text variant="gradient" gradient={{ from: 'blue', to: 'cyan', deg: 90 }}>
            <Breadcrumbs {...BREADCRUMBS_PROPS} variant='gradient'>{breadcrumbItems}</Breadcrumbs>
          </Text>
        </Stack>
      )}
    </>
  );
};

export default PageHeader;
