import { Badge } from '@mantine/core';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface BadgeStatusProps {
  reconciled: boolean;
}

const BadgeStatusReconciled = ({ reconciled }: BadgeStatusProps) => {
  const { t } = useTranslation('bankStatements');
  return reconciled ? (
    <Badge variant="light" color="green" style={{ '--badge-fz': '10px' }}>
      {t('status.reconciled')}
    </Badge>
  ) : (
    <Badge
      variant="light"
      bg={themeColors.gray[0]}
      c={themeColors.black[9]}
      fw={400}
      fz={10}
      style={{ textTransform: 'capitalize' }}
    >
      {t('status.unreconciled')}
    </Badge>
  );
};

export default BadgeStatusReconciled;
