import { Button, Group, Paper, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy, IconSend } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { SaleStepId } from '@/module/sales/domain/saleForm';

interface FormActionBarProps {
  step: SaleStepId;
  isEdit: boolean;
  canSaveDraft: boolean;
  canSend: boolean;
  /** Which save is running; both buttons wait while one is. */
  pending: 'draft' | 'send' | null;
  onBack: () => void;
  onNext: () => void;
  onCancel: () => void;
  onSaveDraft: () => void;
  onSaveSend: () => void;
}

/** Back and next on the left; saving on the right. Only one filled button is ever shown. */
export function FormActionBar({
  step,
  isEdit,
  canSaveDraft,
  canSend,
  pending,
  onBack,
  onNext,
  onCancel,
  onSaveDraft,
  onSaveSend,
}: Readonly<FormActionBarProps>) {
  const { t } = useTranslation('sales');
  const isFirst = step === 'general';
  const isLast = step === 'extras';
  const busy = pending !== null;

  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Group justify="space-between" wrap="wrap" gap="sm">
        <Group gap="sm">
          {isFirst ? (
            <Button variant="default" onClick={onCancel} disabled={busy}>
              {t('form.actions.cancel')}
            </Button>
          ) : (
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              onClick={onBack}
              disabled={busy}
            >
              {t('form.actions.back')}
            </Button>
          )}
        </Group>
        <Group gap="sm">
          <Tooltip label={t('form.actions.saveDraftHint')} disabled={canSaveDraft} withArrow>
            <span>
              <Button
                variant="default"
                leftSection={<IconDeviceFloppy size={16} />}
                onClick={onSaveDraft}
                loading={pending === 'draft'}
                disabled={!canSaveDraft || (busy && pending !== 'draft')}
              >
                {isEdit ? t('form.actions.saveChanges') : t('form.actions.saveDraft')}
              </Button>
            </span>
          </Tooltip>
          {isLast ? (
            <Tooltip label={t('form.actions.saveSendHint')} disabled={canSend} withArrow>
              <span>
                <Button
                  color="primary"
                  leftSection={<IconSend size={16} />}
                  onClick={onSaveSend}
                  loading={pending === 'send'}
                  disabled={!canSend || (busy && pending !== 'send')}
                >
                  {t('form.actions.saveSend')}
                </Button>
              </span>
            </Tooltip>
          ) : (
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
    </Paper>
  );
}
