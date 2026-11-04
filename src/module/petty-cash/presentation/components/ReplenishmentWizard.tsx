import { useEffect, useRef, useState } from 'react';
import { Button, Grid, Select, Stack, Stepper, Textarea } from '@mantine/core';
import { IconArrowRight, IconBuildingBank, IconSend } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { todayWib } from '@/module/petty-cash/domain/wibDate';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { formatCurrency } from '@/utils/formatCurrency';
import type { PettyCashFund } from '@/module/petty-cash/domain/pettyCashEntities';
import {
  latestApprovedCount,
  reconcileDraft,
  selectedTotal,
  toPreviewInput,
  toReplenishmentInput,
  validateReplenishmentDraft,
  type ReplenishmentDraft,
} from '@/module/petty-cash/domain/replenishment';
import { FormSummaryCard } from '@/module/petty-cash/presentation/components/FormSummaryCard';
import {
  JournalDisclosure,
  PayoutSummary,
} from '@/module/petty-cash/presentation/components/JournalPreview';
import { PocketSelect } from '@/module/petty-cash/presentation/components/PocketSelect';
import { QueryErrorState } from '@/module/petty-cash/presentation/components/QueryErrorState';
import { ReplenishmentVoucherStep } from '@/module/petty-cash/presentation/components/ReplenishmentVoucherStep';
import { SectionCard } from '@/module/petty-cash/presentation/components/SectionCard';
import { useCounts } from '@/module/petty-cash/presentation/hooks/useCountQueries';
import {
  usePettyCashLookups,
  usePettyCashVouchers,
} from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';
import { useCreateReplenishment } from '@/module/petty-cash/presentation/hooks/useReplenishmentMutations';
import { useReplenishmentPreview } from '@/module/petty-cash/presentation/hooks/useReplenishmentQueries';

const money = (amount: number) => formatCurrency(amount, false);

/**
 * Request a replenishment in two steps: choose the vouchers (and the approved count that settles
 * with them), then the source account with a preview of what will be paid and posted.
 */
