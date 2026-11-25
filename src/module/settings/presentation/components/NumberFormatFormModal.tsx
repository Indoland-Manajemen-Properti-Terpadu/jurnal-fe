import {
  Alert,
  Button,
  Divider,
  Grid,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import { IconHash, IconInfoCircle } from '@tabler/icons-react';
import type { NumberFormatType } from '@/module/settings/domain/settingTypes';

import {
  formatExample,
  groupNumberFormatTypes,
  numberFormatTypeHint,
  type NumberFormatTypeInfo,
} from '@/module/settings/domain/numberFormatTypes';
import { useTranslation } from '@/i18n';
import type { UseFormReturnType } from '@mantine/form';

export type NumberFormatFormValues = {
  type: NumberFormatType;
  prefix: string;
  suffix: string;
  startNumber: number;
  status: 'active' | 'inactive';
};

interface NumberFormatFormModalProps {
  opened: boolean;
  onClose: () => void;
  isEditing: boolean;
  form: UseFormReturnType<NumberFormatFormValues>;
  onSubmit: (values: NumberFormatFormValues) => void | Promise<void>;
  isPending: boolean;
  /** The document types the service can number, with their default number. */
  types: NumberFormatTypeInfo[];
}

export function NumberFormatFormModal({
  opened,
  onClose,
  isEditing,
  form,
  onSubmit,
  isPending,
  types,
}: NumberFormatFormModalProps) {
  const { t: st } = useTranslation('settings');
  const chosen = types.find((entry) => entry.type === form.values.type);
  const hint = chosen ? numberFormatTypeHint(chosen) : null;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group gap="xs">
          <ThemeIcon size={28} radius="md" color="blue" variant="light">
            <IconHash size={16} />
          </ThemeIcon>
          <Text fw={700} c="dark.8">
            {isEditing ? st('numberFormat.modalEdit') : st('numberFormat.modalAdd')}
          </Text>
        </Group>
      }
      radius="md"
      size="md"
    >
      <form onSubmit={form.onSubmit(onSubmit)}>
        <Stack gap="md">
          <Select
            label={st('numberFormat.docType')}
            placeholder={st('numberFormat.docTypePlaceholder')}
            data={groupNumberFormatTypes(types)}
            searchable
            disabled={Boolean(isEditing)}
            required
            {...form.getInputProps('type')}
          />
          {hint && (
            <Alert color="blue" variant="light" radius="md" icon={<IconInfoCircle size={16} />}>
              <Stack gap={2}>
                {hint.kind === 'required' && (
                  <Text size="sm">{st('numberFormat.hintRequired')}</Text>
                )}
                {hint.kind === 'default' && (
                  <Text size="sm">
                    {st('numberFormat.hintDefault', { example: hint.example })}{' '}
                    {hint.restartsEvery && st(`numberFormat.restarts.${hint.restartsEvery}`)}
                  </Text>
                )}
                {hint.kind === 'active' && (
                  <Text size="sm">{st('numberFormat.hintActive', { next: hint.next })}</Text>
                )}
              </Stack>
            </Alert>
          )}

          <Grid gutter="sm">
            <Grid.Col span={8}>
              <TextInput
                label={st('numberFormat.prefix')}
                placeholder={st('numberFormat.prefixPlaceholder')}
                required
                {...form.getInputProps('prefix')}
              />
            </Grid.Col>
            <Grid.Col span={4}>
              <TextInput
                label={st('numberFormat.suffix')}
                placeholder={st('common.optional')}
                {...form.getInputProps('suffix')}
              />
            </Grid.Col>
          </Grid>

          <NumberInput
            label={st('numberFormat.startNumber')}
            placeholder="1"
            min={1}
            required
            {...form.getInputProps('startNumber')}
          />

          {isEditing && (
            <Switch
              label={st('numberFormat.statusSwitch')}
              checked={form.values.status === 'active'}
              onChange={(e) =>
                form.setFieldValue('status', e.currentTarget.checked ? 'active' : 'inactive')
              }
            />
          )}

          {/* Live Preview Box */}
          <Paper withBorder p="sm" radius="md" bg="gray.0">
            <Text size="xs" fw={700} c="dimmed" tt="uppercase">
              {st('numberFormat.previewResult')}
            </Text>
            <Text size="md" fw={700} c="primary.9" ff="monospace" mt={2}>
              {formatExample(form.values.prefix, form.values.startNumber || 1, form.values.suffix)}
            </Text>
            <Text size="xs" c="dimmed" mt={4}>
              {st('numberFormat.formatNote')}
            </Text>
          </Paper>

          <Divider />

          <Group justify="flex-end" gap="xs">
            <Button variant="default" onClick={onClose}>
              {st('common.cancel')}
            </Button>
            <Button type="submit" color="primary" loading={isPending}>
              {isEditing ? st('common.saveChanges') : st('numberFormat.create')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

export default NumberFormatFormModal;
