import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from '@/i18n';
import type { AccountingPeriod } from '@/module/period-closing/domain/accountingPeriod';
import { buildClosingPreview } from '@/module/period-closing/domain/closingPreview';
import {
  NO_CONFIRMATIONS,
  isReadyToReview,
  retainedEarningsStatus,
  trialBalanceStatus,
  type ManualCheck,
  type ManualConfirmations,
} from '@/module/period-closing/domain/closingReadiness';
import {
  findOverlap,
  gapAfterLatestClosing,
  isCalendarDay,
  latestActiveClosing,
  suggestClosingRange,
  validatePeriodValues,
  type DateRange,
  type PeriodFormErrors,
} from '@/module/period-closing/domain/periodRules';
import { cashBankAccounts } from '@/module/period-closing/infrastructure/closingSourcesApi';
import { useAccountMappings } from '@/module/settings';
import { suggestPeriodName, todayDay } from '@/module/period-closing/presentation/periodFormat';
import { useActivePeriods, useClosingTrialBalance, useCreatePeriod } from './usePeriodQueries';

export const CLOSING_STEPS = ['period', 'readiness', 'worksheet', 'review'] as const;
export type ClosingStep = (typeof CLOSING_STEPS)[number];

const RETAINED_EARNINGS_KEY = 'retained_earnings';

/** State and checks of the four closing steps; the page only renders them. */
export const useCloseBooksWizard = () => {
  const { t, currentLanguage } = useTranslation('periodClosing');
  const today = todayDay();
  const closings = useActivePeriods('CLOSE');
  const latestClosing: AccountingPeriod | undefined = latestActiveClosing(
    closings.data?.items ?? []
  );

  const [step, setStep] = useState<ClosingStep>('period');
  const [range, setRangeState] = useState<DateRange>({ startDate: '', endDate: '' });
  const [name, setName] = useState('');
  const [nameEdited, setNameEdited] = useState(false);
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<PeriodFormErrors>({});
  const [confirmations, setConfirmations] = useState<ManualConfirmations>(NO_CONFIRMATIONS);
  const [acknowledged, setAcknowledged] = useState(false);
  const [result, setResult] = useState<AccountingPeriod | null>(null);
  const [prefilled, setPrefilled] = useState(false);

  const suggest = (next: DateRange) => suggestPeriodName('CLOSE', next, currentLanguage, t);

  // Fill the range once the earlier closings are known: it continues where the last one ended.
  useEffect(() => {
    if (prefilled || closings.isLoading) return;
    const suggested = suggestClosingRange(latestClosing, today);
    setRangeState(suggested);
    setName(suggest(suggested));
    setPrefilled(true);
  }, [closings.isLoading, prefilled]);

  const setRange = (next: DateRange) => {
    setRangeState(next);
    if (!nameEdited) setName(suggest(next));
    setErrors((current) => ({ ...current, startDate: undefined, endDate: undefined }));
    // Earlier answers were about another range.
    setConfirmations(NO_CONFIRMATIONS);
    setAcknowledged(false);
  };

  const rangeValid =
    isCalendarDay(range.startDate) &&
    isCalendarDay(range.endDate) &&
    range.endDate >= range.startDate;
  const overlap = rangeValid ? findOverlap(range, 'CLOSE', closings.data?.items ?? []) : undefined;
  const gapDays = rangeValid ? gapAfterLatestClosing(range.startDate, latestClosing) : 0;

  const pastFirstStep = step !== 'period';
  const trialBalance = useClosingTrialBalance(pastFirstStep && rangeValid ? range : null);
  const mappings = useAccountMappings();

  const retainedEarnings = useMemo(
    () =>
      Object.values(mappings.data ?? {})
        .flatMap((items) => items ?? [])
        .find((item) => item.key === RETAINED_EARNINGS_KEY)?.account ?? null,
    [mappings.data]
  );

  const readiness = {
    retainedEarnings: retainedEarningsStatus(mappings.isLoading, retainedEarnings),
    trialBalance: trialBalance.isError
      ? ('warn' as const)
      : trialBalanceStatus(trialBalance.isLoading, trialBalance.data?.totals.closing),
    confirmations,
  };

  const preview = useMemo(
    () => buildClosingPreview(trialBalance.data?.accounts ?? []),
    [trialBalance.data]
  );

  const create = useCreatePeriod();

  const checkPeriodStep = (): boolean => {
    const found = validatePeriodValues({ name, ...range });
    setErrors(found);
    return Object.keys(found).length === 0 && !overlap;
  };

  const canLeave: Record<ClosingStep, boolean> = {
    period: !closings.isLoading,
    readiness: isReadyToReview(readiness),
    worksheet: trialBalance.isSuccess,
    review: acknowledged && readiness.retainedEarnings === 'pass',
  };

  const goNext = () => {
    if (step === 'period' && !checkPeriodStep()) return;
    if (!canLeave[step]) return;
    const index = CLOSING_STEPS.indexOf(step);
    setStep(CLOSING_STEPS[Math.min(index + 1, CLOSING_STEPS.length - 1)]);
  };

  const goBack = () => setStep(CLOSING_STEPS[Math.max(CLOSING_STEPS.indexOf(step) - 1, 0)]);

  const goTo = (target: ClosingStep) => {
    if (CLOSING_STEPS.indexOf(target) < CLOSING_STEPS.indexOf(step)) setStep(target);
  };

  const submit = () => {
    if (!canLeave.review || create.isPending) return;
    create.mutate(
      { name, type: 'CLOSE', notes, ...range },
      { onSuccess: (period) => setResult(period) }
    );
  };

  return {
    today,
    step,
    goNext,
    goBack,
    goTo,
    canContinue: canLeave[step],
    loadingClosings: closings.isLoading,
    latestClosing,
    range,
    setRange,
    name,
    setName: (value: string) => {
      setName(value);
      setNameEdited(true);
      setErrors((current) => ({ ...current, name: undefined }));
    },
    notes,
    setNotes,
    errors,
    overlap,
    gapDays,
    rangeValid,
    trialBalance,
    cashBankAccounts: cashBankAccounts(trialBalance.data),
    retainedEarnings,
    readiness,
    toggleConfirmation: (check: ManualCheck, value: boolean) =>
      setConfirmations((current) => ({ ...current, [check]: value })),
    preview,
    acknowledged,
    setAcknowledged,
    submit,
    submitting: create.isPending,
    result,
  };
};

export type CloseBooksWizard = ReturnType<typeof useCloseBooksWizard>;
