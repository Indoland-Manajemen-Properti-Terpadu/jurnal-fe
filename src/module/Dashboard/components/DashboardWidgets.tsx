import type { ComponentType, ReactNode } from 'react';
import {
  Badge,
  Box,
  Group,
  Progress,
  ScrollArea,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
  UnstyledButton,
} from '@mantine/core';
import {
  IconArrowUpRight,
  IconEdit,
  IconFilePlus,
  IconInbox,
  IconTrash,
} from '@tabler/icons-react';
import classes from './dashboard.module.css';
import type { AgingBucket, AuditLogEntry, MonthlyPoint, SaleSummary } from '../domain/dashboardTypes';

/* ---------- formatters (display only) ---------- */

const idr = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
const idrCompact = new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const timeFmt = new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

export const formatIDR = (v: number) => idr.format(v);
export const formatCompact = (v: number) => `Rp ${idrCompact.format(v)}`;
export const formatDate = (iso?: string | null) => (iso ? dateFmt.format(new Date(iso)) : '—');

/* ---------- surfaces ---------- */

type GlassCardProps = {
  children: ReactNode;
  lift?: boolean;
  p?: number | string;
  delay?: number;
  h?: number | string;
};

export function GlassCard({ children, lift, p = 'lg', delay = 0, h }: Readonly<GlassCardProps>) {
  return (
    <Box
      p={p}
      h={h}
      className={`${classes.glass} ${lift ? classes.lift : ''} ${classes.reveal}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <Box pos="relative" style={{ zIndex: 1 }} h="100%">
        {children}
      </Box>
    </Box>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: Readonly<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap">
      <Box>
        <Text fw={700} c="dark.8">
          {title}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed" mt={2}>
            {subtitle}
          </Text>
        )}
      </Box>
      {right}
    </Group>
  );
}

const GRADIENTS: Record<string, [string, string, string]> = {
  primary: ['#053079', '#0a4fb5', 'rgba(5,48,121,0.5)'],
  cyan: ['#0891b2', '#09B2FF', 'rgba(9,178,255,0.5)'],
  teal: ['#0f766e', '#14b8a6', 'rgba(20,184,166,0.5)'],
  orange: ['#c2410c', '#f59e0b', 'rgba(245,158,11,0.5)'],
  red: ['#b91c1c', '#ef4444', 'rgba(239,68,68,0.5)'],
  violet: ['#5b21b6', '#8b5cf6', 'rgba(139,92,246,0.5)'],
};

export function IconOrb({ icon: Icon, tone = 'primary' }: Readonly<{ icon: ComponentType<{ size?: number | string }>; tone?: string }>) {
  const [a, b, s] = GRADIENTS[tone] ?? GRADIENTS.primary;
  return (
    <Box
      className={classes.iconOrb}
      style={{ background: `linear-gradient(135deg, ${a}, ${b})`, ['--orb-shadow' as string]: s }}
    >
      <Icon size={22} />
    </Box>
  );
}

/* ---------- KPI tile ---------- */

type KpiTileProps = {
  label: string;
  value: string;
  hint?: ReactNode;
  icon: ComponentType<{ size?: number | string }>;
  tone?: string;
  loading?: boolean;
  delay?: number;
  onClick?: () => void;
};

export function KpiTile({ label, value, hint, icon, tone, loading, delay, onClick }: Readonly<KpiTileProps>) {
  const content = (
    <GlassCard lift delay={delay}>
      <Group justify="space-between" align="flex-start" wrap="nowrap">
        <Box style={{ minWidth: 0 }}>
          <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.6}>
            {label}
          </Text>
          {loading ? (
            <Skeleton h={28} w={140} mt={8} radius="md" />
          ) : (
            <Text fz={24} fw={800} c="dark.8" mt={6} lh={1.15} truncate>
              {value}
            </Text>
          )}
          {hint && (
            <Text size="xs" c="dimmed" mt={6} component="div">
              {hint}
            </Text>
          )}
        </Box>
        <IconOrb icon={icon} tone={tone} />
      </Group>
    </GlassCard>
  );
  return onClick ? (
    <UnstyledButton onClick={onClick} style={{ display: 'block', borderRadius: 20 }} aria-label={label}>
      {content}
    </UnstyledButton>
  ) : (
    content
  );
}

/* ---------- Sales trend (SVG-free bar chart built with flex) ---------- */

export function SalesTrendChart({ data, loading }: Readonly<{ data: MonthlyPoint[]; loading?: boolean }>) {
  if (loading) return <Skeleton h={220} radius="lg" />;
  const max = Math.max(1, ...data.map((d) => d.invoiced));
  const hasData = data.some((d) => d.invoiced > 0);

  return (
    <Box>
      <Group gap="lg" mb="sm">
        <Group gap={6}>
          <Box w={10} h={10} style={{ borderRadius: 3, background: 'linear-gradient(180deg,#09B2FF,#053079)' }} />
          <Text size="xs" c="dimmed">Ditagihkan</Text>
        </Group>
        <Group gap={6}>
          <Box w={10} h={10} style={{ borderRadius: 3, background: '#14b8a6' }} />
          <Text size="xs" c="dimmed">Terbayar</Text>
        </Group>
      </Group>
      <Box pos="relative" h={200}>
        {[0.25, 0.5, 0.75, 1].map((g) => (
          <Box
            key={g}
            pos="absolute"
            left={0}
            right={0}
            bottom={`${g * 100}%`}
            style={{ borderTop: '1px dashed rgba(15,23,42,0.08)' }}
          />
        ))}
        <Group h="100%" align="flex-end" gap={0} wrap="nowrap" justify="space-around" pos="relative">
          {data.map((d) => (
            <Tooltip
              key={d.key}
              withArrow
              label={
                <Stack gap={2}>
                  <Text size="xs" fw={700}>{d.label}</Text>
                  <Text size="xs">Ditagihkan: {formatIDR(d.invoiced)}</Text>
                  <Text size="xs">Terbayar: {formatIDR(d.collected)}</Text>
                </Stack>
              }
            >
              <Group gap={4} align="flex-end" h="100%" wrap="nowrap" style={{ flex: 1, justifyContent: 'center' }}>
                <Box
                  className={classes.bar}
                  w={18}
                  h={`${Math.max(2, (d.invoiced / max) * 100)}%`}
                  style={{
                    borderRadius: '8px 8px 4px 4px',
                    background: 'linear-gradient(180deg,#09B2FF 0%,#053079 100%)',
                    boxShadow: '0 8px 16px -6px rgba(5,48,121,0.45)',
                  }}
                />
                <Box
                  className={classes.bar}
                  w={18}
                  h={`${Math.max(2, (d.collected / max) * 100)}%`}
                  style={{ borderRadius: '8px 8px 4px 4px', background: 'linear-gradient(180deg,#5eead4,#0f766e)' }}
                />
              </Group>
            </Tooltip>
          ))}
        </Group>
      </Box>
      <Group gap={0} justify="space-around" mt={8} wrap="nowrap">
        {data.map((d) => (
          <Text key={d.key} size="xs" c="dimmed" ta="center" style={{ flex: 1 }}>
            {d.label}
          </Text>
        ))}
      </Group>
      {!hasData && (
        <Text size="xs" c="dimmed" ta="center" mt="xs">
          Belum ada faktur terbit dalam 6 bulan terakhir.
        </Text>
      )}
    </Box>
  );
}

/* ---------- Receivable aging ---------- */

export function AgingList({ buckets, loading }: Readonly<{ buckets: AgingBucket[]; loading?: boolean }>) {
  if (loading) return <Skeleton h={180} radius="lg" />;
  const total = buckets.reduce((a, b) => a + b.amount, 0);
  return (
    <Stack gap="md">
      <Progress.Root size={14} radius="xl">
        {buckets.map((b) => (
          <Tooltip key={b.key} label={`${b.label}: ${formatIDR(b.amount)}`} withArrow>
            <Progress.Section value={total > 0 ? (b.amount / total) * 100 : 0} color={b.color} />
          </Tooltip>
        ))}
      </Progress.Root>
      {buckets.map((b) => (
        <Group key={b.key} justify="space-between" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Box w={10} h={10} bg={`${b.color}.6`} style={{ borderRadius: 999 }} />
            <Text size="sm" c="dark.7">{b.label}</Text>
            <Badge size="xs" variant="light" color="gray">{b.count}</Badge>
          </Group>
          <Text size="sm" fw={700} c={b.amount > 0 ? 'dark.8' : 'dimmed'}>
            {b.amount > 0 ? formatIDR(b.amount) : '—'}
          </Text>
        </Group>
      ))}
    </Stack>
  );
}

/* ---------- Balance composition donut ---------- */

type Slice = { label: string; value: number; color: string };

export function CompositionDonut({ slices, centerLabel, centerValue, loading }: Readonly<{
  slices: Slice[];
  centerLabel: string;
  centerValue: string;
  loading?: boolean;
}>) {
  if (loading) return <Skeleton h={200} radius="lg" />;
  const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  const r = 70;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <Group align="center" gap="xl" wrap="wrap" justify="center">
      <Box pos="relative" w={180} h={180}>
        <svg viewBox="0 0 180 180" width={180} height={180} role="img" aria-label={centerLabel}>
          <circle cx={90} cy={90} r={r} fill="none" stroke="rgba(15,23,42,0.06)" strokeWidth={20} />
          {total > 0 &&
            slices.map((s) => {
              const len = (Math.max(0, s.value) / total) * c;
              const el = (
                <circle
                  key={s.label}
                  cx={90}
                  cy={90}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={20}
                  strokeDasharray={`${len} ${c - len}`}
                  strokeDashoffset={-offset}
                  strokeLinecap="butt"
                  transform="rotate(-90 90 90)"
                  style={{ filter: `drop-shadow(0 4px 6px ${s.color}55)` }}
                />
              );
              offset += len;
              return el;
            })}
        </svg>
        <Stack gap={0} align="center" justify="center" pos="absolute" inset={0}>
          <Text size="xs" c="dimmed">{centerLabel}</Text>
          <Text fw={800} c="dark.8" size="lg">{centerValue}</Text>
        </Stack>
      </Box>
      <Stack gap="sm" style={{ flex: 1, minWidth: 180 }}>
        {slices.map((s) => (
          <Group key={s.label} justify="space-between" wrap="nowrap">
            <Group gap="xs" wrap="nowrap">
              <Box w={10} h={10} style={{ borderRadius: 3, background: s.color }} />
              <Text size="sm" c="dark.7">{s.label}</Text>
            </Group>
            <Text size="sm" fw={700} c="dark.8">{formatCompact(s.value)}</Text>
          </Group>
        ))}
      </Stack>
    </Group>
  );
}

/* ---------- Recent invoices ---------- */

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

export function RecentInvoices({ items, loading, onOpen }: Readonly<{
  items: SaleSummary[];
  loading?: boolean;
  onOpen?: (s: SaleSummary) => void;
}>) {
  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} h={48} radius="md" />)}
      </Stack>
    );
  }
  if (items.length === 0) return <EmptyHint text="Belum ada faktur penjualan." />;
  return (
    <ScrollArea.Autosize mah={340} type="auto">
      <Stack gap={4}>
        {items.map((s) => (
          <UnstyledButton key={s.id} className={classes.rowHover} p="xs" onClick={() => onOpen?.(s)}>
            <Group justify="space-between" wrap="nowrap">
              <Group gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
                <ThemeIcon variant="light" color="primary" radius="md" size={36}>
                  <IconFilePlus size={18} />
                </ThemeIcon>
                <Box style={{ minWidth: 0 }}>
                  <Text size="sm" fw={600} c="dark.8" truncate>{s.customerName}</Text>
                  <Text size="xs" c="dimmed" ff="monospace">
                    {s.transactionNumber} · {formatDate(s.transactionDate)}
                  </Text>
                </Box>
              </Group>
              <Stack gap={2} align="flex-end">
                <Text size="sm" fw={700} c="dark.8">{formatIDR(s.finalAmount)}</Text>
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

/* ---------- Activity feed ---------- */

const ACTION_META: Record<string, { color: string; label: string; icon: ComponentType<{ size?: number | string }> }> = {
  CREATE: { color: 'teal', label: 'membuat jurnal', icon: IconFilePlus },
  UPDATE: { color: 'blue', label: 'mengubah jurnal', icon: IconEdit },
  DELETE: { color: 'red', label: 'menghapus jurnal', icon: IconTrash },
};

export function ActivityFeed({ items, loading, onOpen }: Readonly<{
  items: AuditLogEntry[];
  loading?: boolean;
  onOpen?: (a: AuditLogEntry) => void;
}>) {
  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => <Skeleton key={i} h={40} radius="md" />)}
      </Stack>
    );
  }
  if (items.length === 0) return <EmptyHint text="Belum ada aktivitas jurnal." />;
  return (
    <ScrollArea.Autosize mah={340} type="auto">
      <Stack gap={0}>
        {items.slice(0, 12).map((a, idx, arr) => {
          const meta = ACTION_META[a.action] ?? { color: 'gray', label: a.action.toLowerCase(), icon: IconEdit };
          const Icon = meta.icon;
          return (
            <Group
              key={a.id}
              gap="sm"
              wrap="nowrap"
              align="flex-start"
              className={classes.rowHover}
              p="xs"
              onClick={() => a.action !== 'DELETE' && onOpen?.(a)}
            >
              <Stack gap={0} align="center">
                <ThemeIcon size={28} radius="xl" variant="light" color={meta.color}>
                  <Icon size={14} />
                </ThemeIcon>
                {idx < arr.length - 1 && <Box w={2} h={18} bg="gray.2" mt={4} />}
              </Stack>
              <Box style={{ minWidth: 0 }}>
                <Text size="sm" c="dark.8">
                  <Text span fw={600}>{a.performedBy}</Text> {meta.label}{' '}
                  <Text span ff="monospace" fw={600} c="primary.7">#{a.transactionNumber ?? '—'}</Text>
                </Text>
                <Text size="xs" c="dimmed">{a.createdAt ? timeFmt.format(new Date(a.createdAt)) : '—'}</Text>
              </Box>
            </Group>
          );
        })}
      </Stack>
    </ScrollArea.Autosize>
  );
}

/* ---------- Quick actions ---------- */

export type QuickAction = { label: string; icon: ComponentType<{ size?: number | string }>; tone: string; onClick: () => void };

export function QuickActions({ actions }: Readonly<{ actions: QuickAction[] }>) {
  return (
    <SimpleGrid cols={2} spacing="sm">
      {actions.map((a) => (
        <UnstyledButton key={a.label} onClick={a.onClick} className={`${classes.glass} ${classes.lift}`} p="md">
          <Stack gap="xs" pos="relative" style={{ zIndex: 1 }}>
            <IconOrb icon={a.icon} tone={a.tone} />
            <Group justify="space-between" wrap="nowrap">
              <Text size="sm" fw={600} c="dark.8">{a.label}</Text>
              <IconArrowUpRight size={14} color="var(--mantine-color-gray-5)" />
            </Group>
          </Stack>
        </UnstyledButton>
      ))}
    </SimpleGrid>
  );
}

export function EmptyHint({ text }: Readonly<{ text: string }>) {
  return (
    <Stack align="center" gap="xs" py="xl">
      <ThemeIcon size={44} radius="xl" variant="light" color="gray">
        <IconInbox size={22} />
      </ThemeIcon>
      <Text size="sm" c="dimmed">{text}</Text>
    </Stack>
  );
}
