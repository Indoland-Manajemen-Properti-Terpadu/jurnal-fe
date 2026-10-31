import {
  Breadcrumbs,
  BreadcrumbsProps,
  Flex,
  Group,
  MantineGradient,
  rem,
  Stack,
  Title,
  useMantineTheme,
  Anchor,
  ButtonProps,
  Button,
} from '@mantine/core';
import { useColorScheme } from '@mantine/hooks';
import { gradientColors, themeColors } from '@/theme';
import { ReactNode } from 'react';

type ActionButtonProps = {
  label: string;
  icon?: ReactNode;
  gradient?: MantineGradient;
  color?: string;
  textColor?: string;
  style?: React.CSSProperties;
  onClick?: () => void;
} & ButtonProps;

type PageHeaderV2Props = {
  type: 'titleOnly' | 'withBreadcrumbs' | 'titleActionButton' | 'complete';
  title: string;
  breadcrumbItems?: { title: string; href?: () => void }[];
  actionButtons?: ActionButtonProps[];
};

const PageHeaderV2 = ({ type, title, breadcrumbItems, actionButtons }: PageHeaderV2Props) => {
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

  const renderBreadcrumbs = () => {
    if (breadcrumbItems) {
      return breadcrumbItems.map((item, index) => (
        <Anchor
          key={index}
          underline="never"
          variant={index === breadcrumbItems.length - 1 ? 'gradient' : 'filled'}
          gradient={index === breadcrumbItems.length - 1 ? gradientColors.gradient : undefined}
          fz="var(--jurnal-text-sm)"
          fw={400}
          c={index === breadcrumbItems.length - 1 ? themeColors.black[9] : 'inherit'}
          onClick={(e) => {
            if (index !== breadcrumbItems.length - 1 && item.href) {
              e.preventDefault();
              item.href();
            }
          }}
        >
          {item.title}
        </Anchor>
      ));
    }
    return null;
  };

  const renderActionButtons = () =>
    actionButtons?.map((button, index) => (
      <Button
        key={index}
        style={{
          ...button.style,
        }}
        onClick={button.onClick}
        {...button}
      >
        {button.icon && <span style={{ marginRight: '0.5rem' }}>{button.icon}</span>}
        {button.label}
      </Button>
    ));

  const renderContent = () => {
    switch (type) {
      case 'titleOnly':
        return (
          <Flex
            justify="space-between"
            direction={{ base: 'column', sm: 'row' }}
            gap={{ base: 'sm', sm: 4 }}
          >
            <Stack gap={4}>
              <Title order={3}>{title}</Title>
            </Stack>
          </Flex>
        );
      case 'withBreadcrumbs':
        return (
          <Group justify="space-between">
            <Title order={3}>{title}</Title>
            <Breadcrumbs {...BREADCRUMBS_PROPS}>{renderBreadcrumbs()}</Breadcrumbs>
          </Group>
        );
      case 'titleActionButton':
        return (
          <Flex
            align="center"
            justify="space-between"
            direction={{ base: 'row', sm: 'row' }}
            gap={{ base: 'sm', sm: 4 }}
          >
            <Title order={3}>{title}</Title>
            <Flex gap="sm">{renderActionButtons()}</Flex>
          </Flex>
        );
      case 'complete':
        return (
          <Flex
            align="center"
            justify="space-between"
            direction={{ base: 'row', sm: 'row' }}
            gap={{ base: 'sm', sm: 4 }}
          >
            <Stack gap="md">
              {breadcrumbItems && (
                <Breadcrumbs {...BREADCRUMBS_PROPS}>{renderBreadcrumbs()}</Breadcrumbs>
              )}
              <Title order={3}>{title}</Title>
            </Stack>
            <Flex gap="sm">{renderActionButtons()}</Flex>
          </Flex>
        );
      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default PageHeaderV2;
