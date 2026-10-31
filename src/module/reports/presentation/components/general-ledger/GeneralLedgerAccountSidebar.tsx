import React from 'react';
import {
  ActionIcon,
  Badge,
  Box,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { GeneralLedgerAccount } from '@/module/reports/domain/generalLedger.types';
import { formatCount, formatMoney } from '@/module/reports/domain/reportFormat';

interface GeneralLedgerAccountSidebarProps {
  accounts: GeneralLedgerAccount[];
  selectedAccountId: string | null;
  onSelectAccount: (id: string) => void;
  search: string;
  onSearchChange: (search: string) => void;
  totalCount: number;
}

export const GeneralLedgerAccountSidebar: React.FC<GeneralLedgerAccountSidebarProps> = ({
  accounts,
  selectedAccountId,
  onSelectAccount,
  search,
  onSearchChange,
  totalCount,
}) => {
  return (
    <Paper withBorder radius="lg" p="md" bg="white" shadow="xs">
      <Stack gap="sm">
        {/* Header */}
        <Group justify="space-between" align="center">
          <Text fw={700} size="sm" c="dark.8">
            Daftar Akun Buku Besar
          </Text>
          <Badge variant="light" color="primary" size="sm">
            {formatCount(accounts.length)} / {formatCount(totalCount)}
          </Badge>
        </Group>

        {/* Search */}
        <TextInput
          placeholder="Cari nomor atau nama akun..."
          size="xs"
          radius="md"
          leftSection={<IconSearch size={14} />}
          rightSection={
            search ? (
              <ActionIcon size="xs" variant="subtle" color="gray" onClick={() => onSearchChange('')}>
                <IconX size={12} />
              </ActionIcon>
            ) : null
          }
          value={search}
          onChange={(e) => onSearchChange(e.currentTarget.value)}
        />

        {/* Account List */}
        {accounts.length === 0 ? (
          <Box py="xl" ta="center">
            <Text size="xs" c="dimmed">
              Tidak ada akun yang cocok dengan "{search}"
            </Text>
          </Box>
        ) : (
          <ScrollArea.Autosize mah={640} offsetScrollbars>
            <Stack gap={4} pr={6}>
              {accounts.map((account) => {
                const isSelected = account.id === selectedAccountId;
                return (
                  <UnstyledButton
                    key={account.id}
                    onClick={() => onSelectAccount(account.id)}
                    p="xs"
                    style={{
                      borderRadius: 'var(--mantine-radius-md)',
                      backgroundColor: isSelected
                        ? 'var(--mantine-color-primary-0)'
                        : 'transparent',
                      borderLeft: isSelected
                        ? '3px solid var(--mantine-color-primary-6)'
                        : '3px solid transparent',
                      transition: 'all 0.15s ease',
                    }}
                    styles={{
                      root: {
                        '&:hover': {
                          backgroundColor: isSelected
                            ? 'var(--mantine-color-primary-0)'
                            : 'var(--mantine-color-gray-0)',
                        },
                      },
                    }}
                  >
                    <Group justify="space-between" align="flex-start" wrap="nowrap" gap="xs">
                      <Box style={{ minWidth: 0, flex: 1 }}>
                        <Group gap={6} wrap="nowrap">
                          <Text
                            size="xs"
                            fw={700}
                            c={isSelected ? 'primary.7' : 'dark.7'}
                            style={{ fontFamily: 'monospace' }}
                          >
                            {account.number}
                          </Text>
                          <Badge size="xs" variant="outline" color="gray" radius="sm">
                            {account.category}
                          </Badge>
                        </Group>
                        <Text
                          size="xs"
                          fw={isSelected ? 600 : 500}
                          c={isSelected ? 'primary.9' : 'dark.9'}
                          truncate
                          mt={2}
                        >
                          {account.name}
                        </Text>
                      </Box>

                      <Box ta="right" style={{ flexShrink: 0 }}>
                        <Text
                          size="xs"
                          fw={700}
                          c={account.closingBalance < 0 ? 'red.6' : 'dark.8'}
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {formatMoney(account.closingBalance)}
                        </Text>
                        <Text size="10px" c="dimmed">
                          {formatCount(account.transactions.length)} mutasi
                        </Text>
                      </Box>
                    </Group>
                  </UnstyledButton>
                );
              })}
            </Stack>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Paper>
  );
};

