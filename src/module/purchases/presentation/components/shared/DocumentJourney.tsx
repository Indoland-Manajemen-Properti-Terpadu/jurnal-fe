import { useState } from 'react';
import { Anchor, Text, ThemeIcon, UnstyledButton } from '@mantine/core';
import {
  IconCheck,
  IconChevronDown,
  IconChevronUp,
  IconMinus,
  IconRoute,
} from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import {
  isClosedStatus,
  type JourneyKind,
  type JourneyStepData,
} from '@/module/purchases/domain/documentChain';
import { statusTone, type StatusTone } from '@/module/purchases/domain/purchaseStatus';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import classes from '@/module/purchases/presentation/components/shared/Journey.module.css';

export type JourneyStep = JourneyStepData;
type JourneyDoc = JourneyStep['documents'][number];

/** The letters in the circle of a step that is not a number: the advance and the voucher. */
const SHORT: Partial<Record<JourneyKind, string>> = { advance: 'DP', voucher: 'PV' };

const DOT: Record<StatusTone, string> = {
  neutral: 'var(--mantine-color-gray-5)',
  info: 'var(--mantine-color-blue-6)',
  warning: 'var(--mantine-color-orange-6)',
  success: 'var(--mantine-color-green-6)',
  danger: 'var(--mantine-color-red-6)',
  cyan: 'var(--mantine-color-cyan-6)',
  slate: 'var(--mantine-color-slate-6)',
  purple: 'var(--mantine-color-purple-6)',
};

/** One document of a step: its number on the left, its status as a dot and a word on the right. */
const DocRow = ({ doc }: Readonly<{ doc: JourneyDoc }>) => {
  const { t, currentLanguage } = useTranslation('purchases');
  const closed = isClosedStatus(doc.status);
  const paymentRequestLabel =
    doc.statusContext === 'paymentRequest' && doc.status === 'APPROVED'
      ? t('paymentRequests.statusLabels.APPROVED')
      : doc.statusContext === 'paymentRequest' && doc.status === 'PROCESSED'
        ? t('paymentRequests.statusLabels.PROCESSED')
        : undefined;
  const label =
    paymentRequestLabel ??
    (currentLanguage === 'id' && doc.statusLabel ? doc.statusLabel : t(`status.${doc.status}`));
  return (
    <div
      className={classes.doc}
      data-current={doc.current || undefined}
      data-closed={closed || undefined}
    >
      <Anchor component={Link} to={doc.to} fz="sm" fw={600} c={closed ? 'dimmed' : undefined}>
        {doc.number}
      </Anchor>
      <span className={classes.status}>
        <span className={classes.dot} style={{ background: DOT[statusTone(doc.status, label)] }} />
        <Text span fz="xs" c="dimmed">
          {doc.current ? `${t('journey.thisDocument')} · ` : ''}
          {label}
        </Text>
      </span>
    </div>
  );
};

/** The documents of a step; cancelled ones fold away unless one of them is the one on screen. */
const StepDocuments = ({ documents }: Readonly<{ documents: JourneyDoc[] }>) => {
  const { t } = useTranslation('purchases');
  const [open, setOpen] = useState(false);
  const shown = documents.filter((doc) => !isClosedStatus(doc.status) || doc.current);
  const folded = documents.filter((doc) => isClosedStatus(doc.status) && !doc.current);

  return (
    <div className={classes.docs}>
      {shown.map((doc) => (
        <DocRow key={doc.id} doc={doc} />
      ))}
      {open && folded.map((doc) => <DocRow key={doc.id} doc={doc} />)}
      {folded.length > 0 && (
        <UnstyledButton className={classes.fold} onClick={() => setOpen((value) => !value)}>
          {open ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          <Text span fz="xs" fw={500}>
            {open
              ? t('journey.hideCancelled')
              : t('journey.showCancelled', { count: folded.length })}
          </Text>
        </UnstyledButton>
      )}
    </div>
  );
};

/**
 * The purchase flow of one document: numbered circles on a line (a check once done, a dash when
 * skipped). Each step lists its documents as quiet rows, the one on screen highlighted, and the
 * cancelled ones folded away so what still counts stands out.
 */
export const DocumentJourney = ({ steps }: Readonly<{ steps: JourneyStep[] }>) => {
  const { t } = useTranslation('purchases');

  return (
    <SectionCard icon={IconRoute} title={t('journey.title')} subtitle={t('journey.subtitle')}>
      <ol className={classes.list}>
        {steps.map((step, index) => (
          <li key={step.kind} className={classes.item} data-done={step.state === 'done'}>
            <ThemeIcon
              size={30}
              radius="xl"
              className={classes.marker}
              variant={step.state === 'done' ? 'filled' : step.state === 'next' ? 'light' : 'white'}
              color={step.state === 'todo' || step.state === 'skipped' ? 'gray' : 'primary'}
              bd={
                step.state === 'todo' || step.state === 'skipped'
                  ? '1px solid var(--mantine-color-gray-4)'
                  : step.state === 'next'
                    ? '1px solid var(--mantine-color-primary-3)'
                    : undefined
              }
            >
              {step.state === 'done' ? (
                <IconCheck size={16} stroke={2.5} />
              ) : step.state === 'skipped' ? (
                <IconMinus size={14} />
              ) : (
                <Text fz="xs" fw={600} component="span">
                  {SHORT[step.kind] ?? index + 1}
                </Text>
              )}
            </ThemeIcon>
            <div className={classes.body}>
              <div className={classes.head}>
                <Text
                  fz="md"
                  fw={600}
                  lh={1.35}
                  c={step.state === 'done' || step.state === 'next' ? 'dark.9' : 'dimmed'}
                >
                  {step.label === 'reorder'
                    ? t('orders.reorder.approval')
                    : t(`journey.${step.kind}`)}
                </Text>
                {step.documents.length > 1 && (
                  <Text fz="xs" c="dimmed">
                    {t('journey.docCount', { count: step.documents.length })}
                  </Text>
                )}
              </div>
              {step.documents.length > 0 ? (
                <StepDocuments documents={step.documents} />
              ) : (
                <Text fz="sm" c="dimmed">
                  {step.note && step.state !== 'skipped'
                    ? step.note
                    : t(
                        step.state === 'skipped'
                          ? `journey.skipped.${step.kind}`
                          : step.state === 'done'
                            ? `journey.done.${step.kind}`
                            : `journey.empty.${step.kind}`
                      )}
                </Text>
              )}
            </div>
          </li>
        ))}
      </ol>
    </SectionCard>
  );
};
