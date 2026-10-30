import { Box, Card, Group, Paper, PaperProps, Stack, Text } from '@mantine/core';
import { IconMinus, IconTrendingDown, IconTrendingUp } from '@tabler/icons-react';
import { Surface } from '@/components';
import { formatCurrency } from '@/utils/FormatCurrency';
import { themeColors } from '@/theme';

type StatsContactCardProps = {
  data: { title: string; amount: number; diff: number; period?: string };
} & PaperProps;

const StatsContactCard = ({ data, ...others }: StatsContactCardProps) => {
  const { title, amount, diff } = data;
  const getDiffStyles = (diff: number) => {
    if (diff > 0) {
      return {
        color: themeColors.green[6],
        bg: themeColors.green[0],
        Icon: IconTrendingUp,
        text: `${diff}%`,
      };
    }
    if (diff < 0) {
      return {
        color: themeColors.red[6],
        bg: themeColors.red[0],
        Icon: IconTrendingDown,
        text: `${diff}%`,
      };
    }
    return { color: themeColors.gray[6], bg: themeColors.gray[0], Icon: IconMinus, text: '0%' };
  };

  const { color, bg, Icon, text } = getDiffStyles(diff);

  const PerformComponent = ({ diff }: { diff: number }) => (
    <Box bg={bg} style={{ borderRadius: 4, padding: 4 }}>
      <Text c={color} fz={12} fw={400}>
        <Group gap={4}>
          <Icon size="1rem" stroke={1.5} />
          {text}
        </Group>
      </Text>
    </Box>
  );

  return (
    <Card withBorder radius="md" p="md" shadow="none">
      <Stack gap="md">
        <Text fz={14} fw={500} c={themeColors.black[9]}>
          {title}
        </Text>
        <Text c={themeColors.black[9]} fz={20} fw={600}>
          {formatCurrency(amount)}
        </Text>
        <Group gap="xs">
          <PerformComponent diff={diff} />
          <Text fz={12} fw={400} c={themeColors.gray[6]}>
            Compared to to last month
          </Text>
        </Group>
      </Stack>
    </Card>
  );
};

export default StatsContactCard;