export function ReplenishmentWizard({ fund }: Readonly<{ fund: PettyCashFund }>) {
  const { t } = useTranslation('pettyCash');
  const navigate = useNavigate();
  const today = todayWib();
  const lookups = usePettyCashLookups();
  const vouchers = usePettyCashVouchers({
    fundId: fund.id,
    status: ['PENDING_REIMBURSE'],
    limit: 100,
    sortBy: 'date:asc',
  });
  const counts = useCounts({ fundId: fund.id, status: ['APPROVED'], limit: 20 });
  const create = useCreateReplenishment(fund.id);

  const [step, setStep] = useState(0);
  const [showIssues, setShowIssues] = useState(false);
  const [draft, setDraft] = useState<ReplenishmentDraft>({
    voucherIds: [],
    bankAccountId: null,
    countId: null,
    notes: '',
  });

  // Start from everything waiting, and from the newest approved count, each once, as they load.
  const vouchersPreselected = useRef(false);
  const countPreselected = useRef(false);
  useEffect(() => {
    if (vouchersPreselected.current || !vouchers.data) return;
    vouchersPreselected.current = true;
    setDraft((current) => ({ ...current, voucherIds: vouchers.data.items.map((v) => v.id) }));
  }, [vouchers.data]);
  useEffect(() => {
    if (countPreselected.current || !counts.data) return;
    countPreselected.current = true;
    setDraft((current) => ({
      ...current,
      countId: latestApprovedCount(counts.data.items)?.id ?? null,
    }));
  }, [counts.data]);

  // The lists can change while the wizard is open (a voucher voided, a newer count approved), so
  // only ids that are still on offer count; a stale id would fail the request without being seen.
  const effective = reconcileDraft(draft, {
    voucherIds: (vouchers.data?.items ?? []).map((voucher) => voucher.id),
    countIds: (counts.data?.items ?? []).map((count) => count.id),
  });

  const countRequired = fund.settings.requireCountBeforeReimbursement;
  const issues = validateReplenishmentDraft(effective, { countRequired });
  const stepOneIssues = issues.filter((issue) => issue.path !== 'bankAccountId');
  const input = issues.length === 0 ? toReplenishmentInput(fund.id, effective) : null;
  const preview = useReplenishmentPreview(
    step === 1 && input ? toPreviewInput(input) : null,
    today
  );

  const issueText = (path: string) => {
    const issue = showIssues ? issues.find((item) => item.path === path) : undefined;
    return issue ? t(`replenishForm.issues.${issue.code}`) : undefined;
  };

  const backToList = () => navigate(`${routes.pettyCash.main}?fund=${fund.id}&tab=replenishments`);

  const next = () => {
    setShowIssues(true);
    if (stepOneIssues.length === 0) {
      setShowIssues(false);
      setStep(1);
    }
  };

  const submit = async () => {
    setShowIssues(true);
    if (!input) return;
    try {
      await create.mutateAsync(input);
      backToList();
    } catch {
      // the hook already told the user what went wrong
    }
  };

  const items = vouchers.data?.items ?? [];
  const bankOptions = (lookups.data?.bankAccounts ?? []).map((account) => ({
    value: account.id,
    label: `${account.accountNumber} · ${account.name}`,
  }));
  const readyToSubmit = Boolean(preview.data && preview.data.isBalanced && !preview.isFetching);

  const reviewActions = (
    <>
      <Button
        leftSection={<IconSend size={16} />}
        loading={create.isPending}
        disabled={!readyToSubmit}
        onClick={submit}
        fullWidth
      >
        {t('replenishForm.submit')}
      </Button>
      <Button variant="default" disabled={create.isPending} onClick={() => setStep(0)} fullWidth>
        {t('replenishForm.back')}
      </Button>
    </>
  );

  return (
    <Stack gap="lg">
      <Stepper active={step} size="sm" allowNextStepsSelect={false}>
        <Stepper.Step label={t('replenishForm.stepVouchers')} />
        <Stepper.Step label={t('replenishForm.stepReview')} />
      </Stepper>

      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          {step === 0 && (
            <ReplenishmentVoucherStep
              vouchers={vouchers.data?.items}
              loading={vouchers.isLoading || counts.isLoading}
              error={vouchers.error}
              onRetry={() => vouchers.refetch()}
              countsError={counts.error}
              onRetryCounts={() => counts.refetch()}
              hiddenVouchers={Math.max((vouchers.data?.totalResults ?? 0) - items.length, 0)}
              selectedIds={effective.voucherIds}
              onSelect={(voucherIds) => setDraft({ ...draft, voucherIds })}
              counts={counts.data?.items ?? []}
              countId={effective.countId}
              countRequired={countRequired}
              countError={issueText('countId')}
              onCountChange={(countId) => setDraft({ ...draft, countId })}
              voucherError={issueText('voucherIds')}
            />
          )}
          {step === 1 && (
            <SectionCard
              icon={<IconBuildingBank size={18} />}
              title={t('replenishForm.bankTitle')}
              subtitle={t('replenishForm.bankSubtitle')}
            >
              <Stack gap="sm">
                {lookups.isError && (
                  <QueryErrorState
                    title={t('form.lookupsFailed')}
                    error={lookups.error}
                    onRetry={() => lookups.refetch()}
                  />
                )}
                <Select
                  label={t('replenishForm.bank')}
                  placeholder={t('replenishForm.bankPlaceholder')}
                  data={bankOptions}
                  value={draft.bankAccountId}
                  onChange={(bankAccountId) => setDraft({ ...draft, bankAccountId })}
                  searchable
                  required
                />
                <PocketSelect
                  pockets={fund.pockets}
                  value={draft.pocket ?? ''}
                  onChange={(pocket) => setDraft({ ...draft, pocket })}
                  label={t('pocketAdmin.receivedIn')}
                  description={t('pocketAdmin.receivedInHint')}
                  showBalance={false}
                />
                <Textarea
                  label={t('replenishForm.notes')}
                  placeholder={t('replenishForm.notesPlaceholder')}
                  value={draft.notes}
                  onChange={(event) => setDraft({ ...draft, notes: event.currentTarget.value })}
                  minRows={2}
                  autosize
                />
              </Stack>
            </SectionCard>
          )}
          {step === 1 && preview.data && (
            <div style={{ marginTop: 'var(--mantine-spacing-lg)' }}>
              <JournalDisclosure preview={preview.data} />
            </div>
          )}
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <div style={{ position: 'sticky', top: 20 }}>
            {step === 0 && (
              <FormSummaryCard
                title={t('replenishForm.summaryTitle')}
                rows={[
                  {
                    label: t('replenishForm.vouchersChosen'),
                    value: String(effective.voucherIds.length),
                  },
                  {
                    label: t('replenishForm.selectedVoucherTotal'),
                    value: money(selectedTotal(items, effective.voucherIds)),
                    total: true,
                  },
                ]}
                notes={[t('replenishForm.payoutNextStep')]}
              >
                <Button rightSection={<IconArrowRight size={16} />} onClick={next} fullWidth>
                  {t('replenishForm.next')}
                </Button>
                <Button variant="subtle" color="gray" onClick={backToList} fullWidth>
                  {t('replenishForm.cancel')}
                </Button>
              </FormSummaryCard>
            )}
            {step === 1 && (
              <Stack gap="md">
                {preview.isError && (
                  <QueryErrorState
                    title={t('replenishForm.previewFailed')}
                    error={preview.error}
                    onRetry={() => preview.refetch()}
                  />
                )}
                {preview.data ? (
                  <PayoutSummary preview={preview.data}>{reviewActions}</PayoutSummary>
                ) : (
                  <FormSummaryCard
                    title={t('replenishForm.previewTitle')}
                    rows={[]}
                    notes={input ? [] : [t('replenishForm.previewHint')]}
                  >
                    {reviewActions}
                  </FormSummaryCard>
                )}
              </Stack>
            )}
          </div>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
