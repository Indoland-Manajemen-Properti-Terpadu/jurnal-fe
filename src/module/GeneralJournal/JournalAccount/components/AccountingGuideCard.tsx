import React from 'react';
import { Accordion, Badge, Box, Divider, Group, List, Paper, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconBulb,
  IconHierarchy2,
  IconListNumbers,
  IconScale,
} from '@tabler/icons-react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface AccountingGuideCardProps {
  activePrefix?: string;
}

const NUMBERING_RULES_ID = [
  { prefix: '1', code: '1-XXXX', name: 'Aset / Aktiva', side: 'Debit', color: 'teal', group: 'neraca' },
  { prefix: '2', code: '2-XXXX', name: 'Kewajiban / Liabilitas', side: 'Kredit', color: 'red', group: 'neraca' },
  { prefix: '3', code: '3-XXXX', name: 'Ekuitas / Modal', side: 'Kredit', color: 'red', group: 'neraca' },
  { prefix: '4', code: '4-XXXX', name: 'Pendapatan Usaha', side: 'Kredit', color: 'red', group: 'labarugi' },
  { prefix: '5', code: '5-XXXX', name: 'Harga Pokok Penjualan', side: 'Debit', color: 'teal', group: 'labarugi' },
  { prefix: '6', code: '6-XXXX', name: 'Beban Operasional', side: 'Debit', color: 'teal', group: 'labarugi' },
  { prefix: '7', code: '7-XXXX', name: 'Pendapatan Lainnya', side: 'Kredit', color: 'red', group: 'labarugi' },
  { prefix: '8', code: '8-XXXX', name: 'Beban Lainnya', side: 'Debit', color: 'teal', group: 'labarugi' },
];

const NUMBERING_RULES_EN = [
  { prefix: '1', code: '1-XXXX', name: 'Assets', side: 'Debit', color: 'teal', group: 'neraca' },
  { prefix: '2', code: '2-XXXX', name: 'Liabilities', side: 'Credit', color: 'red', group: 'neraca' },
  { prefix: '3', code: '3-XXXX', name: 'Equity / Capital', side: 'Credit', color: 'red', group: 'neraca' },
  { prefix: '4', code: '4-XXXX', name: 'Operating Revenue', side: 'Credit', color: 'red', group: 'labarugi' },
  { prefix: '5', code: '5-XXXX', name: 'Cost of Goods Sold', side: 'Debit', color: 'teal', group: 'labarugi' },
  { prefix: '6', code: '6-XXXX', name: 'Operating Expenses', side: 'Debit', color: 'teal', group: 'labarugi' },
  { prefix: '7', code: '7-XXXX', name: 'Other Income', side: 'Credit', color: 'red', group: 'labarugi' },
  { prefix: '8', code: '8-XXXX', name: 'Other Expenses', side: 'Debit', color: 'teal', group: 'labarugi' },
];

