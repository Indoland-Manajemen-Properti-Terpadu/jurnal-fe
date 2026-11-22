import { Anchor, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconMinus, IconRoute } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/i18n';
import type { JourneyKind, JourneyStepData } from '@/module/purchases/domain/documentChain';
import { SectionCard } from '@/module/purchases/presentation/components/shared/SectionCard';
import { StatusBadge } from '@/module/purchases/presentation/components/shared/StatusBadge';
import classes from '@/module/purchases/presentation/components/shared/Journey.module.css';

export type JourneyStep = JourneyStepData;

/** The letters in the circle of a step that is not a number: the advance and the voucher. */
const SHORT: Partial<Record<JourneyKind, string>> = { advance: 'DP', voucher: 'PV' };

/**
 * The purchase flow of one document, as in the reference web: numbered circles on a line (a check
 * once done, a dash when skipped), each step with its documents as links and the one on screen
 * marked "Dokumen ini".
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
                  {SHORT[step.kind] && step.state !== 'todo' ? SHORT[step.kind] : index + 1}
                </Text>
              )}
            </ThemeIcon>
            <div className={classes.body}>
              <Text
                fz="md"
                fw={600}
                lh={1.35}
                c={step.state === 'done' || step.state === 'next' ? 'dark.9' : 'dimmed'}
              >
                {t(`journey.${step.kind}`)}
              </Text>
              {step.documents.length > 0 ? (
                step.documents.map((doc) => (
                  <div key={doc.id} className={classes.doc}>
                    <Anchor component={Link} to={doc.to} fz="sm" fw={700}>
                      {doc.number}
                    </Anchor>
                    {doc.current && (
                      <Text fz="xs" c="primary.7" fw={600}>
                        {t('journey.thisDocument')}
                      </Text>
                    )}
                    {(step.kind === 'advance' || step.documents.length > 1) && (
                      <StatusBadge status={doc.status} />
                    )}
                  </div>
                ))
              ) : (
                <Text fz="sm" c="dimmed">
                  {t(
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
