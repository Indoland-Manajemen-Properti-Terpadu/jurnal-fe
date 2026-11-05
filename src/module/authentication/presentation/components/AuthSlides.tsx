import React from 'react';
import { Box, Group, Stack, Text, ThemeIcon } from '@mantine/core';
import {
  IconArrowsExchange,
  IconCheck,
  IconClock,
  IconFileTypePdf,
  IconRefresh,
  IconTable,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { Area, BLUE, BLUE_SOFT, Frame, GREEN, Money, Ring, Status } from './AuthMockParts';
import { Bank, Binders, Building, Coins, FlowLine, Pill } from './AuthScenes';
import classes from './Auth.module.css';

const c = (scale: string, step: number) => `var(--mantine-color-${scale}-${step})`;

/** Tag under a half of a scene. */
const Tag = ({ label, tone }: { label: string; tone: string }) => (
  <Group gap={6} className={classes.chip} wrap="nowrap" style={{ boxShadow: 'none' }}>
    <span style={{ width: 8, height: 8, borderRadius: '50%', background: tone }} />
    <Text fz="xs" fw={700}>
      {label}
    </Text>
  </Group>
);

/** Rent paid on the property side flows into the books without being typed again. */
export const SyncSlide: React.FC = () => {
  const { t } = useTranslation('authentication');
  return (
    <Frame>
      <Pill id="sync" left={[c('sky', 2), c('sky', 4)]} right={[c('teal', 1), c('teal', 3)]} />

      <Box pos="absolute" left={36} bottom={52}>
        <Building width={150} />
      </Box>

      <Box
        className={`${classes.card} ${classes.cardFloat}`}
        p="md"
        w={230}
        pos="absolute"
        left={26}
        top={92}
      >
        <Group justify="space-between" wrap="nowrap" mb={6}>
          <Text fz="xs" c="dimmed">
            {t('mock.rentPayment')}
          </Text>
          <Status label={t('mock.paid')} tone={GREEN} />
        </Group>
        <Text fz="sm" fw={600}>
          {t('mock.unit')} A-1204
        </Text>
        <Text fz="lg" fw={700} className={classes.num}>
          Rp 4.500.000
        </Text>
      </Box>

      <Box
        pos="absolute"
        left={196}
        top={262}
        w={248}
        style={{ display: 'flex', alignItems: 'center', gap: 6 }}
      >
        <FlowLine width={74} />
        <ThemeIcon size={44} radius="xl" color="white" c="primary.7" className={classes.pulse}>
          <IconRefresh size={22} />
        </ThemeIcon>
        <FlowLine width={74} />
      </Box>

      <Box className={classes.card} p="lg" w={250} pos="absolute" right={26} top={120}>
        <Group justify="space-between" mb="sm" wrap="nowrap">
          <Text fz="sm" fw={700}>
            {t('mock.autoJournal')}
          </Text>
          <Status label={t('mock.synced')} tone={GREEN} />
        </Group>
        {[
          { name: t('mock.cash'), side: t('mock.debit'), value: '4.500.000' },
          { name: t('mock.revenue'), side: t('mock.credit'), value: '4.500.000' },
        ].map((row) => (
          <Group
            key={row.name}
            justify="space-between"
            py={8}
            wrap="nowrap"
            style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
          >
            <Box>
              <Text fz="xs">{row.name}</Text>
              <Text fz="xs" c="dimmed">
                {row.side}
              </Text>
            </Box>
            <Money bold>{row.value}</Money>
          </Group>
        ))}
        <Group
          justify="space-between"
          pt={8}
          wrap="nowrap"
          style={{ borderTop: '2px solid var(--mantine-color-gray-3)' }}
        >
          <Text fz="xs" fw={700}>
            {t('mock.difference')}
          </Text>
          <Text fz="xs" fw={700} className={classes.num}>
            Rp 0
          </Text>
        </Group>
      </Box>

      <Box
        className={`${classes.card} ${classes.cardFloatSlow}`}
        p="md"
        w={170}
        pos="absolute"
        right={60}
        bottom={90}
      >
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text fz="xs" c="dimmed">
              {t('mock.balanced')}
            </Text>
          </Box>
          <Ring value={100} label="100%" />
        </Group>
      </Box>

      <Box pos="absolute" left={60} bottom={0}>
        <Tag label={t('mock.operations')} tone={c('sky', 6)} />
      </Box>
      <Box pos="absolute" right={110} bottom={0}>
        <Tag label={t('mock.books')} tone={c('teal', 6)} />
      </Box>
    </Frame>
  );
};

/** Financial reports: the books, a profit chart, the funding split and export. */
export const ReportSlide: React.FC = () => {
  const { t } = useTranslation('authentication');
  const circumference = 2 * Math.PI * 28;
  return (
    <Frame>
      <Pill id="report" left={[c('sky', 2), c('primary', 3)]} right={[c('teal', 1), c('sky', 3)]} />

      <Box pos="absolute" left={40} bottom={56}>
        <Binders width={250} />
      </Box>

      <Box
        className={`${classes.card} ${classes.cardFloat}`}
        p="md"
        w={250}
        pos="absolute"
        left={30}
        top={86}
      >
        <Group justify="space-between" mb="xs" wrap="nowrap">
          <Text fz="xs" fw={700} tt="uppercase" c="dimmed" style={{ letterSpacing: '0.05em' }}>
            {t('mock.profit')}
          </Text>
          <Text fz="xs" c="teal.7" fw={700}>
            ▲ 12%
          </Text>
        </Group>
        <Box
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: 12,
            height: 92,
            padding: '6px 6px 0',
            background: 'var(--mantine-color-gray-0)',
            borderRadius: 10,
          }}
        >
          {[44, 58, 52, 84].map((height, index) => (
            <Box key={index} style={{ flex: 1, textAlign: 'center' }}>
              <span
                className={classes.barGrow}
                style={{
                  display: 'block',
                  height,
                  borderRadius: 6,
                  background: index === 3 ? BLUE : BLUE_SOFT,
                  animationDelay: `${index * 120}ms`,
                }}
              />
            </Box>
          ))}
        </Box>
        <Group gap={12} mt={4} wrap="nowrap">
          {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
            <Text key={q} fz={10} c="dimmed" style={{ flex: 1 }} ta="center">
              {q}
            </Text>
          ))}
        </Group>
      </Box>

      <Box className={classes.card} p="lg" w={250} pos="absolute" right={26} top={110}>
        <Text fz="sm" fw={700} mb="sm">
          {t('mock.funding')}
        </Text>
        <Group gap="md" wrap="nowrap">
          <svg width={76} height={76} viewBox="0 0 76 76" aria-hidden="true">
            <g transform="rotate(-90 38 38)">
              <circle cx={38} cy={38} r={28} fill="none" stroke={BLUE_SOFT} strokeWidth={11} />
              <circle
                cx={38}
                cy={38}
                r={28}
                fill="none"
                stroke={BLUE}
                strokeWidth={11}
                strokeDasharray={`${0.75 * circumference} ${circumference}`}
              />
            </g>
          </svg>
          <Stack gap={6}>
            <Status label={`${t('mock.equity')} 75%`} tone={BLUE} />
            <Status label={`${t('mock.liabilities')} 25%`} tone={BLUE_SOFT} />
          </Stack>
        </Group>
      </Box>

      <Group className={classes.cardFloatSlow} gap="xs" pos="absolute" right={40} bottom={80}>
        {[
          { icon: <IconFileTypePdf size={16} />, label: 'PDF' },
          { icon: <IconTable size={16} />, label: 'Excel' },
        ].map((item) => (
          <Group key={item.label} gap={6} className={classes.chip} wrap="nowrap">
            {item.icon}
            <Text fz="xs" fw={700}>
              {item.label}
            </Text>
          </Group>
        ))}
      </Group>

      <Box pos="absolute" left={70} bottom={0}>
        <Tag label={t('mock.ledger')} tone={c('primary', 6)} />
      </Box>
      <Box pos="absolute" right={110} bottom={0}>
        <Tag label={t('mock.balanceSheet')} tone={c('teal', 6)} />
      </Box>
    </Frame>
  );
};

