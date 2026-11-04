import { NumberInput, Stack, Text } from '@mantine/core';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import { pocketVariance, type CountDraft } from '@/module/petty-cash/domain/cashCount';
import type { FundPocket } from '@/module/petty-cash/domain/pettyCashEntities';
import { VarianceText } from '@/module/petty-cash/presentation/components/VarianceText';

interface Props {
  pockets: FundPocket[];
  draft: CountDraft;
  errorFor: (path: string) => string | undefined;
  onChange: (draft: CountDraft) => void;
}

/** One row per non-cash pocket: what it is, and the balance read from the statement or the app. */
export function CountPocketFields({ pockets, draft, errorFor, onChange }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');

  return (
    <Stack gap={0}>
      {pockets.map((pocket, index) => {
        const typed = draft.nonCash[pocket.code] ?? '';
        const variance = pocketVariance(typed, pocket.balance);
        return (
          <div
            key={pocket.code}
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: 'var(--mantine-spacing-md)',
              padding: 'var(--mantine-spacing-sm) 0',
              borderTop: index > 0 ? '1px solid var(--mantine-color-gray-2)' : undefined,
            }}
          >
            <div style={{ minWidth: 0, flex: '1 1 180px' }}>
              <Text size="sm" fw={500} c="dark.8">
                {pocket.name}
              </Text>
              <Text size="xs" c="dimmed">
                {[t(`pockets.types.${pocket.type}`), pocket.provider, pocket.accountNumber]
                  .filter(Boolean)
                  .join(' · ')}
              </Text>
            </div>
            <Stack gap={4} align="flex-end" style={{ flex: '0 1 240px' }}>
              <NumberInput
                aria-label={t('countForm.pocketBalanceFor', { name: pocket.name })}
                placeholder="0"
                prefix="Rp "
                thousandSeparator="."
                decimalSeparator=","
                decimalScale={0}
                allowNegative={false}
                hideControls
                required
                w="100%"
                value={typed}
                onChange={(next) =>
                  onChange({
                    ...draft,
                    nonCash: {
                      ...draft.nonCash,
                      [pocket.code]: typeof next === 'number' ? next : '',
                    },
                  })
                }
                error={errorFor(`nonCash.${pocket.code}`)}
              />
              <Text size="xs" c="dimmed">
                {t('countForm.bookBalance', { amount: formatCurrency(pocket.balance, false) })}
              </Text>
              {typed !== '' && (
                <VarianceText type={variance.type} amount={variance.amount} size="xs" />
              )}
            </Stack>
          </div>
        );
      })}
    </Stack>
  );
}
