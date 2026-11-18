import { List, Text, ThemeIcon } from '@mantine/core';
import { IconCheck, IconCircleDashed } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { WriteOffField } from '@/module/assets/domain/writeOffRules';

/** What is still missing before the report can be filed; ticks fill in as the form is completed. */
export function WriteOffChecklist({
  rows,
}: Readonly<{ rows: { key: WriteOffField; done: boolean }[] }>) {
  const { t } = useTranslation('assetWriteOffs');
  return (
    <>
      <Text size="xs" fw={700} c="dimmed" tt="uppercase" mb={8}>
        {t('checklistTitle')}
      </Text>
      <List spacing={6} size="sm" center>
        {rows.map((row) => (
          <List.Item
            key={row.key}
            icon={
              <ThemeIcon
                size={20}
                radius="xl"
                variant={row.done ? 'filled' : 'light'}
                color={row.done ? 'teal' : 'gray'}
              >
                {row.done ? <IconCheck size={12} /> : <IconCircleDashed size={12} />}
              </ThemeIcon>
            }
          >
            <Text size="sm" c={row.done ? undefined : 'dimmed'}>
              {t(`check_${row.key}`)}
            </Text>
          </List.Item>
        ))}
      </List>
    </>
  );
}

export default WriteOffChecklist;
