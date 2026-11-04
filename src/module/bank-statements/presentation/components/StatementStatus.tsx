import { Group, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';

/** A small dot and a word: green once matched, grey while it waits. Not a badge. */
const StatementStatus: React.FC<{ reconciled: boolean }> = ({ reconciled }) => {
  const { t } = useTranslation('bankStatements');
  return (
    <Group gap={6} wrap="nowrap">
      <span
        aria-hidden
        style={{
          width: 8,
          height: 8,
          borderRadius: '50%',
          flexShrink: 0,
          background: reconciled ? 'var(--mantine-color-teal-6)' : 'var(--mantine-color-gray-5)',
        }}
      />
      <Text
        fz="var(--jurnal-text-sm)"
        c={reconciled ? 'dark.8' : 'dimmed'}
        style={{ whiteSpace: 'nowrap' }}
      >
        {reconciled ? t('status.reconciled') : t('status.unreconciled')}
      </Text>
    </Group>
  );
};

export default StatementStatus;
