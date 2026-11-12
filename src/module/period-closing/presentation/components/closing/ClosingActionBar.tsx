import { Button, Group, Paper, Text } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconBook2 } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { CloseBooksWizard } from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';

interface ClosingActionBarProps {
  wizard: CloseBooksWizard;
  onCancel: () => void;
}

/** Back on the left; continue, or the one closing action on the last step, on the right. */
export function ClosingActionBar({ wizard, onCancel }: Readonly<ClosingActionBarProps>) {
  const { t } = useTranslation('periodClosing');
  const { step, canContinue, submitting } = wizard;
  const isFirst = step === 'period';
  const isLast = step === 'review';

  const hint = () => {
    if (canContinue) return null;
    if (step === 'readiness') {
      return wizard.readiness.retainedEarnings === 'fail'
        ? t('wizard.readiness.blockedHint')
        : t('wizard.readiness.pendingHint');
    }
    if (isLast) return t('wizard.submitHint');
    return null;
  };

  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group justify="space-between" wrap="wrap" gap="sm">
        {isFirst ? (
          <Button variant="default" radius="md" onClick={onCancel}>
            {t('wizard.cancel')}
          </Button>
        ) : (
          <Button
            variant="default"
            radius="md"
            leftSection={<IconArrowLeft size={16} />}
            onClick={wizard.goBack}
            disabled={submitting}
          >
            {t('wizard.back')}
          </Button>
        )}
        <Group gap="sm" wrap="wrap" justify="flex-end">
          {hint() && (
            <Text size="xs" c="dimmed">
              {hint()}
            </Text>
          )}
          {isLast ? (
            <Button
              color="primary"
              radius="md"
              leftSection={<IconBook2 size={16} />}
              onClick={wizard.submit}
              disabled={!canContinue}
              loading={submitting}
            >
              {t('wizard.submit')}
            </Button>
          ) : (
            <Button
              color="primary"
              radius="md"
              rightSection={<IconArrowRight size={16} />}
              onClick={wizard.goNext}
              disabled={!canContinue}
            >
              {t('wizard.next')}
            </Button>
          )}
        </Group>
      </Group>
    </Paper>
  );
}
