import { Paper } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { SettingsLayout } from '@/module/settings';
import HistoryList from '@/module/user-management/presentation/components/HistoryList';

/** Settings > Users & Access > Access History: who changed which user or role, and when. */
export default function AccessHistoryPage() {
  const { t } = useTranslation('settings');

  return (
    <SettingsLayout title={t('item.accessHistory')} description={t('description.accessHistory')}>
      <Paper withBorder radius="lg" p="md" bg="white">
        <HistoryList />
      </Paper>
    </SettingsLayout>
  );
}
