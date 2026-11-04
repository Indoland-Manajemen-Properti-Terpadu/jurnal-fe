import { Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

/** "Diterima" or "Dikirim" as a plain caption; the amount next to it already says how much. */
const DirectionText: React.FC<{ received: boolean }> = ({ received }) => {
  const { t } = useTranslation('reconciliation');
  return (
    <Text fz="var(--jurnal-text-xs)" c="dimmed">
      {received ? t('direction.received') : t('direction.sent')}
    </Text>
  );
};

export default DirectionText;
