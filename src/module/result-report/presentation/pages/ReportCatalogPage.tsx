import { useMemo, useState } from 'react';
import {
  Badge, Box, Group, Paper, SimpleGrid, Stack, Tabs, Text, TextInput, ThemeIcon, Title,
} from '@mantine/core';
import { IconArrowUpRight, IconBook2, IconBooks, IconLayoutGrid, IconReportMoney, IconSearch } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import AppShellLayout from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { reportCatalog, type ReportGroup } from '../data/reportCatalog';
import styles from './ReportCatalogPage.module.css';

type CatalogFilter = 'all' | ReportGroup;

export default function ReportCatalogPage() {
  const [filter, setFilter] = useState<CatalogFilter>('all');
  const [search, setSearch] = useState('');
  const reports = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('id-ID');
    return reportCatalog.filter((report) =>
      (filter === 'all' || report.group === filter)
      && `${report.title} ${report.englishTitle} ${report.description}`.toLocaleLowerCase('id-ID').includes(term));
  }, [filter, search]);

  return (
    <AppShellLayout>
      <Box className={styles.page}>
        <ModuleHeader
          icon={IconBooks}
          title="Pusat Laporan"
          description="Baca kinerja dan jejak transaksi bisnis dari laporan keuangan yang tersedia. Pilih laporan untuk melihat detailnya."
          breadcrumbs={[{ label: 'Laporan' }]}
        />

        <Paper withBorder radius="lg" className={styles.directory}>
          <Group justify="space-between" align="flex-end" gap="md" mb="lg">
            <Box>
              <Text className={styles.eyebrow}>DIREKTORI LAPORAN</Text>
              <Title order={3} c="primary.9" mt={4}>Temukan laporan yang dibutuhkan</Title>
              <Text size="sm" c="dimmed" mt={4}>Jelajahi {reportCatalog.length} laporan keuangan dan transaksi.</Text>
            </Box>
          </Group>

          <Tabs value={filter} onChange={(value) => setFilter((value ?? 'all') as CatalogFilter)} color="primary" variant="pills" radius="md">
            <Tabs.List mb="md">
              <Tabs.Tab value="all" leftSection={<IconLayoutGrid size={16} />}>Semua laporan</Tabs.Tab>
              <Tabs.Tab value="statement" leftSection={<IconReportMoney size={16} />}>Laporan keuangan</Tabs.Tab>
              <Tabs.Tab value="journal" leftSection={<IconBook2 size={16} />}>Buku & jurnal</Tabs.Tab>
            </Tabs.List>
          </Tabs>

          <TextInput
            aria-label="Cari laporan"
            placeholder="Cari nama atau fungsi laporan"
            leftSection={<IconSearch size={17} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            className={styles.search}
            mb="lg"
          />

          {reports.length === 0 ? (
            <EmptyState
              title="Laporan tidak ditemukan"
              description="Coba kata kunci lain atau tampilkan semua kategori laporan."
              actionLabel="Reset pencarian"
              onAction={() => { setSearch(''); setFilter('all'); }}
            />
          ) : (
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              {reports.map((report) => (
                <Paper
                  key={report.route}
                  component={Link}
                  to={report.route}
                  withBorder
                  radius="md"
                  className={styles.reportLink}
                  aria-label={`Buka laporan ${report.title}`}
                >
                  <Group align="flex-start" wrap="nowrap" gap="md">
                    <ThemeIcon size={44} radius="md" variant="light" color="primary" className={styles.reportIcon}>
                      <report.icon size={23} stroke={1.7} />
                    </ThemeIcon>
                    <Stack gap={7} className={styles.reportContent}>
                      <Group gap="xs" wrap="wrap">
                        <Text fw={700} c="primary.9" size="md">{report.title}</Text>
                        {'featured' in report && report.featured && <Badge size="xs" variant="light" color="secondary">BARU</Badge>}
                      </Group>
                      <Text size="xs" c="dimmed" className={styles.englishTitle}>{report.englishTitle}</Text>
                      <Text size="sm" c="dimmed" lh={1.55}>{report.description}</Text>
                    </Stack>
                    <IconArrowUpRight size={19} className={styles.arrow} aria-hidden="true" />
                  </Group>
                </Paper>
              ))}
            </SimpleGrid>
          )}
        </Paper>
      </Box>
    </AppShellLayout>
  );
}
