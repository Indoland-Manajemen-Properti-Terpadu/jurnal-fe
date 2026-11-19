import type { ReactNode } from 'react';
import {
  ActionIcon,
  CopyButton,
  Divider,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { IconCheck, IconCopy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatIDR } from '@/module/sales/domain/saleFormat';
import { DocNoteBanner, type NoteTone } from './DocNoteBanner';

export interface DocStat {
  label: string;
  value: string;
}

interface DocOverviewCardProps {
  ns: 'salesQuotes' | 'salesOrders' | 'salesReturns';
  number: string;
  /** The status badge. */
  badge: ReactNode;
  customerName: string;
  stats: DocStat[];
  valueAmount: number;
  note: { tone: NoteTone; text: string };
  actions: ReactNode;
}

/**
 * The top card of a quote or an order: the number with its status, the key dates, the value in a
 * highlighted box, the message about where it stands, and the actions that fit its state.
 */
export function DocOverviewCard({
  ns,
  number,
  badge,
  customerName,
  stats,
  valueAmount,
  note,
  actions,
}: Readonly<DocOverviewCardProps>) {
  const { t } = useTranslation(ns);

  return (
    <Paper withBorder radius="lg" p="lg" bg="white">
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
          <Stack gap={8}>
            <Group gap="xs">
              <Title order={2} fz={26}>
                {number}
              </Title>
              <CopyButton value={number} timeout={1500}>
                {({ copied, copy }) => (
                  <Tooltip label={copied ? t('detail.copied') : t('detail.copyNumber')} withArrow>
                    <ActionIcon
                      variant="subtle"
                      color="gray"
                      onClick={copy}
                      aria-label={t('detail.copyNumber')}
                    >
                      {copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    </ActionIcon>
                  </Tooltip>
                )}
              </CopyButton>
            </Group>
            <Group gap="xs">{badge}</Group>
            <Text size="sm" c="dimmed">
              {customerName || '–'}
            </Text>
          </Stack>
          {actions}
        </Group>
        <Divider />
        <Grid gutter="lg" align="center">
          {stats.map((stat) => (
            <Grid.Col key={stat.label} span={{ base: 6, sm: 3 }}>
              <Stack gap={2}>
                <Text size="xs" c="dimmed">
                  {stat.label}
                </Text>
                <Text size="md" fw={600}>
                  {stat.value || '–'}
                </Text>
              </Stack>
            </Grid.Col>
          ))}
          <Grid.Col span={{ base: 12, sm: 3 }}>
            <Paper radius="md" p="md" bg="primary.0">
              <Stack gap={2}>
                <Text size="xs" fw={600} c="primary.8">
                  {t('detail.valueLabel')}
                </Text>
                <Text fw={800} fz={22} c="primary.9" style={{ fontVariantNumeric: 'tabular-nums' }}>
                  {formatIDR(valueAmount)}
                </Text>
              </Stack>
            </Paper>
          </Grid.Col>
        </Grid>
        <DocNoteBanner tone={note.tone} text={note.text} />
      </Stack>
    </Paper>
  );
}
