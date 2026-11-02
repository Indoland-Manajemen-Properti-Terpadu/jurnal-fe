import { ActionIcon, Box, Button, Group, Title, Tooltip } from '@mantine/core';
import { IconNotebook, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import classes from './dashboard.module.css';

interface DashboardHeroProps {
  greeting: string;
  userName: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onCreateJournal: () => void;
}

export function DashboardHero({
  greeting,
  userName,
  isRefreshing,
  onRefresh,
  onCreateJournal,
}: Readonly<DashboardHeroProps>) {
  const { t } = useTranslation('dashboard');

  return (
    <Box component="section" className={classes.heroHeader}>
      <Title order={1} m={0} lh={1.2} className={classes.heroTitle}>
        {greeting}, {userName}
      </Title>
      <Group gap="xs" className={classes.heroActions}>
        <Tooltip label={t('btnRefresh')}>
          <ActionIcon
            size={40}
            variant="default"
            radius="md"
            loading={isRefreshing}
            aria-label={t('btnRefresh')}
            onClick={onRefresh}
          >
            <IconRefresh size={18} />
          </ActionIcon>
        </Tooltip>
        <Button h={40} leftSection={<IconNotebook size={18} />} onClick={onCreateJournal}>
          {t('btnCreateJournal')}
        </Button>
      </Group>
    </Box>
  );
}
