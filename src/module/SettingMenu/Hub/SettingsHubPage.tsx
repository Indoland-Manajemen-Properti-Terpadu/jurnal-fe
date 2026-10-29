import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Badge,
  Box,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from '@mantine/core';
import { IconArrowUpRight, IconSearch } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import SettingsLayout from '../components/SettingsLayout';
import { settingsGroups } from '../settingsNavigation';
import { useSettingsOverview, OverviewStatus } from './useSettingsOverview';
import classes from './SettingsHubPage.module.css';

export default function SettingsHubPage() {
  const navigate = useNavigate();
  const { t } = useTranslation('settings');
  const [search, setSearch] = useState('');
  const overview = useSettingsOverview();
  const label = (value: OverviewStatus, readyKey: string) => {
    if (value.state === 'loading') return t('status.loading');
    if (value.state === 'error') return t('status.loadError');
    return t(readyKey, { count: value.count });
  };
  const mappingLabel = () => {
    if (overview.mappings.state !== 'ready')
      return label(overview.mappings, 'status.mappingMissing');
    if (overview.mappingTotal === 0) return t('status.noMappings');
    if (overview.mappings.count === 0) return t('status.mappingComplete');
    return t('status.mappingMissing', { count: overview.mappings.count });
  };
  const status = {
    general: label(overview.precision, 'status.precision'),
    accountMapping: mappingLabel(),
    numberFormats: label(overview.activeFormats, 'status.activeFormats'),
    taxes: label(overview.taxRates, 'status.taxCount'),
  };

  const groups = useMemo(
    () =>
      settingsGroups
        .map((group) => ({
          ...group,
          items: group.items.filter((item) => {
            const query = search.trim().toLocaleLowerCase();
            return (
              !query ||
              `${t(`item.${item.key}`)} ${t(`description.${item.key}`)}`
                .toLocaleLowerCase()
                .includes(query)
            );
          }),
        }))
        .filter((group) => group.items.length > 0),
    [search, t]
  );

  return (
    <SettingsLayout title={t('hubTitle')} description={t('hubDescription')}>
      <Stack gap="lg">
        <Paper withBorder radius="lg" p={{ base: 'md', sm: 'xl' }} className={classes.intro}>
          <Text fz="xs" fw={700} tt="uppercase" lts="0.08em" c="primary.7">
            {t('configurationOverview')}
          </Text>
          <Text fz={{ base: 22, sm: 28 }} fw={750} lh={1.2} mt={8}>
            {t('overviewTitle')}
          </Text>
          <Text c="dimmed" maw={650} mt="xs">
            {t('overviewDescription')}
          </Text>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mt="xl">
            <div>
              <Text className={classes.summaryLabel}>{t('item.general')}</Text>
              <Text fw={700}>{status.general}</Text>
            </div>
            <div>
              <Text className={classes.summaryLabel}>{t('item.accountMapping')}</Text>
              <Text fw={700}>{status.accountMapping}</Text>
            </div>
            <div>
              <Text className={classes.summaryLabel}>{t('item.numberFormats')}</Text>
              <Text fw={700}>{status.numberFormats}</Text>
            </div>
          </SimpleGrid>
        </Paper>

        <TextInput
          aria-label={t('searchSettings')}
          placeholder={t('searchSettings')}
          leftSection={<IconSearch size={17} />}
          value={search}
          onChange={(event) => setSearch(event.currentTarget.value)}
        />

        {groups.length ? (
          groups.map((group) => (
            <section key={group.key} aria-label={t(`group.${group.key}`)}>
              <Text fw={700} fz="sm" mb="sm">
                {t(`group.${group.key}`)}
              </Text>
              <Paper withBorder radius="lg" className={classes.list}>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const { path } = item;
                  const itemStatus =
                    item.key in status
                      ? status[item.key as keyof typeof status]
                      : path
                        ? t('status.manage')
                        : t('notAvailable');
                  return path ? (
                    <UnstyledButton
                      key={item.key}
                      className={classes.row}
                      onClick={() => navigate(path)}
                    >
                      <Box className={classes.icon}>
                        <Icon size={20} stroke={1.7} />
                      </Box>
                      <Box className={classes.rowCopy}>
                        <Text fw={650} fz="sm">
                          {t(`item.${item.key}`)}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {t(`description.${item.key}`)}
                        </Text>
                      </Box>
                      <Badge
                        variant="light"
                        color={
                          item.key === 'accountMapping' &&
                          overview.mappings.state === 'ready' &&
                          overview.mappings.count > 0
                            ? 'orange'
                            : 'gray'
                        }
                        className={classes.badge}
                      >
                        {itemStatus}
                      </Badge>
                      <IconArrowUpRight size={17} className={classes.arrow} />
                    </UnstyledButton>
                  ) : (
                    <div key={item.key} className={classes.row} aria-disabled="true">
                      <Box className={classes.icon}>
                        <Icon size={20} stroke={1.7} />
                      </Box>
                      <Box className={classes.rowCopy}>
                        <Text fw={650} fz="sm">
                          {t(`item.${item.key}`)}
                        </Text>
                        <Text fz="xs" c="dimmed">
                          {t(`description.${item.key}`)}
                        </Text>
                      </Box>
                      <Badge variant="light" color="gray" className={classes.badge}>
                        {itemStatus}
                      </Badge>
                    </div>
                  );
                })}
              </Paper>
            </section>
          ))
        ) : (
          <Paper withBorder radius="lg" p="xl">
            <Text fw={700}>{t('noSearchResults')}</Text>
            <Text c="dimmed" fz="sm">
              {t('tryAnotherSearch')}
            </Text>
          </Paper>
        )}
      </Stack>
    </SettingsLayout>
  );
}
