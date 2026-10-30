import { useState, type ComponentType, type MouseEvent, type ReactNode } from 'react';
import {
  Badge,
  Box,
  Divider,
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
  IconAlertCircle,
  IconArrowRight,
  IconArrowUpRight,
  IconBuildingBank,
  IconCircleCheck,
  IconEdit,
  IconFilePlus,
  IconInbox,
  IconInfoCircle,
  IconTrash,
  IconUserExclamation,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './dashboard.module.css';
import type {
  AgingBucket,
  AuditLogEntry,
  BalanceSheetLine,
  MonthlyPoint,
  SaleSummary,
} from '@/module/dashboard/domain/dashboardTypes';
import type { TopDebtor } from '@/module/dashboard/domain/dashboardMetrics';

/* ---------- formatters (display only) ---------- */

const idr = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
});
const idrCompact = new Intl.NumberFormat('id-ID', {
  notation: 'compact',
  maximumFractionDigits: 1,
});
const dateFmtId = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const dateFmtEn = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
const timeFmtId = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});
const timeFmtEn = new Intl.DateTimeFormat('en-US', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
});

export const formatIDR = (v: number) => idr.format(v);
export const formatCompact = (v: number) => `Rp ${idrCompact.format(v)}`;
export const formatDate = (iso?: string | null, lang: 'id' | 'en' = 'id') => {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return (lang === 'en' ? dateFmtEn : dateFmtId).format(d);
};

/* ---------- Spatial Glass Surface with 3D Perspective Tilt ---------- */

type GlassCardProps = {
  children: ReactNode;
  lift?: boolean;
  spatialTilt?: boolean;
  p?: number | string;
  delay?: number;
  h?: number | string;
};

export function GlassCard({
  children,
  lift,
  spatialTilt = true,
  p = 'lg',
  delay = 0,
  h,
}: Readonly<GlassCardProps>) {
  const [tiltStyle, setTiltStyle] = useState<Record<string, string>>({});

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!spatialTilt) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = x / rect.width;
    const pctY = y / rect.height;
    const rotateY = (pctX - 0.5) * 4.5;
    const rotateX = (0.5 - pctY) * 4.5;

    setTiltStyle({
      '--tilt-x': `${rotateX.toFixed(2)}deg`,
      '--tilt-y': `${rotateY.toFixed(2)}deg`,
      '--glare-x': `${(pctX * 100).toFixed(1)}%`,
      '--glare-y': `${(pctY * 100).toFixed(1)}%`,
    });
  };

  const handleMouseLeave = () => {
    if (!spatialTilt) return;
    setTiltStyle({
      '--tilt-x': '0deg',
      '--tilt-y': '0deg',
    });
  };

  return (
    <Box
      p={p}
      h={h}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`${classes.glass} ${lift ? classes.lift : ''} ${classes.reveal}`}
      style={{ animationDelay: `${delay}ms`, ...tiltStyle }}
    >
      <Box pos="relative" style={{ zIndex: 1 }} h="100%">
        {children}
      </Box>
    </Box>
  );
}

/* ---------- Section & Card Headers ---------- */

export function SectionHeader({
  icon: Icon,
  title,
  subtitle,
  right,
}: Readonly<{
  icon: ComponentType<{ size?: number | string }>;
  title: string;
  subtitle?: string;
  right?: ReactNode;
}>) {
  return (
    <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm" mt="xs">
      <Group gap="sm" align="center" wrap="nowrap">
        <Box className={classes.sectionBadge}>
          <Icon size={16} />
        </Box>
        <Box>
          <Text fw={800} fz={16} c="dark.9" lh={1.2}>
            {title}
          </Text>
          {subtitle && (
            <Text size="xs" c="dimmed" mt={2}>
              {subtitle}
            </Text>
          )}
        </Box>
      </Group>
      {right}
    </Group>
  );
}

