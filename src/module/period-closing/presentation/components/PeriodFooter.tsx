import { ReactNode } from 'react';
import { Button, Container, Group } from '@mantine/core';
import { gradientColors, themeColors } from '@/theme';
import { useTranslation } from '@/i18n';

interface PeriodFooterProps {
  onBack: () => void;
  onNext: () => void;
  nextLabel: ReactNode;
}

const PeriodFooter = ({ onBack, onNext, nextLabel }: PeriodFooterProps) => {
  const { t } = useTranslation('periodClosing');

  return (
    <Container fluid px="lg">
      <Group grow>
        <Group justify="flex-end" gap="xs" mt="md">
          <Button variant="light" color={themeColors.gray[7]} onClick={onBack}>
            {t('common.back')}
          </Button>
          <Button variant="gradient" gradient={gradientColors.gradient} onClick={onNext}>
            {nextLabel}
          </Button>
        </Group>
      </Group>
    </Container>
  );
};

export default PeriodFooter;
