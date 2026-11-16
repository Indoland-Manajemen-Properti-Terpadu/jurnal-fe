import { Alert } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

/** Shown when the account named in the link cannot take a plain transaction (for example petty cash). */
export function PrefillBlockedNotice() {
  const { t } = useTranslation('bankCash');
  return (
    <Alert
      icon={<IconInfoCircle size={16} />}
      title={t('block.prefillTitle')}
      color="orange"
      radius="md"
    >
      {t('block.prefillNotice')}
    </Alert>
  );
}