export function CardHeader({
  title,
  subtitle,
  right,
}: Readonly<{ title: string; subtitle?: string; right?: ReactNode }>) {
  return (
    <Group justify="space-between" align="flex-start" mb="md" wrap="nowrap" gap="sm">
      <Box style={{ minWidth: 0 }}>
        <Text fw={700} fz={15} c="dark.9" lh={1.25}>
          {title}
        </Text>
        {subtitle && (
          <Text size="xs" c="dimmed" mt={3} lh={1.4}>
            {subtitle}
          </Text>
        )}
      </Box>
      {right && <Box style={{ flexShrink: 0 }}>{right}</Box>}
    </Group>
  );
}

const GRADIENTS: Record<string, [string, string, string]> = {
  primary: ['#053079', '#0a4fb5', 'rgba(5,48,121,0.45)'],
  cyan: ['#0284c7', '#09B2FF', 'rgba(9,178,255,0.45)'],
  teal: ['#0f766e', '#14b8a6', 'rgba(20,184,166,0.45)'],
  orange: ['#c2410c', '#f59e0b', 'rgba(245,158,11,0.45)'],
  red: ['#b91c1c', '#ef4444', 'rgba(239,68,68,0.45)'],
  violet: ['#5b21b6', '#8b5cf6', 'rgba(139,92,246,0.45)'],
};

