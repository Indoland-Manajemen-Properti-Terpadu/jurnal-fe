import { Badge, Box, Button, Grid, Group, Stack, Text, UnstyledButton } from '@mantine/core';
import {
  IconBuildingBank,
  IconCalendarStats,
  IconCoin,
  IconFileInvoice,
  IconNotebook,
  IconShieldCheck,
  IconWallet,
} from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { routes } from '@/router/routes';
import { useTranslation } from '@/i18n';
import classes from './dashboard.module.css';

type ControlCenterCardProps = {
  pendingCount: number;
  pendingLoading: boolean;
  pendingError: boolean;
  draftError: boolean;
  draftCount: number;
  draftLoading: boolean;
  activePeriodName?: string;
};

export function ControlCenterCard({
  pendingCount,
  pendingLoading,
  pendingError,
  draftError,
  draftCount,
  draftLoading,
  activePeriodName,
}: Readonly<ControlCenterCardProps>) {
  const navigate = useNavigate();
  const { t } = useTranslation('dashboard');

  return (
    <Grid.Col span={{ base: 12, lg: 4 }}>
      <Box className={classes.workPanel} h="100%">
        <Text size="lg" fw={600} c="white">
          {t('controlTitle')}
        </Text>
        <Text size="xs" className={classes.workSubtitle} mt={4} mb="lg">
          {t('controlSubtitle')}
        </Text>

        <Stack gap="xs">
          {[
            {
              icon: IconShieldCheck,
              color: pendingCount > 0 ? 'orange' : 'gray',
              label: t('ctrlPendingChanges'),
              value: pendingError ? '—' : pendingLoading ? '…' : String(pendingCount),
              onClick: () => navigate(routes.pendingChanges.main),
            },
            {
              icon: IconFileInvoice,
              color: draftCount > 0 ? 'primary' : 'gray',
              label: t('ctrlDraftInvoices'),
              value: draftError ? '—' : draftLoading ? '…' : String(draftCount),
              onClick: () => navigate(routes.sales.main),
            },
          ].map((row) => (
            <Group
              component={UnstyledButton}
              w="100%"
              key={row.label}
              justify="space-between"
              wrap="nowrap"
              p={8}
              className={`${classes.workRow} ${classes.workRowInteractive}`}
              onClick={row.onClick}
            >
              <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                <Box
                  w={30}
                  h={30}
                  bg="transparent"
                  c="white"
                  style={{
                    borderRadius: 8,
                    display: 'grid',
                    placeItems: 'center',
                    flexShrink: 0,
                  }}
                >
                  <row.icon size={16} />
                </Box>
                <Text size="xs" fw={600} c="white" truncate>
                  {row.label}
                </Text>
              </Group>
              <Badge variant="white" color="primary" size="sm" radius="sm">
                {row.value}
              </Badge>
            </Group>
          ))}

          <Group w="100%" justify="space-between" wrap="nowrap" p={8} className={classes.workRow}>
            <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
              <Box
                w={30}
                h={30}
                bg="transparent"
                c="white"
                style={{
                  borderRadius: 8,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                }}
              >
                <IconCalendarStats size={16} />
              </Box>
              <Text size="xs" fw={600} c="white" truncate>
                {t('ctrlActivePeriod')}
              </Text>
            </Group>
            <Badge variant="white" color="primary" size="sm" radius="sm">
              {activePeriodName ?? t('periodOpenValue')}
            </Badge>
          </Group>

          <Text size="xs" className={classes.workSubtitle} mt="md">
            {t('quickActionsLabel')}
          </Text>
          <Box className={classes.workActions}>
            {[
              {
                label: t('qaGeneralJournal'),
                icon: IconNotebook,
                tone: 'primary',
                onClick: () => navigate(routes.journalEntries.add),
              },
              {
                label: t('qaReceiveMoney'),
                icon: IconCoin,
                tone: 'primary',
                onClick: () => navigate(routes.bankCash.addReceive),
              },
              {
                label: t('qaSendMoney'),
                icon: IconWallet,
                tone: 'primary',
                onClick: () => navigate(routes.bankCash.addSent),
              },
              {
                label: t('qaTransferCash'),
                icon: IconBuildingBank,
                tone: 'primary',
                onClick: () => navigate(routes.bankCash.addTransfer),
              },
            ].map((action) => (
              <Button
                key={action.label}
                variant="subtle"
                className={classes.workAction}
                size="xs"
                justify="flex-start"
                leftSection={<action.icon size={16} />}
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </Box>
        </Stack>
      </Box>
    </Grid.Col>
  );
}
