import { Stepper } from '@mantine/core';
import { useTranslation } from '@/i18n';
import {
  connectionStep,
  type ConnectionStatus,
} from '@/module/bank-connection/domain/connectionStatus';

/** The four steps of a request; nothing is shown once the request is over (rejected, revoked, cancelled). */
export function ConnectionStepper({ status }: Readonly<{ status: ConnectionStatus }>) {
  const { t } = useTranslation('bankConnection');
  const step = connectionStep(status);
  if (step === null) return null;
  // Once active, the last step is complete too.
  const active = status === 'ACTIVE' ? 4 : step - 1;

  return (
    <Stepper active={active} allowNextStepsSelect={false} size="sm" aria-label={t('steps.label')}>
      <Stepper.Step label={t('steps.fill')} />
      <Stepper.Step label={t('steps.review')} />
      <Stepper.Step label={t('steps.sign')} />
      <Stepper.Step label={t('steps.active')} />
    </Stepper>
  );
}
