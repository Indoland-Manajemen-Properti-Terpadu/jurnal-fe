import { Badge, Text } from '@mantine/core';
import { ArrowCircleDown, ArrowCircleUp } from '@phosphor-icons/react';
import { themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface DirectionBadgeProps {
  /** True for money received (green, "Diterima"), false for money sent (red, "Dikirim"). */
  received: boolean;
  capitalize?: boolean;
}

const DirectionBadge: React.FC<DirectionBadgeProps> = ({ received, capitalize = false }) => {
  const { t } = useTranslation('reconciliation');
  return (
    <Badge
      variant="light"
      color={received ? 'green' : 'red'}
      leftSection={received ? <ArrowCircleDown size={14} /> : <ArrowCircleUp size={14} />}
      style={capitalize ? { textTransform: 'capitalize' } : undefined}
    >
      <Text size="xs" fw={700} c={received ? themeColors.green[8] : themeColors.red[8]}>
        {received ? t('direction.received') : t('direction.sent')}
      </Text>
    </Badge>
  );
};

export default DirectionBadge;
