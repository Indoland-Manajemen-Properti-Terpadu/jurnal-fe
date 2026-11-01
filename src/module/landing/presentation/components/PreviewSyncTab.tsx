import { Badge, Button, Group, Text } from '@mantine/core';
import { IconCheck, IconLayersLinked } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

interface PreviewSyncTabProps {
  isSynced: boolean;
  onToggleSync: () => void;
}

const SYNC_EVENTS = [
  { id: 'salePayment', type: 'SALE_PAYMENT', color: 'blue', amount: 'Rp 78.500.000' },
  { id: 'penalty', type: 'FINE / PENALTY', color: 'orange', amount: 'Rp 4.250.000' },
  { id: 'deposit', type: 'DEPOSIT_ESCROW', color: 'teal', amount: 'Rp 120.000.000' },
] as const;

export function PreviewSyncTab({ isSynced, onToggleSync }: PreviewSyncTabProps) {
  const { t } = useTranslation('landing');

  return (
    <div className={classes.previewBody}>
      <div style={{ marginBottom: 16 }}>
        <Group justify="space-between" align="center">
          <div>
            <Text fw={800} fz="md" c="dark.8">
              {t('preview.sync.title')}
            </Text>
            <Text fz="xs" c="dimmed">
              {t('preview.sync.subtitle')}
            </Text>
          </div>
          <Button
            size="xs"
            color={isSynced ? 'teal' : 'primary'}
            leftSection={isSynced ? <IconCheck size={14} /> : <IconLayersLinked size={14} />}
            onClick={onToggleSync}
          >
            {isSynced ? t('preview.sync.syncedAll') : t('preview.sync.approveAll')}
          </Button>
        </Group>
      </div>

      <div className={classes.syncQueueHeader}>
        <Text fw={700} fz="xs" c="dimmed">
          {t('preview.sync.columns.eventType')}
        </Text>
        <Text fw={700} fz="xs" c="dimmed">
          {t('preview.sync.columns.reference')}
        </Text>
        <Text fw={700} fz="xs" c="dimmed">
          {t('preview.sync.columns.accountMapping')}
        </Text>
        <Text fw={700} fz="xs" c="dimmed" ta="right">
          {t('preview.sync.columns.amount')}
        </Text>
        <Text fw={700} fz="xs" c="dimmed" ta="center">
          {t('preview.sync.columns.status')}
        </Text>
      </div>

      {SYNC_EVENTS.map((event) => (
        <div key={event.id} className={classes.syncQueueItem}>
          <Badge color={event.color} variant="light" size="sm">
            {event.type}
          </Badge>
          <div>
            <Text fw={700} fz="xs">
              {t(`preview.sync.items.${event.id}.title`)}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t(`preview.sync.items.${event.id}.subtitle`)}
            </Text>
          </div>
          <div>
            <Text fz="var(--jurnal-text-xs)" fw={600}>
              {t(`preview.sync.items.${event.id}.debit`)}
            </Text>
            <Text fz="var(--jurnal-text-xs)" c="dimmed">
              {t(`preview.sync.items.${event.id}.credit`)}
            </Text>
          </div>
          <Text fw={750} fz="xs" ta="right">
            {event.amount}
          </Text>
          <div style={{ textAlign: 'center' }}>
            <span className={isSynced ? classes.syncStatusApproved : classes.syncStatusPending}>
              {isSynced ? t('preview.sync.statusSynced') : t('preview.sync.statusPending')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
