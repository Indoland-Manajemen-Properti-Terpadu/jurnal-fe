import { Paper, Text } from '@mantine/core';
import { IconEdit, IconPlugConnected, IconSearch, IconSignature } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from '@/module/bank-connection/presentation/components/ConnectionProcess.module.css';

const STEPS = [
  { key: 'fill', icon: IconEdit },
  { key: 'review', icon: IconSearch },
  { key: 'sign', icon: IconSignature },
  { key: 'active', icon: IconPlugConnected },
] as const;

/** What happens after "Hubungkan": four steps as one connected process, vertical on a narrow screen. */
export function ConnectionProcess() {
  const { t } = useTranslation('bankConnection');

  return (
    <Paper withBorder radius="md" p="xl" bg="white">
      <Text fw={600} ta="center" mb="xl">
        {t('chooser.stepsTitle')}
      </Text>
      <ol className={classes.steps}>
        {STEPS.map(({ key, icon: Icon }) => (
          <li key={key} className={classes.step}>
            <span className={classes.icon} aria-hidden="true">
              <Icon size={20} />
            </span>
            <div className={classes.body}>
              <Text fz="sm" fw={600}>
                {t(`chooser.steps.${key}.title`)}
              </Text>
              <Text fz={12} c="dimmed">
                {t(`chooser.steps.${key}.body`)}
              </Text>
            </div>
          </li>
        ))}
      </ol>
    </Paper>
  );
}
