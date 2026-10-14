import React, { useMemo, useState } from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Grid,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconArrowRight,
  IconBook2,
  IconBooks,
  IconCheck,
  IconDatabase,
  IconDownload,
  IconFileAnalytics,
  IconLayoutGrid,
  IconReportMoney,
  IconSearch,
  IconX,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { routes } from '@/router/routes';
import { ReportCard } from '../components/ReportCard';
import {
  reportCatalogData,
  reportCategories,
  type ReportCategory,
} from '../data/reportCatalogData';

export default function ReportCatalogPage() {
  const [activeCategory, setActiveCategory] = useState<ReportCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Count items per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: reportCatalogData.length };
    reportCatalogData.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, []);

  // Filtered reports
  const filteredReports = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return reportCatalogData.filter((report) => {
      const matchesCategory = activeCategory === 'all' || report.category === activeCategory;
      if (!matchesCategory) return false;
      if (!query) return true;

      const searchableText = `${report.title} ${report.englishTitle} ${report.description}`.toLowerCase();
      return searchableText.includes(query);
    });
  }, [activeCategory, searchQuery]);

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="xl">
          {/* Module Header */}
          <ModuleHeader
            icon={IconBooks}
            title="Pusat Laporan Keuangan"
            description="Akses seluruh ringkasan kinerja keuangan, pergerakan kas, buku besar, dan jurnal transaksi bisnis secara transparan dan terintegrasi."
            breadcrumbs={[{ label: 'Laporan Keuangan' }]}
          />

          {/* Fresh Hero Overview Banner */}
          <Paper
            withBorder
            radius="lg"
            p={{ base: 'lg', sm: 'xl' }}
            bg="linear-gradient(135deg, rgba(238, 242, 255, 0.6) 0%, rgba(240, 253, 250, 0.6) 100%)"
            style={{ borderColor: 'var(--mantine-color-primary-2)' }}
          >
            <Grid gutter="xl" align="center">
              <Grid.Col span={{ base: 12, md: 7 }}>
                <Badge
                  variant="filled"
                  color="primary"
                  size="md"
                  radius="sm"
                  mb="xs"
                  leftSection={<IconCheck size={14} />}
                >
                  Sistem Laporan Keuangan Terpadu
                </Badge>
                <Title order={2} c="dark.9" fw={800} lh={1.25}>
                  Laporan Akurat & Real-Time untuk Keputusan Bisnis Cepat
                </Title>
                <Text size="sm" c="gray.7" mt="sm" lh={1.6}>
                  Dirancang mengikuti Standar Akuntansi Keuangan (SAK) Indonesia. Dapatkan visibilitas penuh atas neraca, arus kas, laba rugi, serta jejak audit mutasi debit-kredit di Buku Besar.
                </Text>

                <Group gap="md" mt="lg">
                  <Button
                    component={Link}
                    to={routes.resultReport.generalLedgerReport}
                    color="primary"
                    size="sm"
                    radius="md"
                    leftSection={<IconBook2 size={16} />}
                  >
                    Buka Buku Besar
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    radius="md"
                    onClick={() => setActiveCategory('financial')}
                  >
                    Lihat Laporan Finansial
                  </Button>
                </Group>
              </Grid.Col>

              <Grid.Col span={{ base: 12, md: 5 }}>
                <SimpleGrid cols={2} spacing="sm">
                  <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                    <ThemeIcon variant="light" color="primary" size={36} radius="md" mb="xs">
                      <IconFileAnalytics size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" fw={600}>Total Laporan</Text>
                    <Text size="xl" fw={800} c="dark.9">{reportCatalogData.length} Modul</Text>
                  </Paper>

                  <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                    <ThemeIcon variant="light" color="teal" size={36} radius="md" mb="xs">
                      <IconDatabase size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" fw={600}>Status Sinkron</Text>
                    <Text size="xl" fw={800} c="teal.7">Live Sync</Text>
                  </Paper>

                  <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                    <ThemeIcon variant="light" color="indigo" size={36} radius="md" mb="xs">
                      <IconDownload size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" fw={600}>Format Ekspor</Text>
                    <Text size="xl" fw={800} c="dark.9">PDF & XLSX</Text>
                  </Paper>

                  <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
                    <ThemeIcon variant="light" color="orange" size={36} radius="md" mb="xs">
                      <IconCheck size={20} />
                    </ThemeIcon>
                    <Text size="xs" c="dimmed" fw={600}>Standar Buku</Text>
                    <Text size="xl" fw={800} c="dark.9">Double Entry</Text>
                  </Paper>
                </SimpleGrid>
              </Grid.Col>
            </Grid>
          </Paper>

          {/* Directory & Filter Section */}
          <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} bg="white" shadow="xs">
            <Stack gap="lg">
              {/* Search & Category Filter */}
              <Group justify="space-between" align="center" wrap="wrap" gap="md">
                <Tabs
                  value={activeCategory}
                  onChange={(val) => setActiveCategory((val as ReportCategory) || 'all')}
                  variant="pills"
                  color="primary"
                  radius="md"
                >
                  <Tabs.List>
                    <Tabs.Tab
                      value="all"
                      leftSection={<IconLayoutGrid size={16} />}
                      rightSection={
                        <Badge size="xs" variant="light" color="gray" circle>
                          {categoryCounts.all}
                        </Badge>
                      }
                    >
                      Semua Laporan
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="financial"
                      leftSection={<IconReportMoney size={16} />}
                      rightSection={
                        <Badge size="xs" variant="light" color="gray" circle>
                          {categoryCounts.financial}
                        </Badge>
                      }
                    >
                      Laporan Keuangan
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="ledger"
                      leftSection={<IconBook2 size={16} />}
                      rightSection={
                        <Badge size="xs" variant="light" color="gray" circle>
                          {categoryCounts.ledger}
                        </Badge>
                      }
                    >
                      Buku & Jurnal
                    </Tabs.Tab>
                    <Tabs.Tab
                      value="management"
                      leftSection={<IconFileAnalytics size={16} />}
                      rightSection={
                        <Badge size="xs" variant="light" color="gray" circle>
                          {categoryCounts.management}
                        </Badge>
                      }
                    >
                      Anggaran & Analisis
                    </Tabs.Tab>
                  </Tabs.List>
                </Tabs>

                <TextInput
                  placeholder="Cari laporan keuangan..."
                  leftSection={<IconSearch size={16} />}
                  rightSection={
                    searchQuery ? (
                      <ActionIcon
                        size="xs"
                        variant="subtle"
                        color="gray"
                        onClick={() => setSearchQuery('')}
                      >
                        <IconX size={14} />
                      </ActionIcon>
                    ) : null
                  }
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.currentTarget.value)}
                  w={{ base: '100%', sm: 280 }}
                  radius="md"
                />
              </Group>

              {/* Grid of Report Cards */}
              {filteredReports.length === 0 ? (
                <EmptyState
                  title="Laporan Tidak Ditemukan"
                  description={`Tidak ada laporan yang cocok dengan kata kunci "${searchQuery}". Coba gunakan istilah pencarian lain atau pilih kategori Semua Laporan.`}
                  actionLabel="Reset Pencarian"
                  onAction={() => {
                    setSearchQuery('');
                    setActiveCategory('all');
                  }}
                  py={48}
                />
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
                  {filteredReports.map((report) => (
                    <ReportCard key={report.id} report={report} />
                  ))}
                </SimpleGrid>
              )}
            </Stack>
          </Paper>
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
