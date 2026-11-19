import type { ReactNode } from 'react';
import { Button, Group, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface Action {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  /** Why the button is off; shown on hover while it is disabled. */
  hint?: string;
  icon?: ReactNode;
}

interface WizardActionBarProps {
  isFirst: boolean;
  isLast: boolean;
  /** Anything is saving: every button waits. */
  busy: boolean;
  cancelLabel: string;
  onCancel: () => void;
  onBack: () => void;
  onNext: () => void;
  /** Saves as a draft; on the last step with no `finish` it becomes the filled button. */
  draft: Action;
  /** The filled button of the last step when saving is not the end (issue, send). */
  finish?: Action;
}

const labelled = (action: Action, button: ReactNode) => (
  <Tooltip label={action.hint} disabled={!action.disabled || !action.hint} withArrow>
    <span>{button}</span>
  </Tooltip>
);

/**
 * Batal (or the previous step) on the left; save as draft, next and finish on the right. The
 * same buttons in the same order on every step of every sales form.
 */
export function WizardActionBar({
  isFirst,
  isLast,
  busy,
  cancelLabel,
  onCancel,
  onBack,
  onNext,
  draft,
  finish,
}: Readonly<WizardActionBarProps>) {
  const { t } = useTranslation('sales');
  const draftIsFinal = isLast && !finish;
  const draftButton = (
    <Button
      variant={draftIsFinal ? 'filled' : 'light'}
      color="primary"
      leftSection={draft.icon ?? <IconDeviceFloppy size={16} />}
      onClick={draft.onClick}
      loading={draft.loading}
      disabled={draft.disabled || (busy && !draft.loading)}
    >
      {draft.label}
    </Button>
  );

  return (
    <Group justify="space-between" wrap="wrap" gap="sm">
      <Button variant="default" onClick={onCancel} disabled={busy}>
        {cancelLabel}
      </Button>
      <Group gap="sm" wrap="wrap">
        {!isFirst && (
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={onBack}
            disabled={busy}
          >
            {t('form.actions.back')}
          </Button>
        )}
        {labelled(draft, draftButton)}
        {isLast && finish
          ? labelled(
              finish,
              <Button
                color="primary"
                leftSection={finish.icon}
                onClick={finish.onClick}
                loading={finish.loading}
                disabled={finish.disabled || (busy && !finish.loading)}
              >
                {finish.label}
              </Button>
            )
          : !isLast && (
              <Button
                color="primary"
                rightSection={<IconArrowRight size={16} />}
                onClick={onNext}
                disabled={busy}
              >
                {t('form.actions.next')}
              </Button>
            )}
      </Group>
    </Group>
  );
}