export const AccountingGuideCard: React.FC<AccountingGuideCardProps> = ({ activePrefix }) => {
  const { currentLanguage } = useTranslation('journal');
  const isEn = currentLanguage === 'en';
  const rules = isEn ? NUMBERING_RULES_EN : NUMBERING_RULES_ID;

  return (
    <Paper withBorder radius="md" p="md" bg="white" shadow="xs">
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs" wrap="nowrap">
          <ThemeIcon size={28} radius="md" variant="light" color="yellow">
            <IconBulb size={16} />
          </ThemeIcon>
          <div>
            <Text fw={700} fz={13} c="dark.8">
              {isEn ? 'Accounting Guide (COA Tips)' : 'Panduan Akuntansi (Tips)'}
            </Text>
            <Text fz={11} c="dimmed">
              {isEn ? '8 Standard COA Numbering Groups' : '8 Kelompok Standar Penomoran COA'}
            </Text>
          </div>
        </Group>
        <Badge size="xs" variant="light" color="primary">
          1-XXXX – 8-XXXX
        </Badge>
      </Group>

      <Accordion variant="separated" radius="md" defaultValue="numbering">
        <Accordion.Item value="numbering">
          <Accordion.Control icon={<IconListNumbers size={16} color={themeColors.primary[6]} />}>
            <Text fz={12} fw={700}>
              {isEn ? 'Standard Account Numbering (1–8)' : 'Standar Penomoran Akun (1–8)'}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Stack gap={6}>
              <Text fz={10} fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                {isEn ? 'Balance Sheet Accounts (1–3)' : 'Kelompok Akun Neraca (1–3)'}
              </Text>
              {rules
                .filter((r) => r.group === 'neraca')
                .map((item) => {
                  const isActive = activePrefix === item.prefix;
                  return (
                    <Box
                      key={item.code}
                      px={8}
                      py={5}
                      style={{
                        borderRadius: 6,
                        backgroundColor: isActive
                          ? 'var(--mantine-color-primary-0)'
                          : 'transparent',
                        border: isActive
                          ? `1px solid ${themeColors.primary[4]}`
                          : '1px solid transparent',
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fz={11.5} c="dimmed" truncate>
                          <Text span fw={700} ff="monospace" c={isActive ? 'primary.8' : 'dark.8'}>
                            {item.code}
                          </Text>{' '}
                          : {item.name}
                        </Text>
                        <Badge size="xs" variant={isActive ? 'filled' : 'light'} color={item.color}>
                          {item.side}
                        </Badge>
                      </Group>
                    </Box>
                  );
                })}

              <Divider my={2} />

              <Text fz={10} fw={700} c="dimmed" tt="uppercase" lts={0.4}>
                {isEn ? 'Profit & Loss Accounts (4–8)' : 'Kelompok Akun Laba Rugi (4–8)'}
              </Text>
              {rules
                .filter((r) => r.group === 'labarugi')
                .map((item) => {
                  const isActive = activePrefix === item.prefix;
                  return (
                    <Box
                      key={item.code}
                      px={8}
                      py={5}
                      style={{
                        borderRadius: 6,
                        backgroundColor: isActive
                          ? 'var(--mantine-color-primary-0)'
                          : 'transparent',
                        border: isActive
                          ? `1px solid ${themeColors.primary[4]}`
                          : '1px solid transparent',
                      }}
                    >
                      <Group justify="space-between" wrap="nowrap">
                        <Text fz={11.5} c="dimmed" truncate>
                          <Text span fw={700} ff="monospace" c={isActive ? 'primary.8' : 'dark.8'}>
                            {item.code}
                          </Text>{' '}
                          : {item.name}
                        </Text>
                        <Badge size="xs" variant={isActive ? 'filled' : 'light'} color={item.color}>
                          {item.side}
                        </Badge>
                      </Group>
                    </Box>
                  );
                })}
            </Stack>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="contra">
          <Accordion.Control icon={<IconScale size={16} color={themeColors.secondary[6]} />}>
            <Text fz={12} fw={700}>
              {isEn ? 'When to Use a Contra Account?' : 'Kapan Memilih Akun Kontra?'}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text fz={11} c="dimmed" lh={1.45}>
              {isEn ? (
                <>
                  Enable{' '}
                  <Text span fw={600} c="dark.8">
                    Contra Account
                  </Text>{' '}
                  when the account offsets the balance of a primary account in the same category:
                </>
              ) : (
                <>
                  Gunakan fitur{' '}
                  <Text span fw={600} c="dark.8">
                    Akun Kontra
                  </Text>{' '}
                  jika akun ini berfungsi mengurangi nilai saldo akun utama sejenis. Contoh:
                </>
              )}
            </Text>
            <List size="xs" spacing={4} mt={6} c="dimmed">
              <List.Item>
                <Text span fz={11}>
                  {isEn
                    ? 'Accumulated Depreciation (offsets Fixed Assets)'
                    : 'Akumulasi Penyusutan (mengurangi Aktiva Tetap)'}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz={11}>
                  {isEn
                    ? 'Sales Returns & Discounts (offsets Revenue)'
                    : 'Retur & Diskon Penjualan (mengurangi Pendapatan)'}
                </Text>
              </List.Item>
              <List.Item>
                <Text span fz={11}>
                  {isEn
                    ? 'Allowance for Doubtful Accounts (offsets Receivables)'
                    : 'Cadangan Kerugian Piutang (mengurangi Piutang Usaha)'}
                </Text>
              </List.Item>
            </List>
          </Accordion.Panel>
        </Accordion.Item>

        <Accordion.Item value="hierarchy">
          <Accordion.Control icon={<IconHierarchy2 size={16} color={themeColors.primary[5]} />}>
            <Text fz={12} fw={700}>
              {isEn ? 'Header vs. Sub-Account Hierarchy' : 'Hierarki Induk & Sub Akun'}
            </Text>
          </Accordion.Control>
          <Accordion.Panel>
            <Text fz={11} c="dimmed" lh={1.45}>
              {isEn ? (
                <>
                  <Text span fw={600} c="dark.8">
                    Sub-Accounts
                  </Text>{' '}
                  record granular daily transactions (e.g., Petty Cash HQ, Petty Cash Branch), while{' '}
                  <Text span fw={600} c="dark.8">
                    Header Accounts
                  </Text>{' '}
                  consolidate their total balances on financial reports.
                </>
              ) : (
                <>
                  <Text span fw={600} c="dark.8">
                    Sub Akun
                  </Text>{' '}
                  digunakan untuk mencatat mutasi spesifik (contoh: Kas Kasir, Kas Proyek),
                  sementara{' '}
                  <Text span fw={600} c="dark.8">
                    Akun Induk
                  </Text>{' '}
                  merangkum saldo totalnya untuk laporan keuangan.
                </>
              )}
            </Text>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Paper>
  );
};
