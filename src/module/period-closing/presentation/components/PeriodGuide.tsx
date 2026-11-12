import type { ReactNode } from 'react';
import { Accordion, Badge, Group, Paper, SimpleGrid, Stack, Text, ThemeIcon } from '@mantine/core';
import { IconBook2, IconBulb, IconLock } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';

interface PeriodGuideProps {
  /** Open on a first visit, when nothing has been locked yet. */
  defaultOpen: boolean;
}

const GUIDE_ITEM = 'guide';
const STEPS = ['step1', 'step2', 'step3', 'step4'] as const;

interface ChoiceProps {
  icon: ReactNode;
  color: string;
  title: string;
  body: string;
  when: string;
}

function Choice({ icon, color, title, body, when }: Readonly<ChoiceProps>) {
  return (
    <Paper withBorder radius="md" p="md" bg="white">
      <Stack gap="xs">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon size={32} radius="md" variant="light" color={color}>
            {icon}
          </ThemeIcon>
          <Text fw={700}>{title}</Text>
        </Group>
        <Text size="sm">{body}</Text>
        <Text size="xs" c="dimmed">
          {when}
        </Text>
      </Stack>
    </Paper>
  );
}

/** What locking and closing mean and in which order to do the period end; folded once known. */
export function PeriodGuide({ defaultOpen }: Readonly<PeriodGuideProps>) {
  const { t } = useTranslation('periodClosing');

  return (
    <Accordion
      variant="contained"
      radius="lg"
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
          <Stack gap="md">
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="md">
              <Choice
                icon={<IconLock size={18} />}
                color="orange"
                title={t('guide.lockTitle')}
                body={t('guide.lockBody')}
                when={t('guide.lockWhen')}
              />
              <Choice
                icon={<IconBook2 size={18} />}
                color="primary"
                title={t('guide.closeTitle')}
                body={t('guide.closeBody')}
                when={t('guide.closeWhen')}
              />
            </SimpleGrid>
            <Stack gap="xs">
              <Text size="sm" fw={600}>
                {t('guide.stepsTitle')}
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="xs">
                {STEPS.map((step, index) => (
                  <Group key={step} gap="xs" wrap="nowrap" align="flex-start">
                    <Badge circle size="lg" variant="light" color="primary">
                      {index + 1}
                    </Badge>
                    <Text size="sm">{t(`guide.${step}`)}</Text>
                  </Group>
                ))}
              </SimpleGrid>
            </Stack>
          </Stack>
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
