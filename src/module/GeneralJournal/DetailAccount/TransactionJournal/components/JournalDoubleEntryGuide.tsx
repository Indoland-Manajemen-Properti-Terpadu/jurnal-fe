import React from 'react';
import { Accordion, Badge, Group, List, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBulb, IconChecklist, IconScale, IconShieldCheck } from '@tabler/icons-react';
import { themeColors } from '@/theme';

export const JournalDoubleEntryGuide: React.FC = () => {
  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group gap="xs" mb="xs">
        <ThemeIcon size={28} radius="md" variant="light" color="yellow">
          <IconBulb size={16} />
        </ThemeIcon>
        <div>
          <Text fw={700} fz={13} c="dark.8">
            Panduan Jurnal Transaksi
          </Text>
          <Text fz={11} c="dimmed">
            Prinsip akuntansi berpasangan (Double-Entry)
          </Text>
        </div>
      </Group>

      <Accordion variant="separated" radius="md" defaultValue="double-entry">
        <Accordion.Item value="double-entry">
          <Accordion.Control icon={<IconScale size={16} color={themeColors.primary[6]} />}>
            <Text fz={12} fw={600}>
              Aturan Saldo Normal
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={6} fz={11}>
              <Group justify="space-between">
                <Text fz={11} c="dimmed">
                  <Text span fw={700} c="dark.8">
                    Aset & Beban
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="blue">
                  + Debit / - Kredit
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text fz={11} c="dimmed">
                  <Text span fw={700} c="dark.8">
                    Kewajiban & Ekuitas
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="violet">
                  + Kredit / - Debit
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text fz={11} c="dimmed">
                  <Text span fw={700} c="dark.8">
                    Pendapatan
                  </Text>
                </Text>
                <Badge size="xs" variant="light" color="violet">
                  + Kredit / - Debit
                </Badge>
              </Group>
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="checklist">
          <Accordion.Control icon={<IconChecklist size={16} color={themeColors.secondary[6]} />}>
            <Text fz={12} fw={600}>
              Syarat Sah Transaksi Jurnal
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <List size="xs" spacing={4} c="dimmed">
              <List.Item>
                <Text span fz={11}>
                  Minimal terdiri dari{' '}
                  <Text span fw={600} c="dark.8">
                    2 baris akun
                  </Text>
                  .
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz={11}>
                  Total nilai Debit harus{' '}
                  <Text span fw={600} c="dark.8">
                    persis sama
                  </Text>{' '}
                  dengan Total Kredit.
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz={11}>
                  Tanggal transaksi wajib diisi sesuai waktu terjadinya mutasi.
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz={11}>
                  Lampirkan bukti dukung kuitansi/invoice jika tersedia.
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};
