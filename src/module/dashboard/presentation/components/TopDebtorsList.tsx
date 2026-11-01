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
import { IconUserExclamation } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { TopDebtor } from '@/module/dashboard/domain/dashboardMetrics';
import classes from './dashboard.module.css';
import { EmptyHint } from './EmptyHint';
import { formatDate, formatIDR } from './dashboardFormat';

/* ---------- Top Debtors (Pelanggan Piutang Terbesar) ---------- */

export function TopDebtorsList({
  debtors,
  loading,
  onOpenDebtor,
}: Readonly<{
  debtors: TopDebtor[];
  loading?: boolean;
  onOpenDebtor?: (d: TopDebtor) => void;
}>) {
  const { t, currentLanguage } = useTranslation('dashboard');

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={52} radius="md" />
        ))}
      </Stack>
    );
  }

  if (debtors.length === 0) {
    return <EmptyHint text={t('debtorsEmpty')} />;
  }

  return (
    <ScrollArea.Autosize mah={310} type="auto">
      <Stack gap={6}>
        {debtors.map((d) => (
          <UnstyledButton
            key={d.customerName}
            className={classes.rowHover}
            p="xs"
            onClick={() => onOpenDebtor?.(d)}
            style={{
              border: '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
              borderRadius: 12,
              backgroundColor: d.isOverdue
                ? 'color-mix(in srgb, var(--mantine-color-red-0) 65%, transparent)'
                : 'color-mix(in srgb, var(--mantine-color-white) 60%, transparent)',
            }}
          >
            <Group justify="space-between" wrap="nowrap">
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon
                  size={34}
                  radius="md"
                  color={d.isOverdue ? 'red' : 'blue'}
                  variant="light"
                >
                  <IconUserExclamation size={17} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} c="dark.8" truncate>
                    {d.customerName}
                  </Text>
                  <Group gap={6}>
                    <Badge size="xs" variant="light" color={d.isOverdue ? 'red' : 'gray'}>
                      {d.invoiceCount} {t('invoiceUnit')}
                    </Badge>
                    {d.oldestDueDate && (
                      <Text size="xs" c={d.isOverdue ? 'red.7' : 'dimmed'}>
                        {t('dueDateLabel')} {formatDate(d.oldestDueDate, currentLanguage)}
                      </Text>
                    )}
                  </Group>
                </Box>
              </Group>

              <Stack gap={2} align="flex-end" style={{ flexShrink: 0 }}>
                <Text size="sm" fw={700} c={d.isOverdue ? 'red.8' : 'dark.9'}>
                  {formatIDR(d.totalOutstanding)}
                </Text>
                {d.isOverdue && (
                  <Badge size="xs" color="red" variant="filled">
                    {t('overdueBadge')}
                  </Badge>
                )}
              </Stack>
            </Group>
          </UnstyledButton>
        ))}
      </Stack>
    </ScrollArea.Autosize>
  );
}