export function IconOrb({
  icon: Icon,
  tone = 'primary',
}: Readonly<{ icon: ComponentType<{ size?: number | string }>; tone?: string }>) {
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

/* ---------- Spatial KPI Tile ---------- */

type KpiTileProps = {
  label: string;
  value: string;
  description?: string;
  hint?: ReactNode;
  icon: ComponentType<{ size?: number | string }>;
  tone?: string;
  loading?: boolean;
  delay?: number;
  spatialTilt?: boolean;
  onClick?: () => void;
};

export function KpiTile({
  label,
  value,
  description,
  hint,
  icon,
  tone = 'primary',
  loading,
  delay,
  spatialTilt = true,
  onClick,
}: Readonly<KpiTileProps>) {
  const content = (
    <GlassCard lift spatialTilt={spatialTilt} delay={delay} h="100%">
      <Stack justify="space-between" h="100%" gap="sm">
        <Group justify="space-between" align="flex-start" wrap="nowrap">
          <Box style={{ minWidth: 0 }}>
            <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={0.6}>
              {label}
            </Text>
            {loading ? (
              <Skeleton h={30} w={150} mt={8} radius="md" />
            ) : (
              <Text fz={{ base: 21, xl: 23 }} fw={800} c="dark.9" mt={6} lh={1.15} truncate>
                {value}
              </Text>
            )}
            {description && (
              <Text fz={11.5} c="dimmed" mt={4} lh={1.35}>
                {description}
              </Text>
            )}
          </Box>
          <IconOrb icon={icon} tone={tone} />
        </Group>

        {hint && (
          <Box
            pt={8}
            style={{
              borderTop: '1px solid rgba(15, 23, 42, 0.06)',
            }}
          >
            <Group justify="space-between" align="center" wrap="nowrap">
              <Text size="xs" fw={600} c="dark.6" component="div" truncate>
                {hint}
              </Text>
              <IconArrowUpRight size={14} color="var(--mantine-color-gray-5)" />
            </Group>
          </Box>
        )}
      </Stack>
    </GlassCard>
  );

  return onClick ? (
    <UnstyledButton
      onClick={onClick}
      style={{ display: 'block', height: '100%', borderRadius: 20 }}
      aria-label={label}
    >
      {content}
    </UnstyledButton>
  ) : (
    content
  );
}

/* ---------- 6-Month Billing & Collection Trend Chart ---------- */

export function SalesTrendChart({
  data,
  loading,
}: Readonly<{ data: MonthlyPoint[]; loading?: boolean }>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={260} radius="lg" />;

  const max = Math.max(1, ...data.map((d) => Math.max(d.invoiced, d.collected)));
  const hasData = data.some((d) => d.invoiced > 0 || d.collected > 0);
  const total6mInvoiced = data.reduce((acc, d) => acc + d.invoiced, 0);
  const total6mCollected = data.reduce((acc, d) => acc + d.collected, 0);
  const total6mUncollected = Math.max(0, total6mInvoiced - total6mCollected);

  return (
    <Stack gap="md">
      {/* Top 6-Month Summary Strip */}
      <SimpleGrid
        cols={{ base: 1, xs: 3 }}
        spacing="xs"
        p="xs"
        style={{
          borderRadius: 12,
          backgroundColor: 'rgba(241, 245, 249, 0.75)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        <Box px="xs">
          <Text fz={11} c="dimmed" fw={600}>
            {t('summary6mInvoiced')}
          </Text>
          <Text size="sm" fw={800} c="primary.8" mt={2}>
            {formatIDR(total6mInvoiced)}
          </Text>
        </Box>
        <Box
          px="xs"
          style={{
            borderLeft: '1px solid rgba(15, 23, 42, 0.06)',
            borderRight: '1px solid rgba(15, 23, 42, 0.06)',
          }}
        >
          <Text fz={11} c="dimmed" fw={600}>
            {t('summary6mCollected')}
          </Text>
          <Text size="sm" fw={800} c="teal.7" mt={2}>
            {formatIDR(total6mCollected)}
          </Text>
        </Box>
        <Box px="xs">
          <Text fz={11} c="dimmed" fw={600}>
            {t('summary6mUncollected')}
          </Text>
          <Text size="sm" fw={800} c={total6mUncollected > 0 ? 'orange.8' : 'dark.8'} mt={2}>
            {formatIDR(total6mUncollected)}
          </Text>
        </Box>
      </SimpleGrid>

      {/* Legend */}
      <Group justify="space-between" align="center" wrap="wrap">
        <Group gap="lg">
          <Group gap={6}>
            <Box w={11} h={11} style={{ borderRadius: 3, background: '#0a5fbd' }} />
            <Text size="xs" fw={600} c="dark.6">
              {t('legendInvoiced')}
            </Text>
          </Group>
          <Group gap={6}>
            <Box w={11} h={11} style={{ borderRadius: 3, background: '#168b7a' }} />
            <Text size="xs" fw={600} c="dark.6">
              {t('legendCollected')}
            </Text>
          </Group>
        </Group>
        <Text fz={11} c="dimmed">
          Max: {formatCompact(max)}
        </Text>
      </Group>

      {/* Bar Plot Area */}
      <Box pos="relative" h={195} pt={8}>
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
        <Group
          h="100%"
          align="flex-end"
          gap={0}
          wrap="nowrap"
          justify="space-around"
          pos="relative"
        >
          {data.map((d) => {
            const monthRate = d.invoiced > 0 ? Math.round((d.collected / d.invoiced) * 100) : 0;
            return (
              <Tooltip
                key={d.key}
                withArrow
                position="top"
                label={
                  <Stack gap={2} p={2}>
                    <Text size="xs" fw={700}>
                      {d.label} ({monthRate}%)
                    </Text>
                    <Text size="xs">
                      {t('legendInvoiced')}: {formatIDR(d.invoiced)}
                    </Text>
                    <Text size="xs">
                      {t('legendCollected')}: {formatIDR(d.collected)}
                    </Text>
                  </Stack>
                }
              >
                <Group
                  gap={5}
                  align="flex-end"
                  h="100%"
                  wrap="nowrap"
                  style={{ flex: 1, justifyContent: 'center', cursor: 'pointer' }}
                >
                  <Box
                    className={classes.bar}
                    w={20}
                    h={`${Math.max(3, (d.invoiced / max) * 100)}%`}
                    style={{
                      borderRadius: '8px 8px 4px 4px',
                      background: '#0a5fbd',
                    }}
                  />
                  <Box
                    className={classes.bar}
                    w={20}
                    h={`${Math.max(3, (d.collected / max) * 100)}%`}
                    style={{
                      borderRadius: '8px 8px 4px 4px',
                      background: '#168b7a',
                    }}
                  />
                </Group>
              </Tooltip>
            );
          })}
        </Group>
      </Box>

      {/* X-Axis Labels + Monthly Collection % */}
      <Group gap={0} justify="space-around" wrap="nowrap">
        {data.map((d) => {
          const pct = d.invoiced > 0 ? Math.round((d.collected / d.invoiced) * 100) : 0;
          return (
            <Stack key={d.key} gap={1} align="center" style={{ flex: 1 }}>
              <Text size="xs" fw={600} c="dark.7" ta="center">
                {d.label}
              </Text>
              <Text fz={10} c={pct >= 80 ? 'teal.7' : 'dimmed'} fw={600}>
                {d.invoiced > 0 ? `${pct}%` : '—'}
              </Text>
            </Stack>
          );
        })}
      </Group>

      {!hasData && (
        <Text size="xs" c="dimmed" ta="center">
          {t('noTrendData')}
        </Text>
      )}
    </Stack>
  );
}

/* ---------- Receivable Aging ---------- */

export function AgingList({
  buckets,
  loading,
}: Readonly<{ buckets: AgingBucket[]; loading?: boolean }>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={220} radius="lg" />;
  const total = buckets.reduce((a, b) => a + b.amount, 0);
  const totalCount = buckets.reduce((a, b) => a + b.count, 0);

  return (
    <Stack gap="md">
      {/* Summary Header Box */}
      <Box
        p="sm"
        style={{
          borderRadius: 12,
          backgroundColor: 'rgba(241, 245, 249, 0.75)',
          border: '1px solid rgba(15, 23, 42, 0.06)',
        }}
      >
        <Group justify="space-between" align="center" wrap="nowrap">
          <Box>
            <Text fz={11} c="dimmed" fw={600} tt="uppercase">
              {t('agingTotalLabel')}
            </Text>
            <Text size="md" fw={800} c="dark.9" mt={2}>
              {formatIDR(total)}
            </Text>
          </Box>
          <Badge variant="light" color="primary" radius="sm">
            {totalCount} {t('invoiceUnit')}
          </Badge>
        </Group>
      </Box>

      {/* Proportional Stacked Bar */}
      <Progress.Root size={14} radius="xl">
        {buckets.map((b) => (
          <Tooltip key={b.key} label={`${b.label}: ${formatIDR(b.amount)}`} withArrow>
            <Progress.Section
              value={total > 0 ? Math.max(b.amount > 0 ? 4 : 0, (b.amount / total) * 100) : 0}
              color={b.color}
            />
          </Tooltip>
        ))}
      </Progress.Root>

      {/* Bucket Breakdown Rows */}
      <Stack gap="xs">
        {buckets.map((b) => {
          const share = total > 0 ? Math.round((b.amount / total) * 100) : 0;
          return (
            <Box
              key={b.key}
              p="xs"
              style={{
                borderRadius: 10,
                border: '1px solid rgba(15, 23, 42, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              <Group justify="space-between" wrap="nowrap">
                <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                  <Box
                    w={10}
                    h={10}
                    bg={`${b.color}.6`}
                    style={{ borderRadius: 999, flexShrink: 0 }}
                  />
                  <Text size="xs" fw={600} c="dark.8" truncate>
                    {b.label}
                  </Text>
                  <Badge size="xs" variant="light" color={b.count > 0 ? b.color : 'gray'}>
                    {b.count}
                  </Badge>
                </Group>
                <Group gap={6} wrap="nowrap">
                  <Text size="xs" fw={700} c={b.amount > 0 ? 'dark.9' : 'dimmed'}>
                    {b.amount > 0 ? formatIDR(b.amount) : '—'}
                  </Text>
                  {b.amount > 0 && (
                    <Text fz={10.5} c="dimmed" w={32} ta="right">
                      ({share}%)
                    </Text>
                  )}
                </Group>
              </Group>
            </Box>
          );
        })}
      </Stack>
    </Stack>
  );
}

/* ---------- Balance Sheet Composition Donut + Plain-Language Insight ---------- */

type Slice = { label: string; value: number; color: string };

export function CompositionDonut({
  slices,
  centerLabel,
  centerValue,
  netWorkingCapital,
  loading,
}: Readonly<{
  slices: Slice[];
  centerLabel: string;
  centerValue: string;
  netWorkingCapital?: number;
  loading?: boolean;
}>) {
  const { t } = useTranslation('dashboard');

  if (loading) return <Skeleton h={220} radius="lg" />;
  const total = slices.reduce((a, s) => a + Math.max(0, s.value), 0);
  const r = 68;
  const c = 2 * Math.PI * r;
  let offset = 0;

  return (
    <Stack gap="md">
      <Group align="center" gap="xl" wrap="wrap" justify="center">
        <Box pos="relative" w={176} h={176}>
          <svg viewBox="0 0 180 180" width={176} height={176} role="img" aria-label={centerLabel}>
            <circle
              cx={90}
              cy={90}
              r={r}
              fill="none"
              stroke="rgba(15,23,42,0.06)"
              strokeWidth={20}
            />
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
                  />
                );
                offset += len;
                return el;
              })}
          </svg>
          <Stack gap={0} align="center" justify="center" pos="absolute" inset={0}>
            <Text fz={11} c="dimmed" fw={600}>
              {centerLabel}
            </Text>
            <Text fw={800} c="dark.9" size="md">
              {centerValue}
            </Text>
          </Stack>
        </Box>

        <Stack gap="xs" style={{ flex: 1, minWidth: 200 }}>
          {slices.map((s) => {
            const pct = total > 0 ? Math.round((Math.max(0, s.value) / total) * 100) : 0;
            return (
              <Box
                key={s.label}
                p={8}
                style={{
                  borderRadius: 10,
                  border: '1px solid rgba(15, 23, 42, 0.05)',
                  backgroundColor: 'rgba(255, 255, 255, 0.55)',
                }}
              >
                <Group justify="space-between" wrap="nowrap">
                  <Group gap="xs" wrap="nowrap">
                    <Box w={10} h={10} style={{ borderRadius: 3, background: s.color }} />
                    <Text size="xs" fw={600} c="dark.8">
                      {s.label}
                    </Text>
                  </Group>
                  <Group gap={6} wrap="nowrap">
                    <Text size="xs" fw={700} c="dark.9">
                      {formatCompact(s.value)}
                    </Text>
                    <Badge size="xs" variant="light" color="gray">
                      {pct}%
                    </Badge>
                  </Group>
                </Group>
              </Box>
            );
          })}
        </Stack>
      </Group>

      {typeof netWorkingCapital === 'number' && (
        <Box
          p="sm"
          style={{
            borderRadius: 12,
            backgroundColor: 'rgba(9, 178, 255, 0.06)',
            border: '1px solid rgba(9, 178, 255, 0.2)',
          }}
        >
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="xs" wrap="nowrap">
              <ThemeIcon size={26} radius="md" variant="light" color="primary">
                <IconInfoCircle size={15} />
              </ThemeIcon>
              <Box>
                <Text size="xs" fw={700} c="primary.9">
                  {t('netWorkingCapital')}
                </Text>
                <Text fz={11} c="dimmed">
                  {t('insightWorkingCapitalDesc')}
                </Text>
              </Box>
            </Group>
            <Text size="sm" fw={800} c={netWorkingCapital >= 0 ? 'teal.8' : 'red.7'}>
              {formatIDR(netWorkingCapital)}
            </Text>
          </Group>
        </Box>
      )}
    </Stack>
  );
}

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

/* ---------- Activity Feed ---------- */

export function ActivityFeed({
  items,
  loading,
  onOpen,
}: Readonly<{
  items: AuditLogEntry[];
  loading?: boolean;
  onOpen?: (a: AuditLogEntry) => void;
}>) {
  const { t, currentLanguage } = useTranslation('dashboard');

  const actionMeta: Record<
    string,
    { color: string; label: string; icon: ComponentType<{ size?: number | string }> }
  > = {
    CREATE: { color: 'teal', label: t('actionCreate'), icon: IconFilePlus },
    UPDATE: { color: 'blue', label: t('actionUpdate'), icon: IconEdit },
    DELETE: { color: 'red', label: t('actionDelete'), icon: IconTrash },
  };

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} h={42} radius="md" />
        ))}
      </Stack>
    );
  }
  if (items.length === 0) return <EmptyHint text={t('activityEmpty')} />;
  const timeFormatter = currentLanguage === 'en' ? timeFmtEn : timeFmtId;

  return (
    <ScrollArea.Autosize mah={320} type="auto">
      <Stack gap={0}>
        {items.slice(0, 12).map((a, idx, arr) => {
          const meta = actionMeta[a.action] ?? {
            color: 'gray',
            label: a.action.toLowerCase(),
            icon: IconEdit,
          };
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
                <Text size="sm" c="dark.8" lh={1.35}>
                  <Text span fw={700}>
                    {a.performedBy}
                  </Text>{' '}
                  {meta.label}{' '}
                  <Text span ff="monospace" fw={700} c="primary.7">
                    #{a.transactionNumber ?? '—'}
                  </Text>
                </Text>
                <Text size="xs" c="dimmed" mt={2}>
                  {a.createdAt ? timeFormatter.format(new Date(a.createdAt)) : '—'}
                </Text>
              </Box>
            </Group>
          );
        })}
      </Stack>
    </ScrollArea.Autosize>
  );
}

