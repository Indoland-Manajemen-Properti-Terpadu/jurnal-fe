import { useState } from 'react';
import { Button, Grid, Group, Paper, Stack, Stepper, Tooltip } from '@mantine/core';
import { IconArrowLeft, IconArrowRight, IconDeviceFloppy } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  QUOTE_STEPS,
  canSaveQuote,
  type QuoteFormValues,
  type QuoteStepId,
} from '@/module/sales/domain/saleQuoteForm';
import { useQuoteForm } from '../../hooks/useQuoteForm';
import { useCreateQuote, useUpdateQuote } from '../../hooks/useQuoteMutations';
import { SaleTotalsPanel } from '../form/SaleTotalsPanel';
import { QuoteStepExtras } from './QuoteStepExtras';
import { QuoteStepGeneral } from './QuoteStepGeneral';
import { QuoteStepLines } from './QuoteStepLines';

interface QuoteFormBodyProps {
  /** Present when editing a draft. */
  quoteId?: string;
  initial?: QuoteFormValues;
}

const detailPath = (id: string) => routes.sales.quotationDetail.replace(':id', id);

export function QuoteFormBody({ quoteId, initial }: Readonly<QuoteFormBodyProps>) {
  const { t } = useTranslation('salesQuotes');
  const navigate = useNavigate();
  const api = useQuoteForm(initial);
  const { form } = api;
  const [step, setStep] = useState<QuoteStepId>('general');
  const createMutation = useCreateQuote();
  const updateMutation = useUpdateQuote(quoteId ?? '');
  const busy = createMutation.isPending || updateMutation.isPending;

  const index = QUOTE_STEPS.indexOf(step);
  const isFirst = index === 0;
  const isLast = index === QUOTE_STEPS.length - 1;

  const goNext = () => {
    if (api.checkStep(step)) setStep(QUOTE_STEPS[index + 1] ?? step);
  };

  const save = async () => {
    if (busy) return;
    const failing = QUOTE_STEPS.find((id) => !api.checkStep(id));
    if (failing) {
      setStep(failing);
      return;
    }
    try {
      const saved = quoteId
        ? await updateMutation.mutateAsync(form.values)
        : await createMutation.mutateAsync(form.values);
      navigate(detailPath(saved.id));
    } catch {
      // The mutation hooks already told the user what went wrong; the form keeps its values.
    }
  };

  const ready = canSaveQuote(form.values);

  return (
    <Stack gap="lg">
      <Paper withBorder radius="md" p="md" bg="white">
        <Stepper
          active={index}
          onStepClick={(i) => setStep(QUOTE_STEPS[i])}
          allowNextStepsSelect={false}
          size="sm"
          color="primary"
        >
          {QUOTE_STEPS.map((id) => (
            <Stepper.Step
              key={id}
              label={t(`form.steps.${id}`)}
              description={t(`form.steps.${id}Desc`)}
            />
          ))}
        </Stepper>
      </Paper>

      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: isLast ? 8 : 12 }}>
          <Stack gap="lg">
            {step === 'general' && <QuoteStepGeneral api={api} />}
            {step === 'lines' && <QuoteStepLines api={api} />}
            {step === 'lines' && (
              <Group justify="flex-end">
                <div style={{ width: '100%', maxWidth: 420 }}>
                  <SaleTotalsPanel
                    totals={api.totals}
                    isPriceIncludeTax={form.values.isPriceIncludeTax}
                    showWithholding={false}
                  />
                </div>
              </Group>
            )}
            {isLast && <QuoteStepExtras api={api} />}
          </Stack>
        </Grid.Col>
        {isLast && (
          <Grid.Col span={{ base: 12, lg: 4 }}>
            <div style={{ position: 'sticky', top: 20 }}>
              <SaleTotalsPanel
                totals={api.totals}
                isPriceIncludeTax={form.values.isPriceIncludeTax}
                showWithholding={false}
              />
            </div>
          </Grid.Col>
        )}
      </Grid>

      <Paper withBorder radius="md" p="md" bg="white">
        <Group justify="space-between" wrap="wrap" gap="sm">
          {isFirst ? (
            <Button
              variant="default"
              disabled={busy}
              onClick={() => navigate(quoteId ? detailPath(quoteId) : routes.sales.quotations)}
            >
              {t('form.actions.cancel')}
            </Button>
          ) : (
            <Button
              variant="default"
              leftSection={<IconArrowLeft size={16} />}
              disabled={busy}
              onClick={() => setStep(QUOTE_STEPS[index - 1])}
            >
              {t('form.actions.back')}
            </Button>
          )}
          {isLast ? (
            <Tooltip label={t('form.actions.saveHint')} disabled={ready} withArrow>
              <span>
                <Button
                  color="primary"
                  leftSection={<IconDeviceFloppy size={16} />}
                  loading={busy}
                  disabled={!ready}
                  onClick={save}
                >
                  {quoteId ? t('form.actions.saveChanges') : t('form.actions.save')}
                </Button>
              </span>
            </Tooltip>
          ) : (
            <Button
              color="primary"
              rightSection={<IconArrowRight size={16} />}
              disabled={busy}
              onClick={goNext}
            >
              {t('form.actions.next')}
            </Button>
          )}
        </Group>
      </Paper>
    </Stack>
  );
}
