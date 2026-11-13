import { Text } from '@mantine/core';
import { IconBook2, IconBuildingBank, IconNotes, IconReportAnalytics } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './PeriodSteps.module.css';

const STEPS = [
  { key: 'step1', icon: IconNotes },
  { key: 'step2', icon: IconBuildingBank },
  { key: 'step3', icon: IconReportAnalytics },
  { key: 'step4', icon: IconBook2 },
] as const;

/** The suggested order before a period end, as four connected steps; vertical on a narrow screen. */
export function PeriodSteps() {
  const { t } = useTranslation('periodClosing');

  return (
    <ol className={classes.steps}>
      {STEPS.map(({ key, icon: Icon }, index) => (
        <li key={key} className={classes.step}>
          <span className={classes.icon} aria-hidden="true">
            <Icon size={20} />
            <span className={classes.number}>{index + 1}</span>
          </span>
          <div className={classes.body}>
            <Text fz="sm" fw={600}>
              {t(`guide.${key}`)}
            </Text>
            <Text fz={12} c="dimmed">
              {t(`guide.${key}Body`)}
            </Text>
          </div>
        </li>
      ))}
    </ol>
  );
}
