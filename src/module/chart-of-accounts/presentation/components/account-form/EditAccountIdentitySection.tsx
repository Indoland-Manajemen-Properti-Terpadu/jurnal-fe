import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Checkbox,
  Grid,
  Group,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconChevronDown, IconFileInvoice, IconRefresh } from '@tabler/icons-react';
import type { UseFormReturnType } from '@mantine/form';
import type { AccountFormValues } from '@/module/chart-of-accounts/domain/buildAccountPayload';

interface EditAccountIdentitySectionProps {
  form: UseFormReturnType<AccountFormValues>;
  categoryOptions: { value: string; label: string }[];
  isLocked: boolean;
  isLoadingCategories: boolean;
  suggestedAccountNumber?: string;
}

/** Card 1: main account information. */
export const EditAccountIdentitySection: React.FC<EditAccountIdentitySectionProps> = ({
  form,
  categoryOptions,
  isLocked,
  isLoadingCategories,
  suggestedAccountNumber,
}) => (
  <Paper withBorder radius="md" p="lg" bg="white" shadow="xs">
    <Group gap="sm" mb="md">
      <ThemeIcon size={36} radius="md" variant="light" color="primary">
        <IconFileInvoice size={20} />
      </ThemeIcon>
      <div>
        <Text fw={700} fz={15} c="dark.8">
          Informasi Utama Akun
        </Text>
        <Text fz={12} c="dimmed">
          Identitas dasar, kategori klasifikasi, dan kode rekening akun
        </Text>
      </div>
    </Group>

    <Stack gap="md">
      <TextInput
        label="Nama Akun"
        placeholder="Contoh: Kas Kecil Operasional, Piutang Usaha Proyek"
        withAsterisk
        size="sm"
        {...form.getInputProps('name')}
      />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Kategori Akun"
            placeholder="Pilih kategori akun"
            data={categoryOptions}
            withAsterisk
            searchable
            clearable={false}
            disabled={isLocked || isLoadingCategories}
            rightSection={<IconChevronDown size={16} />}
            {...form.getInputProps('category')}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6 }}>
          <TextInput
            label="Kode Akun"
            placeholder="Contoh: 1-10001"
            withAsterisk
            rightSection={
              suggestedAccountNumber && suggestedAccountNumber !== form.values.accountNumber ? (
                <Tooltip label={`Gunakan saran sistem: ${suggestedAccountNumber}`}>
                  <ActionIcon
                    variant="subtle"
                    color="primary"
                    size="sm"
                    onClick={() => form.setFieldValue('accountNumber', suggestedAccountNumber)}
                  >
                    <IconRefresh size={14} />
                  </ActionIcon>
                </Tooltip>
              ) : null
            }
            {...form.getInputProps('accountNumber')}
          />
        </Grid.Col>
      </Grid>

      {/* Akun Kontra Box */}
      <Paper
        withBorder
        radius="md"
        p="sm"
        bg={form.values.isContra ? 'orange.0' : 'gray.0'}
        style={{
          borderColor: form.values.isContra ? 'var(--mantine-color-orange-3)' : undefined,
          transition: 'all 0.2s ease',
        }}
      >
        <Group justify="space-between" align="center">
          <Stack gap={2}>
            <Group gap={6}>
              <Text fw={600} fz={13} c="dark.8">
                Tandai sebagai Akun Kontra (Contra Account)
              </Text>
              <Badge size="xs" variant="light" color={form.values.isContra ? 'orange' : 'gray'}>
                {form.values.isContra ? 'Aktif' : 'Non-Aktif'}
              </Badge>
            </Group>
            <Text fz={12} c="dimmed">
              Akun kontra memiliki saldo normal berlawanan dan berfungsi mengurangi nilai akun utama
              (misal: Akumulasi Penyusutan).
            </Text>
          </Stack>
          <Checkbox
            color="orange"
            size="md"
            {...form.getInputProps('isContra', { type: 'checkbox' })}
          />
        </Group>
      </Paper>

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, sm: 6 }}>
          <Select
            label="Pajak Terkait"
            placeholder="Pilih pajak (opsional)"
            data={['PPH', 'PPN', 'PPNBM', 'PBB']}
            clearable
            rightSection={<IconChevronDown size={16} />}
            {...form.getInputProps('taxType')}
          />
        </Grid.Col>
      </Grid>

      <Textarea
        label="Deskripsi / Keterangan"
        placeholder="Catatan tambahan mengenai penggunaan atau kebijakan akun ini..."
        minRows={3}
        autosize
        {...form.getInputProps('desc')}
      />
    </Stack>
  </Paper>
);
