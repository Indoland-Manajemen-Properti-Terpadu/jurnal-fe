import React from 'react';
import { Group, Paper, Text, ThemeIcon } from '@mantine/core';
import { IconArrowRight, IconClock } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import type { ReportItem } from '@/module/reports/presentation/components/catalog/reportCatalogData';
import classes from '@/module/reports/presentation/components/shared/ReportShared.module.css';

import { useTranslation } from '@/i18n';

interface ReportCardProps {
  report: ReportItem;
}

export const ReportCard: React.FC<ReportCardProps> = ({ report }) => {
  const { t } = useTranslation('reports');
  const IconComponent = report.icon;
  const soon = report.status === 'soon';

  return (
    <Paper
      component={Link}
      to={report.route}
      withBorder
      radius="lg"
      p="lg"
      bg="white"
      className={classes.card}
      data-soon={soon}
    >
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <ThemeIcon
          size={44}
          radius="md"
          variant="light"
          color="primary"
          className={classes.cardIcon}
        >
          <IconComponent size={24} stroke={1.6} />
        </ThemeIcon>
      </Group>

      <Text fw={700} fz="md" c="dark.9" mt="md" lh={1.3}>
        {t(report.titleKey)}
      </Text>
      <Text fz="xs" c="dimmed" fw={500}>
        {t(report.englishTitleKey)}
      </Text>
      <Text fz="sm" c="gray.7" mt="xs" lh={1.5} lineClamp={3} style={{ flex: 1 }}>
        {t(report.descriptionKey)}
      </Text>

      {soon ? (
        <Group gap={6} mt="md">
          <IconClock size={16} color="var(--mantine-color-gray-6)" aria-hidden="true" />
          <Text fz="sm" fw={500} c="dimmed">
            {t('catalog.statusSoon')}
          </Text>
        </Group>
      ) : (
        <Group gap={4} mt="md">
          <Text fz="sm" fw={600} c="primary.7">
            {t('catalog.openReport')}
          </Text>
          <IconArrowRight size={16} color="var(--mantine-color-primary-7)" aria-hidden="true" />
        </Group>
      )}
    </Paper>
  );
};