/* ---------- Quick Actions ---------- */

export type QuickAction = {
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  tone: string;
  onClick: () => void;
};

export function QuickActions({ actions }: Readonly<{ actions: QuickAction[] }>) {
  return (
    <SimpleGrid cols={2} spacing="xs">
      {actions.map((a) => (
        <UnstyledButton
          key={a.label}
          onClick={a.onClick}
          className={classes.rowHover}
          p="sm"
          style={{
            borderRadius: 14,
            border: '1px solid rgba(15, 23, 42, 0.07)',
            backgroundColor: 'rgba(255, 255, 255, 0.72)',
          }}
        >
          <Stack gap={8}>
            <IconOrb icon={a.icon} tone={a.tone} />
            <Group justify="space-between" wrap="nowrap" gap={4}>
              <Text size="xs" fw={700} c="dark.8" truncate>
                {a.label}
              </Text>
              <IconArrowUpRight size={13} color="var(--mantine-color-gray-5)" />
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
      <Text size="sm" c="dimmed" ta="center">
        {text}
      </Text>
    </Stack>
  );
}

/* ---------- Actionable Alert / Reassurance Banner ---------- */

export function ActionBanner({
  overdueCount,
  overdueAmount,
  draftCount,
  pendingCount,
  onViewOverdue,
  onViewDrafts,
  onViewPending,
}: Readonly<{
  overdueCount: number;
  overdueAmount: number;
  draftCount: number;
  pendingCount: number;
  onViewOverdue?: () => void;
  onViewDrafts?: () => void;
  onViewPending?: () => void;
}>) {
  const { t } = useTranslation('dashboard');
  const hasAlerts = overdueCount > 0 || draftCount > 0 || pendingCount > 0;

  if (!hasAlerts) {
    return (
      <Box
        px="md"
        py={10}
        style={{
          borderRadius: 12,
          background: '#f0fdfa',
          border: '1px solid #ccfbf1',
        }}
      >
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={28} radius="md" color="teal" variant="filled">
            <IconCircleCheck size={17} />
          </ThemeIcon>
          <Group gap="xs" wrap="wrap">
            <Text fw={700} size="xs" c="teal.9">
              {t('healthyBannerTitle')}:
            </Text>
            <Text size="xs" c="dark.6">
              {t('healthyBannerDesc')}
            </Text>
          </Group>
        </Group>
      </Box>
    );
  }

  return (
    <Box
      p="sm"
      style={{
        borderRadius: 12,
        background: '#fffbeb',
        border: '1px solid #fde68a',
      }}
    >
      <Group justify="space-between" align="center" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon
            size={34}
            radius="md"
            color={overdueCount > 0 ? 'red' : 'orange'}
            variant="filled"
          >
            <IconAlertCircle size={20} />
          </ThemeIcon>
          <Box>
            <Text fw={700} size="sm" c="dark.9">
              {overdueCount > 0
                ? t('alertTitleOverdue', { count: overdueCount })
                : t('alertTitlePending')}
            </Text>
            <Text size="xs" c="dark.6">
              {overdueCount > 0 && (
                <Text span fw={700} c="red.8">
                  {t('alertOverdueAmount', { amount: formatIDR(overdueAmount) })}
                </Text>
              )}
              {overdueCount > 0 && draftCount > 0 && ' · '}
              {draftCount > 0 && t('alertDraftCount', { count: draftCount })}
              {(overdueCount > 0 || draftCount > 0) && pendingCount > 0 && ' · '}
              {pendingCount > 0 && t('alertPendingCount', { count: pendingCount })}
            </Text>
          </Box>
        </Group>

        <Group gap="xs">
          {overdueCount > 0 && (
            <UnstyledButton
              onClick={onViewOverdue}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(239, 68, 68, 0.16)',
                color: 'var(--mantine-color-red-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnOverdue')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
          {draftCount > 0 && (
            <UnstyledButton
              onClick={onViewDrafts}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(14, 165, 233, 0.16)',
                color: 'var(--mantine-color-blue-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnDraft')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
          {pendingCount > 0 && (
            <UnstyledButton
              onClick={onViewPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                padding: '6px 12px',
                borderRadius: 8,
                backgroundColor: 'rgba(245, 158, 11, 0.22)',
                color: 'var(--mantine-color-orange-9)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {t('alertBtnPending')} <IconArrowRight size={12} />
            </UnstyledButton>
          )}
        </Group>
      </Group>
    </Box>
  );
}

/* ---------- Bank & Cash Account Balances Widget ---------- */

export function BankAccountsList({
  accounts,
  loading,
  onOpenAccount,
}: Readonly<{
  accounts: BalanceSheetLine[];
  loading?: boolean;
  onOpenAccount?: (account: BalanceSheetLine) => void;
}>) {
  const { t } = useTranslation('dashboard');

  if (loading) {
    return (
      <Stack gap="xs">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} h={56} radius="md" />
        ))}
      </Stack>
    );
  }

  if (accounts.length === 0) {
    return <EmptyHint text={t('bankEmpty')} />;
  }

  const totalBalance = accounts.reduce((sum, a) => sum + Math.max(0, a.balance), 0);

  return (
    <Stack gap="xs">
      <ScrollArea.Autosize mah={290} type="auto">
        <Stack gap={8}>
          {accounts.map((acc) => {
            const pct = totalBalance > 0 ? (Math.max(0, acc.balance) / totalBalance) * 100 : 0;
            const isNegative = acc.balance < 0;

            return (
              <UnstyledButton
                key={acc.accountId ?? acc.accountName}
                className={classes.rowHover}
                p="sm"
                onClick={() => onOpenAccount?.(acc)}
                style={{
                  border: '1px solid rgba(15, 23, 42, 0.06)',
                  borderRadius: 12,
                  backgroundColor: 'rgba(255, 255, 255, 0.65)',
                }}
              >
                <Group justify="space-between" wrap="nowrap" mb={6}>
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <ThemeIcon size={34} radius="md" color="primary" variant="light">
                      <IconBuildingBank size={17} />
                    </ThemeIcon>
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={600} c="dark.8" truncate>
                        {acc.accountName}
                      </Text>
                      <Text size="xs" c="dimmed" ff="monospace">
                        {acc.accountNumber ?? 'Kas & Bank'}
                      </Text>
                    </Box>
                  </Group>

                  <Stack gap={0} align="flex-end" style={{ flexShrink: 0 }}>
                    <Text size="sm" fw={700} c={isNegative ? 'red.7' : 'dark.9'}>
                      {formatIDR(acc.balance)}
                    </Text>
                    <Text size="xs" c="dimmed">
                      {t('bankShareOfTotal', { pct: pct.toFixed(0) })}
                    </Text>
                  </Stack>
                </Group>
                <Progress value={pct} size={5} radius="xl" color="primary.5" />
              </UnstyledButton>
            );
          })}
        </Stack>
      </ScrollArea.Autosize>
    </Stack>
  );
}

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
              border: '1px solid rgba(15, 23, 42, 0.06)',
              borderRadius: 12,
              backgroundColor: d.isOverdue
                ? 'rgba(254, 242, 242, 0.65)'
                : 'rgba(255, 255, 255, 0.6)',
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

export { Divider };
