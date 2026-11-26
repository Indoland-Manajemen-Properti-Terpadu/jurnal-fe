import { Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconRoute } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { opnameStages, type StageKey } from '@/module/inventory/domain/opnameStages';
import { OPNAME_STEPS, type StockOpname } from '@/module/inventory/domain/stockOpname';
import { SectionCard } from '@/module/inventory/presentation/components/shared/SectionCard';
import classes from '@/module/inventory/presentation/components/stockTake/OpnameStages.module.css';
import { dateFormatV1 } from '@/utils/formatDate';

type StageState = 'done' | 'current' | 'todo';

/** The four stages of a count, top to bottom, each saying what it means and when it happened. */
export function OpnameStages({ opname }: Readonly<{ opname: StockOpname }>) {
  const { t } = useTranslation('stockTake');
  const { done: at, details, cancelled } = opnameStages(opname);

  return (
    <SectionCard icon={IconRoute} title={t('steps.title')} subtitle={t('steps.subtitle')} fill>
      <ol className={classes.list}>
        {OPNAME_STEPS.map((step, index) => {
          let state: StageState = 'todo';
          if (index < at) state = 'done';
          else if (index === at) state = 'current';
          const { at: time, by } =
            state !== 'todo' ? details[step as StageKey] : { at: null, by: null };
          return (
            <li key={step} className={classes.item} data-state={state}>
              <ThemeIcon
                size={30}
                radius="xl"
                variant={state === 'done' ? 'filled' : state === 'current' ? 'light' : 'white'}
                color={state === 'todo' ? 'gray' : 'primary'}
                bd={
                  state === 'todo'
                    ? '1px solid var(--mantine-color-gray-4)'
                    : state === 'current'
                      ? '1px solid var(--mantine-color-primary-3)'
                      : undefined
                }
              >
                {state === 'done' ? (
                  <IconCheck size={16} stroke={2.5} />
                ) : (
                  <Text fz="xs" fw={600} component="span">
                    {index + 1}
                  </Text>
                )}
              </ThemeIcon>
              <div className={classes.body}>
                <Text fz="sm" fw={600} c={state === 'todo' ? 'dimmed' : 'dark.9'} lh={1.35}>
                  {t(`steps.${step}`)}
                </Text>
                <Text fz="xs" c="dimmed">
                  {t(`steps.hint.${step}`)}
                </Text>
                {time && (
                  <Text fz="xs" c="primary.7" fw={500} mt={2}>
                    {dateFormatV1(time, 'D MMM YYYY, HH:mm')}
                    {by ? ` · ${t('steps.by', { name: by })}` : ''}
                  </Text>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {cancelled?.at && (
        <Text fz="xs" c="dimmed" fw={500} mt="sm">
          {cancelled.by ? t('steps.cancelledBy', { name: cancelled.by }) : t('steps.cancelled')}
          {` · ${dateFormatV1(cancelled.at, 'D MMM YYYY, HH:mm')}`}
        </Text>
      )}
    </SectionCard>
  );
}
