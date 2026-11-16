import {
  Anchor,
  Box,
  Button,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowRight, IconCalendar, IconCheck, IconScale } from '@tabler/icons-react';
import { Link } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { dateFormatV1 } from '@/utils/formatDate';
import type { ConversionWindow } from '../../domain/openingBalanceRules';
import { OpeningIllustration, type OpeningIllustrationName } from './OpeningIllustration';
import { OpeningProcess } from './OpeningProcess';

interface OpeningIntroProps {
  window: ConversionWindow;
  lastClosingEnd: string | undefined;
  selectedDate: string | null;
  /** Why the chosen day cannot be used, already worded; null when it can. */
  dateError: string | null;
  onDateChange: (date: string | null) => void;
  onStart: () => void;
}

const POINTS = ['balanced', 'draft', 'history'] as const;
const PREPARE: Array<{ key: string; art: OpeningIllustrationName }> = [
  { key: 'bank', art: 'bank' },
  { key: 'invoices', art: 'invoices' },
  { key: 'stock', art: 'stock' },
  { key: 'equity', art: 'equity' },
];

/** The first visit: what an opening balance is, what to prepare, and the day to start from. */
export function OpeningIntro({
  window,
  lastClosingEnd,
  selectedDate,
  dateError,
  onDateChange,
  onStart,
}: Readonly<OpeningIntroProps>) {
  const { t } = useTranslation('beginningBalances');

  const rules = [
    window.earliest && t('intro.date.afterClosing', { date: dateFormatV1(lastClosingEnd ?? '') }),
    window.latest && t('intro.date.beforeFirst', { date: dateFormatV1(window.latest) }),
  ].filter((rule): rule is string => Boolean(rule));

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconScale}
            title={t('page.title')}
            description={t('intro.headerDescription')}
          />

          <Paper withBorder radius="md" p="xl" bg="white">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
              <Stack gap="md">
                <Stack gap="xs">
                  <Text component="h2" fz={20} fw={700} c="dark.9" m={0}>
                    {t('intro.hero.title')}
                  </Text>
                  <Text c="dimmed" maw="52ch">
                    {t('intro.hero.body')}
                  </Text>
                </Stack>
                <Stack gap={8} component="ul" m={0} p={0} style={{ listStyle: 'none' }}>
                  {POINTS.map((point) => (
                    <Group key={point} component="li" gap="xs" wrap="nowrap">
                      <ThemeIcon
                        size={20}
                        radius="xl"
                        variant="light"
                        color="teal"
                        aria-hidden="true"
                      >
                        <IconCheck size={12} stroke={3} />
                      </ThemeIcon>
                      <Text fz="sm" c="dark.9">
                        {t(`intro.hero.points.${point}`)}
                      </Text>
                    </Group>
                  ))}
                </Stack>
              </Stack>
              <OpeningIllustration name="hero" maxWidth={420} />
            </SimpleGrid>
          </Paper>

          <Paper withBorder radius="md" p="xl" bg="white">
            {window.conflict ? (
              <Group gap="xl" wrap="nowrap" align="flex-start">
                <Box visibleFrom="sm" style={{ flex: 'none', width: 120 }}>
                  <OpeningIllustration name="blocked" />
                </Box>
                <Stack gap="sm" align="flex-start">
                  <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
                    {t('intro.conflict.title')}
                  </Text>
                  <Text c="dimmed" maw="64ch">
                    {t('intro.conflict.body', {
                      closing: dateFormatV1(lastClosingEnd ?? ''),
                      first: dateFormatV1(window.latest ?? ''),
                    })}
                  </Text>
                  <Text maw="64ch">{t('intro.conflict.hint')}</Text>
                  <Button
                    component={Link}
                    to={routes.periodClosing.main}
                    variant="default"
                    radius="md"
                    rightSection={<IconArrowRight size={16} />}
                  >
                    {t('intro.conflict.action')}
                  </Button>
                </Stack>
              </Group>
            ) : (
              <SimpleGrid cols={{ base: 1, md: 2 }} spacing="xl" style={{ alignItems: 'center' }}>
                <Group gap="lg" wrap="nowrap" align="flex-start">
                  <Box visibleFrom="sm" style={{ flex: 'none', width: 120 }}>
                    <OpeningIllustration name="cutoff" />
                  </Box>
                  <Stack gap="xs">
                    <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
                      {t('intro.date.title')}
                    </Text>
                    <Text c="dimmed" fz="sm">
                      {t('intro.date.body')}
                    </Text>
                    <Stack gap={6} component="ul" m={0} mt="xs" pl="md">
                      {rules.map((rule) => (
                        <Text key={rule} component="li" fz="sm">
                          {rule}
                        </Text>
                      ))}
                      <Text component="li" fz="sm">
                        {window.latest
                          ? t('intro.date.suggestionFirst', {
                              date: dateFormatV1(window.suggested ?? window.latest),
                            })
                          : t('intro.date.suggestionNone')}
                      </Text>
                    </Stack>
                  </Stack>
                </Group>
                <Stack gap="sm" maw={360}>
                  <DatePickerInput
                    label={t('intro.date.label')}
                    placeholder={t('toolbar.conversionDate')}
                    valueFormat="DD/MM/YYYY"
                    radius="md"
                    leftSection={<IconCalendar size={16} />}
                    value={selectedDate}
                    onChange={onDateChange}
                    minDate={window.earliest ?? undefined}
                    maxDate={window.latest ?? undefined}
                    error={dateError}
                  />
                  {window.suggested && selectedDate !== window.suggested && (
                    <Anchor
                      component="button"
                      type="button"
                      fz="sm"
                      ta="left"
                      onClick={() => onDateChange(window.suggested)}
                    >
                      {t('intro.date.useSuggested', { date: dateFormatV1(window.suggested) })}
                    </Anchor>
                  )}
                  <Button
                    radius="md"
                    rightSection={<IconArrowRight size={16} />}
                    disabled={!selectedDate || Boolean(dateError)}
                    onClick={onStart}
                  >
                    {t('intro.date.start')}
                  </Button>
                </Stack>
              </SimpleGrid>
            )}
          </Paper>

          <Stack gap="md">
            <Stack gap={2}>
              <Text component="h2" fz={18} fw={700} c="dark.9" m={0}>
                {t('intro.prepare.title')}
              </Text>
              <Text fz="sm" c="dimmed">
                {t('intro.prepare.subtitle')}
              </Text>
            </Stack>
            <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }}>
              {PREPARE.map(({ key, art }) => (
                <Paper key={key} withBorder radius="md" p="lg" bg="white">
                  <Stack gap="xs" align="center" ta="center">
                    <OpeningIllustration name={art} />
                    <Text fw={600}>{t(`intro.prepare.${key}.title`)}</Text>
                    <Text fz="sm" c="dimmed">
                      {t(`intro.prepare.${key}.body`)}
                    </Text>
                  </Stack>
                </Paper>
              ))}
            </SimpleGrid>
          </Stack>

          <OpeningProcess />
        </Stack>
      </Box>
    </AppShellLayout>
  );
}
