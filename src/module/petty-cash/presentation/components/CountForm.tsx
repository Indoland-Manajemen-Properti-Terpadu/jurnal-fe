import { useRef, useState } from 'react';
import { Alert, Grid, Select, Stack, Text, Textarea } from '@mantine/core';
import { IconBuildingBank, IconCoins, IconUsers } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  countedGrandTotal,
  countedTotal,
  emptyCountDraft,
  nonCashTotal,
  expectedCashEstimate,
  toCountInput,
  validateCountDraft,
  variancePreview,
  type CountDraft,
} from '@/module/petty-cash/domain/cashCount';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import { activePockets } from '@/module/petty-cash/domain/pettyCashView';
import { CountPocketFields } from '@/module/petty-cash/presentation/components/CountPocketFields';
import { CountSummary } from '@/module/petty-cash/presentation/components/CountSummary';
import { DenominationCalculator } from '@/module/petty-cash/presentation/components/DenominationCalculator';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { SectionCard } from '@/module/petty-cash/presentation/components/SectionCard';
import { useCreateCount } from '@/module/petty-cash/presentation/hooks/useCountMutations';
import { usePettyCashAccess } from '@/module/petty-cash/presentation/hooks/usePettyCashAccess';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

/** Count the cash in the box and compare it with the books; the backend sets the official variance. */
export function CountForm({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const access = usePettyCashAccess();
  const lookups = usePettyCashLookups();
  const create = useCreateCount(fund.id);
  const formRef = useRef<HTMLDivElement>(null);
  const nonCashPockets = activePockets(fund.pockets).filter((pocket) => pocket.type !== 'CASH');
  const pocketCodes = nonCashPockets.map((pocket) => pocket.code);
  const [draft, setDraft] = useState<CountDraft>(() => emptyCountDraft(pocketCodes));
  const [showIssues, setShowIssues] = useState(false);

  const counted = countedTotal(draft);
  const total = countedGrandTotal(draft);
  const expected = expectedCashEstimate({
    pagu: fund.pagu,
    pendingVoucherAmount: fund.balance.pendingVoucherAmount,
    outstandingAdvanceAmount: fund.balance.outstandingAdvanceAmount,
  });
  const variance = variancePreview(total, expected);
  const issues = validateCountDraft(draft, {
    witnessRequired: fund.settings.requireWitness,
    varianceNonZero: variance.type !== 'BALANCED',
    nonCashPockets: pocketCodes,
  });

  // The witness must be neither the custodian nor the counter (the signed-in user).
  const witnesses = (lookups.data?.users ?? [])
    .filter((user) => user.id !== access.userId && user.id !== fund.custodian.id)
    .map((user) => ({ value: user.id, label: user.name }));

  const errorFor = (path: string) => {
    const issue = showIssues ? issues.find((item) => item.path === path) : undefined;
    return issue ? t(`countForm.issues.${issue.code}`) : undefined;
  };

  const focusFirstInvalid = () =>
    window.setTimeout(
      () =>
        (
          formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]') ??
          formRef.current?.querySelector<HTMLElement>('table input')
        )?.focus(),
      0
    );

  const save = async (submit: boolean) => {
    setShowIssues(true);
    if (issues.length > 0) {
      focusFirstInvalid();
      return;
    }
    try {
      await create.mutateAsync({ input: toCountInput(draft, pocketCodes), submit });
      navigate(`${routes.pettyCash.main}?fund=${fund.id}&tab=counts`);
    } catch {
      // the hook already told the user what went wrong
    }
  };
  const cancel = () => navigate(`${routes.pettyCash.main}?fund=${fund.id}&tab=counts`);

  return (
    <div ref={formRef}>
      {lookups.isError && (
        <QueryErrorState
          title={t('form.lookupsFailed')}
          error={lookups.error}
          onRetry={() => lookups.refetch()}
        />
      )}
      <Grid gutter="lg" align="flex-start" mt={lookups.isError ? 'md' : 0}>
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <SectionCard
              icon={<IconCoins size={18} />}
              title={t('countForm.calcTitle')}
              subtitle={t('countForm.calcSubtitle')}
            >
              <DenominationCalculator draft={draft} errorFor={errorFor} onChange={setDraft} />
              {errorFor('notes') && (
                <Text size="sm" c="red.7" mt="sm" role="alert">
                  {errorFor('notes')}
                </Text>
              )}
            </SectionCard>

            {nonCashPockets.length > 0 && (
              <SectionCard
                icon={<IconBuildingBank size={18} />}
                title={t('countForm.pocketsTitle')}
                subtitle={t('countForm.pocketsSubtitle')}
              >
                <CountPocketFields
                  pockets={nonCashPockets}
                  draft={draft}
                  errorFor={errorFor}
                  onChange={setDraft}
                />
              </SectionCard>
            )}

            <SectionCard
              icon={<IconUsers size={18} />}
              title={t('countForm.peopleTitle')}
              subtitle={t('countForm.peopleSubtitle')}
            >
              <Stack gap="sm">
                <Select
                  label={t('countForm.witness')}
                  placeholder={t('countForm.witnessPlaceholder')}
                  data={witnesses}
                  value={draft.witnessId}
                  onChange={(witnessId) => setDraft({ ...draft, witnessId })}
                  error={errorFor('witnessId')}
                  searchable
                  clearable
                  required={fund.settings.requireWitness}
                />
                {lookups.data && witnesses.length === 0 && (
                  <Alert variant="light" color="orange" radius="md">
                    {t('countForm.witnessNone')}
                  </Alert>
                )}
                <Textarea
                  label={t('countForm.reason')}
                  description={t('countForm.reasonHint')}
                  placeholder={t('countForm.reasonPlaceholder')}
                  value={draft.reason}
                  onChange={(event) => setDraft({ ...draft, reason: event.currentTarget.value })}
                  error={errorFor('reason')}
                  minRows={2}
                  autosize
                  required={variance.type !== 'BALANCED'}
                />
              </Stack>
            </SectionCard>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <div style={{ position: 'sticky', top: 20 }}>
            <CountSummary
              counted={counted}
              nonCash={nonCashPockets.length > 0 ? nonCashTotal(draft) : undefined}
              totalCounted={total}
              expected={expected}
              variance={variance}
              pending={create.isPending}
              showIssues={showIssues && issues.length > 0}
              onCancel={cancel}
              onSaveDraft={() => save(false)}
              onSubmit={() => save(true)}
            />
          </div>
        </Grid.Col>
      </Grid>
    </div>
  );
}
