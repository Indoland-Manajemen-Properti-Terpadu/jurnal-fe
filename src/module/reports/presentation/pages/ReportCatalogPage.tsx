import React, { useMemo, useState } from 'react';
import { TRIAL_BALANCE_ACCESS_BYPASS } from '@/module/reports/domain/trialBalance';
import {
  ActionIcon,
  Box,
  Group,
  Paper,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconBooks, IconSearch, IconX } from '@tabler/icons-react';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { ReportCard } from '@/module/reports/presentation/components/catalog/ReportCard';
import {
  reportCatalogData,
  reportCategories,
  reportSections,
  type ReportCategory,
} from '@/module/reports/presentation/components/catalog/reportCatalogData';

import { useTranslation } from '@/i18n';
import { useMyGrants } from '@/module/user-management';

export default function ReportCatalogPage() {
  const { t, currentLanguage } = useTranslation('reports');
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const { can, isReady } = useMyGrants();

  const sections = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reportSections
      .filter((section) => activeCategory === 'all' || section.category === activeCategory)
      .map((section) => ({
        ...section,
        reports: reportCatalogData
          .filter((report) => report.category === section.category)
          // Nothing is hidden before the rights are known.
          .filter(
            (report) =>
              !report.menuId ||
              !isReady ||
              (TRIAL_BALANCE_ACCESS_BYPASS && report.id === 'trial-balance') ||
              can(report.menuId, 'read')
          )
          .filter(
            (report) =>
              !query ||
              `${t(report.titleKey)} ${t(report.englishTitleKey)} ${t(report.descriptionKey)}`
                .toLowerCase()
                .includes(query)
          )
          // Reports that open real data come first; the sort keeps the catalog order otherwise.
          .sort((a, b) => Number(b.status === 'ready') - Number(a.status === 'ready')),
      }))
      .filter((section) => section.reports.length > 0);
  }, [activeCategory, searchQuery, currentLanguage, isReady, can]);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconBooks}
            title={t('catalog.pageTitle')}
            description={t('catalog.pageSubtitle')}
          />

          <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
            <Group justify="space-between" align="center" wrap="wrap" gap="md">
              <SegmentedControl
                radius="md"
                color="primary"
                value={activeCategory}
                onChange={(value) => setActiveCategory(value as ReportCategory)}
                data={reportCategories.map((category) => ({
                  value: category.value,
                  label: t(category.labelKey),
                }))}
              />
              <TextInput
                placeholder={t('catalog.searchPlaceholder')}
                aria-label={t('catalog.searchPlaceholder')}
                leftSection={<IconSearch size={16} />}
                rightSection={
                  searchQuery ? (
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      color="gray"
                      aria-label={t('common.resetSearch')}
                      onClick={() => setSearchQuery('')}
                    >
                      <IconX size={14} />
                    </ActionIcon>
                  ) : null
                }
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                w={{ base: '100%', sm: 300 }}
                radius="md"
              />
            </Group>
          </Paper>

          {sections.length === 0 ? (
            <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
              <EmptyState
                title={t('catalog.notFound')}
                description={t('catalog.noMatch', { query: searchQuery })}
                actionLabel={t('common.resetSearch')}
                onAction={() => {
                  setSearchQuery('');
                  setActiveCategory('all');
                }}
                py={48}
              />
            </Paper>
          ) : (
            sections.map((section) => (
              <Stack key={section.category} gap="sm" component="section">
                <Group justify="space-between" align="baseline" wrap="wrap" gap="xs">
                  <Group gap="sm" align="baseline">
                    <Text fw={700} fz="lg" c="dark.9">
                      {t(section.titleKey)}
                    </Text>
                    <Text fz="sm" c="dimmed">
                      {t(section.hintKey)}
                    </Text>
                  </Group>
                  <Text fz="xs" c="dimmed">
                    {t('catalog.reportCount', { count: section.reports.length })}
                  </Text>
                </Group>
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md">
                  {section.reports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </SimpleGrid>
              </Stack>
            ))
          )}
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
