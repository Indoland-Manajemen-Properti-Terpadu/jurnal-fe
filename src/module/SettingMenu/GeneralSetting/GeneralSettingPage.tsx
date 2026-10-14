import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  Divider,
  Grid,
  Group,
  NumberInput,
  Paper,
  Radio,
  SegmentedControl,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconDeviceFloppy, IconInfoCircle, IconSettings } from '@tabler/icons-react';
import SettingsLayout from '../components/SettingsLayout';
import { useGeneralSettings, useUpdateGeneralSettings } from '../hooks/useSettingQueries';

export default function GeneralSettingPage() {
  const { data: generalData, isLoading } = useGeneralSettings();
  const updateMutation = useUpdateGeneralSettings();

  const [decimalPrecision, setDecimalPrecision] = useState<number>(2);

  useEffect(() => {
    if (generalData?.decimalPrecision !== undefined) {
      setDecimalPrecision(generalData.decimalPrecision);
    }
  }, [generalData]);

  const handleSave = async () => {
    await updateMutation.mutateAsync(decimalPrecision);
  };

  const sampleAmount = 1459200.5678;
  const formattedSample = sampleAmount.toLocaleString('id-ID', {
    minimumFractionDigits: decimalPrecision,
    maximumFractionDigits: decimalPrecision,
  });

  return (
    <SettingsLayout
      title="Pengaturan Umum (General Settings)"
      description="Konfigurasi preferensi global sistem akuntansi termasuk presisi desimal dan aturan pembulatan."
    >
      <Stack gap="lg" maw={900}>
        {isLoading ? (
          <Skeleton height={300} radius="md" />
        ) : (
          <Card withBorder radius="md" p="xl" bg="white">
            <Stack gap="lg">
              <div>
                <Title order={4} c="dark.8">
                  Format Presisi Angka & Desimal
                </Title>
                <Text size="sm" c="dimmed" mt={4}>
                  Menentukan berapa banyak digit desimal di belakang koma yang digunakan pada perhitungan nilai uang, kuantitas, dan laporan keuangan.
                </Text>
              </div>

              <Divider />

              <Grid gutter="xl" align="flex-start">
                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Text fw={600} size="sm" c="dark.8" mb={6}>
                    Pilihan Presisi Desimal (Digit)
                  </Text>
                  <SegmentedControl
                    fullWidth
                    color="primary"
                    value={String(decimalPrecision)}
                    onChange={(val) => setDecimalPrecision(Number(val))}
                    data={[
                      { label: '0 Digit (Rp 1.459.201)', value: '0' },
                      { label: '2 Digit (Standar)', value: '2' },
                      { label: '3 Digit', value: '3' },
                      { label: '4 Digit', value: '4' },
                    ]}
                  />

                  <Text size="xs" c="dimmed" mt="xs">
                    *Rekomendasi standar akuntansi Indonesia adalah <strong>2 digit</strong> (contoh: Rp 1.459.200,57).
                  </Text>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 6 }}>
                  <Paper withBorder radius="md" p="md" bg="gray.0">
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb="xs">
                      Pratinjau Tampilan Nilai (Live Preview)
                    </Text>
                    <Stack gap={6}>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Nilai Mentah:</Text>
                        <Text size="xs" ff="monospace">1459200.5678</Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Tampilan Mata Uang:</Text>
                        <Text size="sm" fw={700} c="primary.9" ff="monospace">
                          Rp {formattedSample}
                        </Text>
                      </Group>
                      <Group justify="space-between">
                        <Text size="xs" c="dimmed">Tampilan Satuan Produk:</Text>
                        <Text size="xs" fw={600} c="dark.7">
                          {(125.75).toFixed(decimalPrecision)} Unit
                        </Text>
                      </Group>
                    </Stack>
                  </Paper>
                </Grid.Col>
              </Grid>

              <Alert icon={<IconInfoCircle size={16} />} color="blue" radius="md">
                Perubahan presisi desimal akan diterapkan pada transaksi baru dan cara angka dirender di seluruh tabel transaksi dan ekspor laporan keuangan.
              </Alert>

              <Divider />

              <Group justify="flex-end">
                <Button
                  color="primary"
                  leftSection={<IconDeviceFloppy size={16} />}
                  onClick={handleSave}
                  loading={updateMutation.isPending}
                >
                  Simpan Pengaturan
                </Button>
              </Group>
            </Stack>
          </Card>
        )}
      </Stack>
    </SettingsLayout>
  );
}

