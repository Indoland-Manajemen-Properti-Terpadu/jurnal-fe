import { Alert, Paper, Stack, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import SettingsLayout from '../../components/SettingsLayout';

export default function CompanySettingPage() {
  const { t } = useTranslation('settings');
  return (
    <SettingsLayout title={t('companyTitle')} description={t('description.company')}>
      <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="md">
          <Text fw={700} fz="lg">
            {t('companyNoContractTitle')}
          </Text>
          <Text c="dimmed" maw={650}>
            {t('companyNoContractDescription')}
          </Text>
          <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
            {t('companyNoContractNote')}
          </Alert>
        </Stack>
      </Paper>
    </SettingsLayout>
  );
}
