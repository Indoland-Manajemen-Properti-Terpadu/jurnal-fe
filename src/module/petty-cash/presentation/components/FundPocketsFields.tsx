import {
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { formatCurrency } from '@/utils/formatCurrency';
import {
  cashRemainder,
  emptyPocketDraft,
  type AddablePocketType,
  type NumberField,
  type PocketDraft,
} from '@/module/petty-cash/domain/pockets';
import { usePettyCashLookups } from '@/module/petty-cash/presentation/hooks/usePettyCashQueries';

interface Props {
  pockets: PocketDraft[];
  pagu: NumberField;
  onChange: (pockets: PocketDraft[]) => void;
  errorOf: (path: string) => string | undefined;
}

const money = (amount: number) => formatCurrency(amount, false);

/**
 * Non-cash pockets opened together with a new fund and how the ceiling is split between them. What
 * no pocket takes stays in the cash box, so the split always adds up to the ceiling.
 */
export function FundPocketsFields({ pockets, pagu, onChange, errorOf }: Readonly<Props>) {
  const { t } = useTranslation('pettyCash');
  const lookups = usePettyCashLookups();
  const typeOptions = (lookups.data?.pocketTypes ?? []).map((type) => ({
    value: type.value,
    label: ['BANK', 'EWALLET'].includes(type.value) ? t(`pockets.types.${type.value}`) : type.label,
  }));
  const remainder = cashRemainder(pagu, pockets);

  const change = (index: number, next: Partial<PocketDraft>) =>
    onChange(pockets.map((pocket, at) => (at === index ? { ...pocket, ...next } : pocket)));

  return (
    <Stack gap="sm">
      <Stack gap={2}>
        <Text fw={650} size="sm">
          {t('pocketAdmin.sectionTitle')}
        </Text>
        <Text size="xs" c="dimmed">
          {t('pocketAdmin.sectionHint')}
        </Text>
      </Stack>
      <Group>
        <Button
          variant="default"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...pockets, emptyPocketDraft()])}
        >
          {t('pocketAdmin.add')}
        </Button>
      </Group>

      {pockets.map((pocket, index) => (
        <Paper key={index} withBorder radius="md" p="md" bg="gray.0">
          <Stack gap="sm">
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="sm">
              <TextInput
                label={t('pocketAdmin.code')}
                placeholder={t('pocketAdmin.codePlaceholder')}
                value={pocket.code}
                onChange={(event) => change(index, { code: event.currentTarget.value })}
                error={errorOf(`pockets.${index}.code`)}
                required
              />
              <Select
                label={t('pocketAdmin.type')}
                data={typeOptions}
                value={pocket.type}
                onChange={(type) => type && change(index, { type: type as AddablePocketType })}
                allowDeselect={false}
              />
              <TextInput
                label={t('pocketAdmin.name')}
                placeholder={t('pocketAdmin.namePlaceholder')}
                value={pocket.name}
                onChange={(event) => change(index, { name: event.currentTarget.value })}
                error={errorOf(`pockets.${index}.name`)}
                required
              />
              <TextInput
                label={t('pocketAdmin.provider')}
                value={pocket.provider}
                onChange={(event) => change(index, { provider: event.currentTarget.value })}
              />
              <TextInput
                label={t('pocketAdmin.accountNumber')}
                value={pocket.accountNumber}
                onChange={(event) => change(index, { accountNumber: event.currentTarget.value })}
              />
              <TextInput
                label={t('pocketAdmin.accountHolder')}
                value={pocket.accountHolder}
                onChange={(event) => change(index, { accountHolder: event.currentTarget.value })}
              />
            </SimpleGrid>
            <Group justify="space-between" align="flex-end" wrap="wrap">
              <NumberInput
                label={t('pocketAdmin.share')}
                value={pocket.amount}
                onChange={(value) => change(index, { amount: value === '' ? '' : Number(value) })}
                error={errorOf(`pockets.${index}.amount`)}
                thousandSeparator="."
                decimalSeparator=","
                allowNegative={false}
                decimalScale={0}
                leftSection={<Text size="sm">Rp</Text>}
                placeholder="0"
                w={{ base: '100%', sm: 280 }}
              />
              <Button
                variant="subtle"
                color="red"
                size="xs"
                onClick={() => onChange(pockets.filter((_, at) => at !== index))}
              >
                {t('pocketAdmin.remove')}
              </Button>
            </Group>
          </Stack>
        </Paper>
      ))}

      {pockets.length > 0 && (
        <Text size="sm" c={remainder < 0 ? 'red.8' : 'dimmed'} aria-live="polite">
          {t('pocketAdmin.remainder')}{' '}
          <Text span fw={700} c={remainder < 0 ? 'red.8' : 'dark.9'}>
            {money(remainder)}
          </Text>
        </Text>
      )}
      {errorOf('pockets') && (
        <Text size="xs" c="red.8" role="alert">
          {errorOf('pockets')}
        </Text>
      )}
    </Stack>
  );
}
