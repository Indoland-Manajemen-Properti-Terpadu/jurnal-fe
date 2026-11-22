import { Group, SegmentedControl, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import type { ScoreCriterion, ScoreKey } from '@/module/purchases/domain/procurement';
import { SCORE_KEYS, type QuoteFormValues } from '@/module/purchases/domain/quoteForm';

interface QuoteScoresSectionProps {
  criteria: ScoreCriterion[];
  scores: QuoteFormValues['scores'];
  onChange: (key: ScoreKey, value: number) => void;
}

const LEVELS = ['1', '2', '3', '4', '5'];

/** Each criterion scored 1 to 5; the weights are the service's own. */
export const QuoteScoresSection = ({
  criteria,
  scores,
  onChange,
}: Readonly<QuoteScoresSectionProps>) => {
  const { t } = useTranslation('purchases');
  const weights = new Map(criteria.map((criterion) => [criterion.key, criterion.weight]));

  return (
    <Stack gap="sm">
      <Text size="xs" c="dimmed">
        {t('procurement.quote.scoresHint')}
      </Text>
      {SCORE_KEYS.map((key) => (
        <Group key={key} justify="space-between" wrap="nowrap" gap="md">
          <div>
            <Text size="sm" fw={500}>
              {t(`procurement.quote.score.${key}`)}
            </Text>
            {weights.has(key) && (
              <Text size="xs" c="dimmed">
                {t('procurement.quote.weight', { weight: weights.get(key) as number })}
              </Text>
            )}
          </div>
          <SegmentedControl
            size="xs"
            radius="md"
            data={LEVELS}
            value={scores[key] === null ? '' : String(scores[key])}
            aria-label={t(`procurement.quote.score.${key}`)}
            onChange={(value) => onChange(key, Number(value))}
          />
        </Group>
      ))}
    </Stack>
  );
};
