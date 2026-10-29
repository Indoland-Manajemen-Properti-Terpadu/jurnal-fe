import { Button, Group, Text, ThemeIcon } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '../pages/LandingPage.module.css';

const BALANCE_AMOUNT = 'Rp 3.450.210.000';

export function PreviewBankReconciliationTab() {
  const { t } = useTranslation('landing');

  return (
    <div className={classes.previewBody}>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 16,
          marginBottom: 20,
        }}
      >
        <div style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 14 }}>
          <Text fz={11} fw={700} c="dimmed">
            {t('preview.bankReconciliation.bankBalanceLabel')}
          </Text>
          <Text fz={20} fw={800} mt={4}>
            {BALANCE_AMOUNT}
          </Text>
          <Text fz={11} c="teal" mt={4}>
            {t('preview.bankReconciliation.bankBalanceNote')}
          </Text>
        </div>
        <div style={{ border: '1px solid var(--lp-line)', borderRadius: 10, padding: 14 }}>
          <Text fz={11} fw={700} c="dimmed">
            {t('preview.bankReconciliation.glBalanceLabel')}
          </Text>
          <Text fz={20} fw={800} mt={4}>
            {BALANCE_AMOUNT}
          </Text>
          <Text fz={11} c="teal" mt={4}>
            {t('preview.bankReconciliation.glBalanceNote')}
          </Text>
        </div>
        <div
          style={{
            border: '1px solid rgb(5 150 105 / 30%)',
            background: '#ecfdf5',
            borderRadius: 10,
            padding: 14,
          }}
        >
          <Text fz={11} fw={700} c="teal">
            {t('preview.bankReconciliation.statusLabel')}
          </Text>
          <Text fz={20} fw={800} c="teal" mt={4}>
            {t('preview.bankReconciliation.statusValue')}
          </Text>
          <Text fz={11} c="teal" mt={4}>
            {t('preview.bankReconciliation.statusNote')}
          </Text>
        </div>
      </div>

      <div
        style={{
          border: '1px solid var(--lp-line)',
          borderRadius: 10,
          padding: 16,
          background: '#f8fafc',
        }}
      >
        <Group justify="space-between" align="center">
          <Group gap="xs">
            <ThemeIcon size="md" color="teal" radius="xl" variant="light">
              <IconCheck size={16} />
            </ThemeIcon>
            <div>
              <Text fw={750} fz="xs">
                {t('preview.bankReconciliation.algorithmTitle')}
              </Text>
              <Text fz={11} c="dimmed">
                {t('preview.bankReconciliation.algorithmDesc')}
              </Text>
            </div>
          </Group>
          <Button size="xs" variant="outline" color="blue">
            {t('preview.bankReconciliation.printReport')}
          </Button>
        </Group>
      </div>
    </div>
  );
}
