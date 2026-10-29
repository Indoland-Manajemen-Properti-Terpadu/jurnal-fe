import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { IconArrowRight } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { ReportItem } from '../data/reportCatalogData';

interface ReportCardProps {
  report: ReportItem;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const IconComponent = report.icon;

  return (
    <Paper
      component={Link}
      to={report.route}
      withBorder
      radius="lg"
      p="lg"
      bg="white"
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
      styles={{
        root: {
          '&:hover': {
            transform: 'translateY(-3px)',
            boxShadow: '0 12px 24px -10px rgba(0, 0, 0, 0.08), 0 4px 6px -2px rgba(0, 0, 0, 0.02)',
            borderColor: 'var(--mantine-color-primary-4)',
          },
        },
      }}
    >
      <Stack gap="md" style={{ flex: 1 }}>
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <ThemeIcon
            size={48}
            radius="md"
            variant="light"
            color={report.color || 'primary'}
            style={{ flexShrink: 0 }}
          >
            <IconComponent size={26} stroke={1.6} />
          </ThemeIcon>

          <Group gap="xs" wrap="wrap" justify="flex-end">
            {report.badge && (
              <Badge
                size="sm"
                variant="light"
                color={report.badgeColor || 'primary'}
                radius="sm"
                tt="none"
                fw={600}
              >
                {report.badge}
              </Badge>
            )}
            {report.featured && (
              <Badge size="sm" variant="filled" color="primary" radius="sm">
                UNGGULAN
              </Badge>
            )}
          </Group>
        </Group>

        <Box>
          <Text fw={700} size="md" c="dark.8" lh={1.3}>
            {report.title}
          </Text>
          <Text size="xs" c="dimmed" mt={2} fw={500}>
            {report.englishTitle}
          </Text>
          <Text size="sm" c="gray.6" mt="xs" lh={1.5} lineClamp={2}>
            {report.description}
          </Text>
        </Box>
      </Stack>

      <Box pt="md" mt="auto">
        <Group justify="space-between" align="center">
          <Text size="xs" fw={600} c="primary.7">
            Buka Laporan
          </Text>
          <ActionIcon
            variant="subtle"
            color="primary"
            size="sm"
            radius="xl"
            aria-label={`Buka laporan ${report.title}`}
          >
            <IconArrowRight size={16} />
          </ActionIcon>
        </Group>
      </Box>
    </Paper>
  );
};

