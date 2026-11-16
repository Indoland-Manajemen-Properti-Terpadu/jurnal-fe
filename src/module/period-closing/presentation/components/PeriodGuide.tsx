import { Accordion, Badge, Flex, Paper, SimpleGrid, Stack, Text } from '@mantine/core';
import { IconBulb, IconCircleCheck } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { PeriodIllustration, type PeriodIllustrationName } from './PeriodIllustration';
import { PeriodSteps } from './PeriodSteps';

interface PeriodGuideProps {
  /** Open on a first visit, when nothing has been locked yet. */
  defaultOpen: boolean;
}

const GUIDE_ITEM = 'guide';

interface ChoiceProps {
  art: PeriodIllustrationName;
  color: string;
  title: string;
  body: string;
  when: string;
  tag: string;
}

function Choice({ art, color, title, body, when, tag }: Readonly<ChoiceProps>) {
  return (
    <Paper withBorder radius="md" p="lg" bg="white">
      <Flex
        gap="lg"
        direction={{ base: 'column', sm: 'row' }}
        align={{ base: 'flex-start', sm: 'center' }}
      >
        <div style={{ flex: 'none', width: 120 }}>
          <PeriodIllustration name={art} maxWidth={120} />
        </div>
        <Stack gap="xs" align="flex-start" miw={0}>
          <Text fw={700}>{title}</Text>
          <Text size="sm">{body}</Text>
          <Text size="xs" c="dimmed">
            {when}
          </Text>
          <Badge
            variant="light"
            color={color}
            radius="sm"
            tt="none"
            leftSection={<IconCircleCheck size={12} />}
          >
            {tag}
          </Badge>
        </Stack>
      </Flex>
    </Paper>
  );
}

/** What locking and closing mean and in which order to do the period end; folded once known. */
export function PeriodGuide({ defaultOpen }: Readonly<PeriodGuideProps>) {
  const { t } = useTranslation('periodClosing');

  return (
    <Accordion
      variant="contained"
      radius="md"
      defaultValue={defaultOpen ? GUIDE_ITEM : null}
      chevronPosition="right"
      styles={{ item: { backgroundColor: 'var(--mantine-color-white)' } }}
    >
      <Accordion.Item value={GUIDE_ITEM}>
        <Accordion.Control icon={<IconBulb size={20} color="var(--mantine-color-primary-6)" />}>
          <Text fw={600}>{t('guide.toggle')}</Text>
          <Text size="xs" c="dimmed">
            {t('guide.toggleHint')}
          </Text>
        </Accordion.Control>
        <Accordion.Panel>
          <Stack gap="xl" pt="xs">
            <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="md">
              <Choice
                art="lockPeriod"
                color="orange"
                title={t('guide.lockTitle')}
                body={t('guide.lockBody')}
                when={t('guide.lockWhen')}
                tag={t('guide.lockTag')}
              />
              <Choice
                art="closeBooks"
                color="primary"
                title={t('guide.closeTitle')}
                body={t('guide.closeBody')}
                when={t('guide.closeWhen')}
                tag={t('guide.closeTag')}
              />
            </SimpleGrid>
            <Stack gap="lg">
              <Text fw={600} ta="center">
                {t('guide.stepsTitle')}
              </Text>
              <PeriodSteps />
            </Stack>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
