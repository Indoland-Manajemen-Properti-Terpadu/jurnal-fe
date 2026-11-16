import { Alert } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

/** Shown when the accounts a form offers could not be loaded, so an empty select is not left unexplained. */
export function ChoicesLoadError() {
  const { t } = useTranslation('bankCash');
  return (
    <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
      {t('main.loadError')}
    </Alert>
  );
}
