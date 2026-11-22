import {
  ActionIcon,
  Alert,
  Button,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
} from '@mantine/core';
import { IconInfoCircle, IconPlus, IconTrash } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import type { LineIssue, TransferLine } from '@/module/inventory/domain/stockTransfer';
import { numberFormat } from '@/utils/formatCurrency';

export interface ProductOption {
  value: string;
  label: string;
  unit: string;
  available: number;
}

type Props = {
  lines: TransferLine[];
  /** Products the source warehouse holds on the chosen date. */
  options: ProductOption[];
  sourceChosen: boolean;
  issues: Record<number, LineIssue>;
  noLines: boolean;
  onChange: (lines: TransferLine[]) => void;
};

/** The products to move: each row picks a product, shows what is available, and takes a quantity. */
export function TransferLinesEditor({
  lines,
  options,
  sourceChosen,
  issues,
  noLines,
  onChange,
}: Readonly<Props>) {
  const { t } = useTranslation('stockMovements');
  const optionOf = (productId: string) => options.find((option) => option.value === productId);

  const setLine = (index: number, next: Partial<TransferLine>) =>
    onChange(lines.map((line, at) => (at === index ? { ...line, ...next } : line)));

  const issueText = (index: number) => {
    const issue = issues[index];
    if (!issue) return undefined;
    const option = optionOf(lines[index].product);
    return t(`validation.${issue}`, {
      qty: numberFormat(option?.available ?? 0),
      unit: option?.unit ?? '',
    });
  };

  return (
    <Stack gap="sm">
      {!sourceChosen && (
        <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
          {t('form.pickSourceFirst')}
        </Alert>
      )}
      {sourceChosen && options.length === 0 && (
        <Alert color="gray" variant="light" icon={<IconInfoCircle size={18} />}>
          {t('form.noStockInSource')}
        </Alert>
      )}
      {lines.map((line, index) => {
        const option = optionOf(line.product);
        const taken = new Set(lines.filter((_, at) => at !== index).map((other) => other.product));
        return (
          <Paper key={`${line.product}-${index}`} withBorder radius="md" p="sm" bg="gray.0">
            <Group align="flex-start" gap="sm" wrap="wrap">
              <Select
                label={index === 0 ? t('form.product') : undefined}
                placeholder={t('form.pickProduct')}
                data={options.filter((item) => !taken.has(item.value))}
                value={line.product || null}
                onChange={(value) => setLine(index, { product: value ?? '', quantity: 0 })}
                error={issues[index] === 'productRequired' ? issueText(index) : undefined}
                searchable
                radius="md"
                style={{ flex: 1, minWidth: 220 }}
              />
              <Stack gap={2} w={90}>
                {index === 0 && (
                  <Text size="sm" fw={500}>
                    {t('form.available')}
                  </Text>
                )}
                <Text size="sm" pt={index === 0 ? 8 : 10} c={option ? undefined : 'dimmed'}>
                  {option ? numberFormat(option.available) : '-'}
                </Text>
              </Stack>
              <NumberInput
                label={index === 0 ? t('form.quantity') : undefined}
                aria-label={t('form.quantity')}
                value={line.quantity === 0 ? '' : line.quantity}
                onChange={(value) => setLine(index, { quantity: value === '' ? 0 : Number(value) })}
                error={
                  issues[index] && issues[index] !== 'productRequired'
                    ? issueText(index)
                    : undefined
                }
                min={0}
                decimalScale={2}
                hideControls
                radius="md"
                w={130}
              />
              <Stack gap={2} w={60}>
                {index === 0 && (
                  <Text size="sm" fw={500}>
                    {t('form.unit')}
                  </Text>
                )}
                <Text size="sm" pt={index === 0 ? 8 : 10}>
                  {option?.unit ?? '-'}
                </Text>
              </Stack>
              <ActionIcon
                variant="subtle"
                color="red"
                mt={index === 0 ? 26 : 4}
                aria-label={t('form.removeLine', { name: option?.label ?? '' })}
                onClick={() => onChange(lines.filter((_, at) => at !== index))}
              >
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Paper>
        );
      })}
      {noLines && (
        <Text size="sm" c="red.7">
          {t('validation.noLines')}
        </Text>
      )}
      <Group>
        <Button
          variant="light"
          leftSection={<IconPlus size={16} />}
          disabled={!sourceChosen || options.length === 0 || lines.length >= options.length}
          onClick={() => onChange([...lines, { product: '', quantity: 0 }])}
        >
          {t('form.addProduct')}
        </Button>
      </Group>
    </Stack>
  );
}
