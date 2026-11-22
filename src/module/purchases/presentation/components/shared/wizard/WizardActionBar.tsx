import type { ReactNode } from 'react';
import { Button, Group } from '@mantine/core';
import { IconArrowLeft, IconArrowRight } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface Action {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

interface WizardActionBarProps {
  isFirst: boolean;
  isLast: boolean;
  busy: boolean;
  cancelLabel?: string;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  /** Lanjut waits until the step has what it needs. */
  nextDisabled?: boolean;
  /** On the last step: a lighter button next to the main one (save as draft). */
  secondary?: Action;
  /** The filled button of the last step. */
  finish?: Action;
}

/** Batal on the left; Kembali, the optional draft button and Lanjut or the finish button on the right. */
export const WizardActionBar = ({
  isFirst,
  isLast,
  busy,
  cancelLabel,
  onCancel,
  onBack,
  onNext,
  nextDisabled,
  secondary,
  finish,
}: Readonly<WizardActionBarProps>) => {
  const { t } = useTranslation('purchases');
  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      <Button variant="default" onClick={onCancel} disabled={busy}>
        {cancelLabel ?? t('common.cancel')}
      </Button>
      <Group gap="sm" wrap="wrap">
        {!isFirst && (
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
            disabled={busy}
          >
            {t('wizard.back')}
          </Button>
        )}
        {isLast && secondary && (
          <Button
            variant="light"
            leftSection={secondary.icon}
            onClick={secondary.onClick}
            loading={secondary.loading}
            disabled={secondary.disabled || (busy && !secondary.loading)}
          >
            {secondary.label}
          </Button>
        )}
        {isLast && finish ? (
          <Button
            leftSection={finish.icon}
            onClick={finish.onClick}
            loading={finish.loading}
            disabled={finish.disabled || (busy && !finish.loading)}
          >
            {finish.label}
          </Button>
        ) : (
          !isLast && (
            <Button
              rightSection={<IconArrowRight size={16} />}
              onClick={onNext}
              disabled={busy || nextDisabled}
            >
              {t('wizard.next')}
            </Button>
          )
        )}
      </Group>
    </Group>
  );
};
