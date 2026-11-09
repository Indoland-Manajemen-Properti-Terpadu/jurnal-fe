import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

/** Tells the person that a screen shows sample figures, so it is never mistaken for their books. */
export function PrototypeNotice() {
  const { t } = useTranslation('plannedModules');

  return (
    <Alert
      color="yellow"
      variant="light"
      radius="md"
      icon={<IconInfoCircle size={18} />}
      title={t('prototype.title')}
    >
      {t('prototype.body')}
    </Alert>
  );
}
