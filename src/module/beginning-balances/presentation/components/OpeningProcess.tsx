import { Paper, Text } from '@mantine/core';
import {
  IconCalendarEvent,
  IconChecks,
  IconRosetteDiscountCheck,
  IconTableOptions,
} from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './OpeningProcess.module.css';

const STEPS = [
  { key: 'date', icon: IconCalendarEvent },
  { key: 'fill', icon: IconTableOptions },
  { key: 'check', icon: IconChecks },
  { key: 'publish', icon: IconRosetteDiscountCheck },
] as const;

/** The four steps from picking the cut-off day to publishing, connected; vertical on a phone. */
export function OpeningProcess() {
  const { t } = useTranslation('beginningBalances');

  return (
    <Paper withBorder radius="md" p="xl" bg="white">
      <Text fw={600} ta="center" mb="xl">
        {t('intro.processTitle')}
      </Text>
      <ol className={classes.steps}>
        {STEPS.map(({ key, icon: Icon }, index) => (
          <li key={key} className={classes.step}>
            <span className={classes.icon} aria-hidden="true">
              <Icon size={20} />
              <span className={classes.number}>{index + 1}</span>
            </span>
            <div className={classes.body}>
              <Text fz="sm" fw={600}>
                {t(`intro.process.${key}.title`)}
              </Text>
              <Text fz={12} c="dimmed">
                {t(`intro.process.${key}.body`)}
              </Text>
            </div>
          </li>
        ))}
      </ol>
    </Paper>
  );
}
