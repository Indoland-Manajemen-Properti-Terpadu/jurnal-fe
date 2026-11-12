import { Box, Button, Grid, Paper, Stack, Stepper } from '@mantine/core';
import { IconArrowLeft, IconBook2 } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { ClosingActionBar } from '@/module/period-closing/presentation/components/closing/ClosingActionBar';
import { ClosingAside } from '@/module/period-closing/presentation/components/closing/ClosingAside';
import { ClosingDone } from '@/module/period-closing/presentation/components/closing/ClosingDone';
import { ClosingPeriodStep } from '@/module/period-closing/presentation/components/closing/ClosingPeriodStep';
import { ClosingReadinessStep } from '@/module/period-closing/presentation/components/closing/ClosingReadinessStep';
import { ClosingReviewStep } from '@/module/period-closing/presentation/components/closing/ClosingReviewStep';
import { ClosingWorksheetStep } from '@/module/period-closing/presentation/components/closing/ClosingWorksheetStep';
import { PeriodNoAccess } from '@/module/period-closing/presentation/components/PeriodStates';
import { usePeriodAccess } from '@/module/period-closing/presentation/hooks/usePeriodAccess';
import {
  CLOSING_STEPS,
  useCloseBooksWizard,
  type CloseBooksWizard,
} from '@/module/period-closing/presentation/hooks/useCloseBooksWizard';

function ClosingWizard({
  wizard,
  onCancel,
}: Readonly<{ wizard: CloseBooksWizard; onCancel: () => void }>) {
  const { t } = useTranslation('periodClosing');
  const active = CLOSING_STEPS.indexOf(wizard.step);
  const wide = wizard.step === 'worksheet';

  return (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="md" bg="white">
        <Stepper
          active={active}
          onStepClick={(index) => wizard.goTo(CLOSING_STEPS[index])}
          allowNextStepsSelect={false}
          size="sm"
          color="primary"
          aria-label={t('wizard.stepperAria')}
        >
          {CLOSING_STEPS.map((id) => (
            <Stepper.Step
              key={id}
              label={t(`wizard.steps.${id}`)}
              description={t(`wizard.steps.${id}Desc`)}
            />
          ))}
        </Stepper>
      </Paper>

      {/* The worksheet is a wide table, so it takes the full width; the other steps keep the aside. */}
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: wide ? 12 : 8 }}>
          {wizard.step === 'period' && <ClosingPeriodStep wizard={wizard} />}
          {wizard.step === 'readiness' && <ClosingReadinessStep wizard={wizard} />}
          {wizard.step === 'worksheet' && <ClosingWorksheetStep wizard={wizard} />}
          {wizard.step === 'review' && <ClosingReviewStep wizard={wizard} />}
        </Grid.Col>
        {!wide && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <Box pos="sticky" top={20}>
              <ClosingAside />
            </Box>
          </Grid.Col>
        )}
      </Grid>

      <ClosingActionBar wizard={wizard} onCancel={onCancel} />
    </Stack>
  );
}

/** Close the books in four steps: period, readiness, worksheet, review. */
export function CloseBooksPage() {
  const { t } = useTranslation('periodClosing');
  const navigate = useNavigate();
  const access = usePeriodAccess();
  const wizard = useCloseBooksWizard();
  const back = () => navigate(routes.periodClosing.main);
  const forbidden = access.isReady && !access.canCreate;

  return (
    <Box p={{ base: 'md', sm: 'xl' }}>
      <Stack gap="lg">
        <ModuleHeader
          icon={IconBook2}
          title={t('wizard.title')}
          description={t('wizard.description')}
          actions={
            <Button
              variant="default"
              radius="md"
              leftSection={<IconArrowLeft size={16} />}
              onClick={back}
            >
              {t('page.back')}
            </Button>
          }
        />
        {forbidden && <PeriodNoAccess />}
        {!forbidden && wizard.result && <ClosingDone period={wizard.result} />}
        {!forbidden && !wizard.result && <ClosingWizard wizard={wizard} onCancel={back} />}
      </Stack>
    </Box>
  );
}

export default CloseBooksPage;
