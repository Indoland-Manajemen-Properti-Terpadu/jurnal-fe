import {
  Badge,
  Box,
  Group,
  ScrollArea,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  UnstyledButton,
} from '@mantine/core';
import { IconFilePlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleSummary } from '@/module/dashboard/domain/dashboardTypes';
import classes from './dashboard.module.css';
import { EmptyHint } from './EmptyHint';
import { formatDate, formatIDR } from './dashboardFormat';

/* ---------- Recent Invoices ---------- */

const STATUS_COLOR: Record<string, string> = {
  DRAFT: 'gray',
  UNPAID: 'orange',
  OPEN: 'blue',
  PARTIAL: 'yellow',
  PARTIALLY_PAID: 'yellow',
  PAID: 'teal',
  VOID: 'red',
  OVERDUE: 'red',
};

export function RecentInvoices({
  items,
  loading,
  onOpen,
}: Readonly<{
  items: SaleSummary[];
  loading?: boolean;
  onOpen?: (s: SaleSummary) => void;
}>) {
  const { t, currentLanguage } = useTranslation('dashboard');

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={48} radius="md" />
        ))}
      </Stack>
    );
  }
  if (items.length === 0) return <EmptyHint text={t('invoicesEmpty')} />;
  return (
    <ScrollArea.Autosize mah={310} type="auto">
      <Stack gap={6}>
        {items.map((s) => (
          <UnstyledButton
            key={s.id}
            className={classes.rowHover}
            p="xs"
            onClick={() => onOpen?.(s)}
            style={{
              border: '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: 12,
              backgroundColor: 'rgba(255, 255, 255, 0.6)',
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon variant="light" color="primary" radius="md" size={34}>
                  <IconFilePlus size={17} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} c="dark.8" truncate>
                    {s.customerName}
                  </Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {s.transactionNumber} · {formatDate(s.transactionDate, currentLanguage)}
                  </Text>
                </Box>
              </Group>
              <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                <Text size="sm" fw={700} c="dark.9">
                  {formatIDR(s.finalAmount)}
                </Text>
                <Badge size="xs" variant="light" color={STATUS_COLOR[s.status] ?? 'gray'}>
                  {s.status.replace(/_/g, ' ')}
                </Badge>
              </Stack>
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );
}
