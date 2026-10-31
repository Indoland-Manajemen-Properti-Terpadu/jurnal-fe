import { Badge, Box, Divider, Grid, Group, Stack, Text } from '@mantine/core';
import {
  IconBuildingBank,
  IconCalendarStats,
  IconCoin,
  IconFileInvoice,
  IconNotebook,
  IconShieldCheck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import classes from './dashboard.module.css';
import { CardHeader } from './CardHeader';
import { GlassCard } from './GlassCard';
import { QuickActions } from './QuickActions';

type ControlCenterCardProps = {
  pendingCount: number;
  pendingLoading: boolean;
  draftCount: number;
  draftLoading: boolean;
  contactTotal: number;
  contactsLoading: boolean;
  activePeriodName?: string;
};

export function ControlCenterCard({
  pendingCount,
  pendingLoading,
  draftCount,
  draftLoading,
  contactTotal,
  contactsLoading,
  activePeriodName,
}: Readonly<ControlCenterCardProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  return (
    <Grid.Col span={{ base: 12, md: 6, lg: 3 }}>
      <GlassCard spatialTilt={false} delay={460} h="100%">
        <CardHeader title={t('controlTitle')} subtitle={t('controlSubtitle')} />

        <Stack gap="xs">
          {[
            {
              icon: IconShieldCheck,
              color: pendingCount > 0 ? 'orange' : 'teal',
              label: t('ctrlPendingChanges'),
              value: pendingLoading ? '…' : String(pendingCount),
              onClick: () => navigate(routes.pendingChanges.main),
            },
            {
              icon: IconFileInvoice,
              color: draftCount > 0 ? 'blue' : 'gray',
              label: t('ctrlDraftInvoices'),
              value: draftLoading ? '…' : String(draftCount),
              onClick: () => navigate(routes.sales.main),
            },
            {
              icon: IconUsers,
              color: 'violet',
              label: t('ctrlTotalContacts'),
              value: contactsLoading ? '…' : String(contactTotal),
              onClick: () => navigate(routes.contacts.main),
            },
            {
              icon: IconCalendarStats,
              color: activePeriodName ? 'primary' : 'gray',
              label: t('ctrlActivePeriod'),
              value: activePeriodName ?? t('periodOpenValue'),
              onClick: () => navigate(routes.periodClosing.list),
            },
          ].map((row) => (
            <Group
              key={row.label}
              justify="space-between"
              wrap="nowrap"
              p={8}
              className={classes.rowHover}
              onClick={row.onClick}
              style={{
                border:
                  '1px solid color-mix(in srgb, var(--mantine-color-slate-9) 6%, transparent)',
                background: 'color-mix(in srgb, var(--mantine-color-white) 65%, transparent)',
              }}
            >
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  w={30}
                  h={30}
                  bg={`${row.color}.0`}
                  c={`${row.color}.7`}
                  style={{
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <row.icon size={16} />
                </Box>
                <Text size="xs" fw={600} c="dark.7" truncate>
                  {row.label}
                </Text>
              </Group>
              <Badge variant="light" color={row.color} size="sm" radius="sm">
                {row.value}
              </Badge>
            </Group>
          ))}

          <Divider my={4} label={t('quickActionsLabel')} labelPosition="center" />

          <QuickActions
            actions={[
              {
                label: t('qaGeneralJournal'),
                icon: IconNotebook,
                tone: 'primary',
                onClick: () => navigate(routes.journalEntries.add),
              },
              {
                label: t('qaReceiveMoney'),
                icon: IconCoin,
                tone: 'teal',
                onClick: () => navigate(routes.bankCash.addReceive),
              },
              {
                label: t('qaSendMoney'),
                icon: IconWallet,
                tone: 'orange',
                onClick: () => navigate(routes.bankCash.addSent),
              },
              {
                label: t('qaTransferCash'),
                icon: IconBuildingBank,
                tone: 'cyan',
                onClick: () => navigate(routes.bankCash.addTransfer),
              },
            ]}
          />
        </Stack>
      </GlassCard>
    </Grid.Col>
  );
}
