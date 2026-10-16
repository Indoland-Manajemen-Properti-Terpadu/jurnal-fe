import React, { useEffect } from 'react';
import {
  Alert,
  Badge,
  Box,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import {
  IconBuildingWarehouse,
  IconCalculator,
  IconCalendar,
  IconCash,
  IconClock,
  IconDeviceLaptop,
  IconFileDescription,
  IconHelpCircle,
  IconInfoCircle,
  IconPlus,
  IconTag,
} from '@tabler/icons-react';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { formatCurrency } from '@/utils/FormatCurrency';
import { AssetCategory, AssetFormValues, AssetItem, DepreciationMethod } from '../types/asset';
import { calculateAssetDepreciation } from '../services/assetStorage';
import { useTranslation } from '@/i18n';

export type AssetFormModalProps = {
  opened: boolean;
  onClose: () => void;
  onSave: (values: AssetFormValues) => void;
  assetToEdit?: AssetItem | null;
};

export const AssetFormModal: React.FC<AssetFormModalProps> = ({
  opened,
  onClose,
  onSave,
  assetToEdit,
}) => {
  const { t } = useTranslation('assets');

  const form = useForm<AssetFormValues>({
    initialValues: {
      id: undefined,
      code: '',
      name: '',
      category: 'vehicle',
      acquisitionDate: new Date().toISOString().split('T')[0],
      acquisitionCost: 100000000,
      residualValue: 10000000,
      usefulLifeYears: 5,
      depreciationMethod: 'straight_line',
      notes: '',
    },
    validate: {
      code: (val) => (!val?.trim() ? 'Kode aset wajib diisi' : null),
      name: (val) => (!val?.trim() ? 'Nama aset wajib diisi' : null),
      acquisitionCost: (val) => (val <= 0 ? 'Nilai perolehan harus lebih dari 0' : null),
      residualValue: (val, values) =>
        val >= values.acquisitionCost ? 'Nilai residu tidak boleh melebihi nilai perolehan' : null,
      usefulLifeYears: (val, values) =>
        values.depreciationMethod !== 'none' && val <= 0
          ? 'Masa manfaat harus minimal 1 tahun'
          : null,
    },
  });

  useEffect(() => {
    if (assetToEdit) {
      form.setValues({
        id: assetToEdit.id,
        code: assetToEdit.code,
        name: assetToEdit.name,
        category: assetToEdit.category,
        acquisitionDate: assetToEdit.acquisitionDate,
        acquisitionCost: assetToEdit.acquisitionCost,
        residualValue: assetToEdit.residualValue,
        usefulLifeYears: assetToEdit.usefulLifeYears,
        depreciationMethod: assetToEdit.depreciationMethod,
        notes: assetToEdit.notes || '',
      });
    } else {
      form.reset();
      form.setFieldValue('code', `AST-${Math.floor(100 + Math.random() * 900)}`);
    }
  }, [assetToEdit, opened]);

  // Live calculation preview
  const liveCost = Number(form.values.acquisitionCost) || 0;
  const liveResidual = Number(form.values.residualValue) || 0;
  const liveYears = Number(form.values.usefulLifeYears) || 0;
  const liveMethod = form.values.depreciationMethod;

  const depreciableAmount = Math.max(0, liveCost - liveResidual);
  const annualDep =
    liveMethod === 'none' || liveYears <= 0
      ? 0
      : liveMethod === 'straight_line'
        ? Math.round(depreciableAmount / liveYears)
        : Math.round(liveCost * (2 / liveYears));

  const monthlyDep = Math.round(annualDep / 12);

  const preview = calculateAssetDepreciation(
    liveCost,
    liveResidual,
    liveYears,
    liveMethod,
    form.values.acquisitionDate
  );

  const handleSubmit = (values: AssetFormValues) => {
    onSave(values);
    onClose();
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="sm" align="center">
          <ThemeIcon
            size={36}
            radius="md"
            variant="gradient"
            gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
          >
            <IconBuildingWarehouse size={20} stroke={1.8} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="md" c="dark.9" lh={1.2}>
              {assetToEdit ? 'Ubah Data Aset Tetap' : 'Tambah Aset Tetap Baru'}
            </Text>
            <Text size="xs" c="dimmed" mt={2}>
              Kelola spesifikasi perolehan dan alokasi penyusutan buku besar aktiva tetap
            </Text>
          </Box>
        </Group>
      }
      size="lg"
      radius="lg"
      centered
      padding="lg"
    >
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack gap="lg">
          {/* Card 1: Identitas & Klasifikasi Aset */}
          <Paper withBorder radius="md" p="md" bg="gray.0">
            <Stack gap="sm">
              <Group gap="xs" mb={2}>
                <ThemeIcon size={24} radius="sm" variant="light" color="primary">
                  <IconTag size={14} />
                </ThemeIcon>
                <Text size="xs" fw={700} tt="uppercase" c="primary.8" lts={0.5}>
                  Identitas & Klasifikasi Aset
                </Text>
              </Group>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 4 }}>
                  <TextInput
                    label="Kode Aset"
                    placeholder="misal: AST-KND-001"
                    required
                    size="sm"
                    leftSection={<IconTag size={15} color="var(--mantine-color-dimmed)" />}
                    {...form.getInputProps('code')}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 8 }}>
                  <TextInput
                    label="Nama Aset"
                    placeholder="misal: Toyota Avanza 1.5G 2024"
                    required
                    size="sm"
                    {...form.getInputProps('name')}
                  />
                </Grid.Col>
              </Grid>

              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Kategori Aset"
                    data={[
                      { value: 'vehicle', label: 'Kendaraan' },
                      { value: 'building', label: 'Bangunan & Gedung' },
                      { value: 'machinery', label: 'Mesin & Peralatan' },
                      { value: 'electronic', label: 'Elektronik & Kantor' },
                      { value: 'land', label: 'Tanah (Bebas Susut)' },
                    ]}
                    required
                    size="sm"
                    {...form.getInputProps('category')}
                    onChange={(val) => {
                      form.setFieldValue('category', (val as AssetCategory) || 'vehicle');
                      if (val === 'land') {
                        form.setFieldValue('depreciationMethod', 'none');
                        form.setFieldValue('usefulLifeYears', 0);
                        form.setFieldValue('residualValue', form.values.acquisitionCost);
                      }
                    }}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <DateInput
                    label="Tanggal Akuisisi / Pembelian"
                    placeholder="Pilih tanggal"
                    valueFormat="DD/MM/YYYY"
                    required
                    size="sm"
                    leftSection={<IconCalendar size={15} color="var(--mantine-color-dimmed)" />}
                    value={
                      form.values.acquisitionDate ? new Date(form.values.acquisitionDate) : null
                    }
                    onChange={(val) =>
                      form.setFieldValue(
                        'acquisitionDate',
                        val ? dayjs(val).format('YYYY-MM-DD') : ''
                      )
                    }
                  />
                </Grid.Col>
              </Grid>

              <Textarea
                label="Catatan & Lokasi / PIC"
                placeholder="misal: No. Rangka, No. BPKB / Serial Number, Lokasi Gedung A, Penanggung Jawab..."
                rows={2}
                size="sm"
                {...form.getInputProps('notes')}
              />
            </Stack>
          </Paper>

          {/* Card 2: Nilai Perolehan & Parameter Akuntansi */}
          <Paper withBorder radius="md" p="md" bg="gray.0">
            <Stack gap="sm">
              <Group gap="xs" mb={2}>
                <ThemeIcon size={24} radius="sm" variant="light" color="teal">
                  <IconCash size={14} />
                </ThemeIcon>
                <Text size="xs" fw={700} tt="uppercase" c="teal.9" lts={0.5}>
                  Parameter Akuntansi & Penyusutan
                </Text>
              </Group>

              {/* Row 1: Symmetrical Cost & Residual Inputs */}
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Nilai Perolehan (Harga Beli)"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    min={0}
                    required
                    size="sm"
                    {...form.getInputProps('acquisitionCost')}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    Total biaya perolehan aktiva awal
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Nilai Residu / Sisa"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="Rp "
                    min={0}
                    disabled={form.values.depreciationMethod === 'none'}
                    size="sm"
                    {...form.getInputProps('residualValue')}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    Estimasi nilai sisa di akhir masa manfaat
                  </Text>
                </Grid.Col>
              </Grid>

              {/* Row 2: Symmetrical Method & Useful Life Inputs */}
              <Grid gutter="md">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Select
                    label="Metode Penyusutan"
                    data={[
                      { value: 'straight_line', label: 'Garis Lurus (Straight Line)' },
                      { value: 'double_declining', label: 'Saldo Menurun (Double Declining)' },
                      { value: 'none', label: 'Tidak Disusutkan (Tanah)' },
                    ]}
                    required
                    size="sm"
                    {...form.getInputProps('depreciationMethod')}
                    onChange={(val) => {
                      const method = (val as DepreciationMethod) || 'straight_line';
                      form.setFieldValue('depreciationMethod', method);
                      if (method === 'none') {
                        form.setFieldValue('usefulLifeYears', 0);
                        form.setFieldValue('residualValue', form.values.acquisitionCost);
                      }
                    }}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    Metode amortisasi buku besar
                  </Text>
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <NumberInput
                    label="Masa Manfaat (Tahun)"
                    suffix=" Tahun"
                    min={form.values.depreciationMethod === 'none' ? 0 : 1}
                    max={50}
                    disabled={form.values.depreciationMethod === 'none'}
                    size="sm"
                    {...form.getInputProps('usefulLifeYears')}
                  />
                  <Text size="xs" c="dimmed" mt={4}>
                    Masa ekonomis produktif aktiva
                  </Text>
                </Grid.Col>
              </Grid>
            </Stack>
          </Paper>

          {/* Card 3: Interactive Live Depreciation Calculation Preview (Poka-Yoke & Instant Feedback) */}
          <Paper
            withBorder
            radius="md"
            p="md"
            style={{
              background:
                'linear-gradient(135deg, var(--mantine-color-blue-0) 0%, var(--mantine-color-teal-0) 100%)',
              borderColor: 'var(--mantine-color-blue-2)',
            }}
          >
            <Stack gap="xs">
              <Group justify="space-between" align="center">
                <Group gap="xs">
                  <ThemeIcon size={26} radius="sm" variant="filled" color="primary">
                    <IconCalculator size={15} />
                  </ThemeIcon>
                  <Text size="xs" fw={700} c="primary.9">
                    Simulasi Otomatis Penyusutan (Real-time Preview)
                  </Text>
                </Group>
                <Badge size="sm" variant="filled" color={liveMethod === 'none' ? 'gray' : 'teal'}>
                  {liveMethod === 'none' ? 'Bebas Susut' : 'Siap Disusutkan'}
                </Badge>
              </Group>

              {liveMethod === 'none' ? (
                <Text size="xs" c="dimmed">
                  Kategori Tanah tidak mengalami penyusutan nilai buku. Nilai buku tetap sebesar{' '}
                  {formatCurrency(liveCost)}.
                </Text>
              ) : (
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm" mt="xs">
                  <Paper withBorder radius="sm" p="xs" bg="white">
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                      Beban Susut / Tahun
                    </Text>
                    <Text
                      size="sm"
                      fw={800}
                      c="dark.8"
                      mt={2}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(annualDep)}
                    </Text>
                  </Paper>

                  <Paper withBorder radius="sm" p="xs" bg="white">
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                      Beban Susut / Bulan
                    </Text>
                    <Text
                      size="sm"
                      fw={800}
                      c="dark.8"
                      mt={2}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(monthlyDep)}
                    </Text>
                  </Paper>

                  <Paper withBorder radius="sm" p="xs" bg="white">
                    <Text size="xs" c="dimmed" fw={600} tt="uppercase">
                      Estimasi NBV Berjalan
                    </Text>
                    <Text
                      size="sm"
                      fw={800}
                      c="teal.8"
                      mt={2}
                      style={{ fontVariantNumeric: 'tabular-nums' }}
                    >
                      {formatCurrency(preview.netBookValue)}
                    </Text>
                  </Paper>
                </SimpleGrid>
              )}
            </Stack>
          </Paper>

          {/* Action Buttons */}
          <Group justify="flex-end" gap="sm">
            <Button variant="default" onClick={onClose} radius="md">
              Batal
            </Button>
            <Button
              type="submit"
              variant="gradient"
              gradient={{ from: 'primary.6', to: 'secondary.6', deg: 135 }}
              radius="md"
              leftSection={assetToEdit ? undefined : <IconPlus size={16} />}
            >
              {assetToEdit ? 'Perbarui Aset' : 'Simpan Aset'}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
};

export default AssetFormModal;