/** Cash and bank: the bank on one side, matched statement lines on the other. */
export const ReconciliationSlide: React.FC = () => {
  const { t } = useTranslation('authentication');
  const lines = [
    { name: t('mock.lineDeposit'), amount: '+ 3.200.000', matched: true },
    { name: t('mock.lineRent'), amount: '+ 4.500.000', matched: true },
    { name: t('mock.lineVendor'), amount: '– 1.850.000', matched: false },
  ];
  return (
    <Frame>
      <Pill
        id="bank"
        left={[c('primary', 2), c('primary', 4)]}
        right={[c('teal', 1), c('teal', 3)]}
      />

      <Box pos="absolute" left={46} bottom={54}>
        <Bank width={200} />
      </Box>
      <Box pos="absolute" left={226} bottom={54}>
        <Coins width={84} />
      </Box>

      <Box
        className={`${classes.card} ${classes.cardFloat}`}
        p="md"
        w={210}
        pos="absolute"
        left={30}
        top={92}
      >
        <Text fz="xs" c="dimmed">
          {t('mock.bankBalance')}
        </Text>
        <Text fz="md" fw={700} className={classes.num} mb={4}>
          Rp 58.300.000
        </Text>
        <Area points={[40, 38, 50, 46, 60, 58, 72]} height={40} />
      </Box>

      <Box className={classes.card} p="lg" w={270} pos="absolute" right={20} top={96}>
        <Group justify="space-between" mb="xs" wrap="nowrap">
          <Text fz="sm" fw={700}>
            {t('mock.reconciliation')}
          </Text>
          <IconArrowsExchange size={16} color="var(--mantine-color-gray-6)" />
        </Group>
        <Box
          mb="sm"
          style={{ height: 6, borderRadius: 999, background: 'var(--mantine-color-gray-2)' }}
        >
          <Box
            className={classes.progressGrow}
            style={{ width: '67%', height: '100%', borderRadius: 999, background: BLUE }}
          />
        </Box>
        {lines.map((line) => (
          <Group
            key={line.name}
            gap="sm"
            py={8}
            wrap="nowrap"
            style={{ borderTop: '1px solid var(--mantine-color-gray-2)' }}
          >
            <ThemeIcon
              size={24}
              radius="xl"
              variant="light"
              color={line.matched ? 'teal' : 'orange'}
            >
              {line.matched ? <IconCheck size={14} /> : <IconClock size={14} />}
            </ThemeIcon>
            <Box style={{ flex: 1, minWidth: 0 }}>
              <Text fz="xs" truncate>
                {line.name}
              </Text>
            </Box>
            <Money bold>{line.amount}</Money>
          </Group>
        ))}
      </Box>

      <Box
        className={`${classes.card} ${classes.cardFloatSlow}`}
        p="md"
        w={170}
        pos="absolute"
        right={60}
        bottom={86}
      >
        <Group justify="space-between" wrap="nowrap">
          <Box>
            <Text fz="xs" c="dimmed">
              {t('mock.matched')}
            </Text>
            <Text fz="md" fw={700}>
              2 / 3
            </Text>
          </Box>
          <Ring value={67} label="67%" tone={BLUE} />
        </Group>
      </Box>

      <Box pos="absolute" left={70} bottom={0}>
        <Tag label={t('mock.bankBalance')} tone={c('primary', 6)} />
      </Box>
      <Box pos="absolute" right={110} bottom={0}>
        <Tag label={t('mock.statement')} tone={c('teal', 6)} />
      </Box>
    </Frame>
  );
};
