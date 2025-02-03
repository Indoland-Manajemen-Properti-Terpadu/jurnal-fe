import {
  ActionIcon,
  Breadcrumbs,
  BreadcrumbsProps,
  Flex,
  MantineGradient,
  PaperProps,
  rem,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from '@mantine/core';
import { IconRefresh } from '@tabler/icons-react';
import { useColorScheme } from '@mantine/hooks';
import { gradientColors } from '@/theme';
import { ReactNode } from 'react';

type PageHeaderProps = {
  title: string;
  // subtittle?: string;
  withinBreadcums?: boolean;
  breadcrumbItems?: any;
  actionButton?: ReactNode;
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
  const { withinBreadcums, breadcrumbItems, title, actionButton, actionButtons, ...others } = props;
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

  let content;
  if (withinBreadcums) {
    content = (
      <Flex
        justify="space-between"
        direction={{ base: 'column', sm: 'row' }}
        gap={{ base: 'sm', sm: 4 }}
      >
        <Stack gap={4}>
          <Title order={3}>{title}</Title>
          {/* <Text c="blue">{subtittle}</Text> */}
        </Stack>
        <Flex align="center" gap="sm">
          {/* <ActionIcon variant="subtle">
            <IconRefresh size={16} />
          </ActionIcon> */}
        </Flex>
      </Flex>
    );
  } else if (actionButton) {
    content = (
      <Flex
        align="center"
        justify="space-between"
        direction={{ base: 'row', sm: 'row' }}
        gap={{ base: 'sm', sm: 4 }}
      >
        <Stack>
          <Title order={3}>{title}</Title>
          {breadcrumbItems && (
            <Text variant="gradient" gradient={gradientColors.gradient} fz={12} fw={400}>
              <Breadcrumbs {...BREADCRUMBS_PROPS}>{breadcrumbItems}</Breadcrumbs>
            </Text>
          )}
        </Stack>
        <Flex gap="sm">
          {actionButton}
        </Flex>
      </Flex>
    );
  } else {
    content = (
      <Stack gap="sm">
        <Title order={3}>{title}</Title>
        <Text variant="gradient" gradient={gradientColors.mainGR} fz={12} fw={400}>
          <Breadcrumbs {...BREADCRUMBS_PROPS} >
            {breadcrumbItems}
          </Breadcrumbs>
        </Text>
      </Stack>
    );
  }

  return <>{content}</>;
};

export default PageHeader;
