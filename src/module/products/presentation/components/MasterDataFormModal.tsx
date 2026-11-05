import { Button, Group, Modal, Stack, Text, TextInput, Textarea } from '@mantine/core';
import { useForm } from '@mantine/form';
import { t, useTranslation } from '@/i18n';
import type { MasterDataInput, MasterDataItem } from '@/module/products/domain/product';

type MasterDataFormModalProps = {
  opened: boolean;
  onClose: () => void;
  entityLabel: string;
  /** When set the modal edits this item instead of creating one; remount it (key) per item. */
  item?: MasterDataItem | null;
  namePlaceholder: string;
  isSubmitting: boolean;
  onSubmit: (input: MasterDataInput) => Promise<unknown>;
};

export function MasterDataFormModal({
  opened,
  onClose,
  entityLabel,
  item,
  namePlaceholder,
  isSubmitting,
  onSubmit,
}: Readonly<MasterDataFormModalProps>) {
  const { t: tp } = useTranslation('products');
  const entity = entityLabel.toLowerCase();
  const form = useForm({
    initialValues: { name: item?.name ?? '', description: item?.description ?? '' },
    validate: {
      name: (value) =>
        value.trim() ? null : t('masterData.formNameRequired', { entity }, 'products'),
    },
  });

  const close = () => {
    form.reset();
    onClose();
  };

  const handleSubmit = form.onSubmit(async (values) => {
    await onSubmit({
      name: values.name.trim(),
      description: values.description.trim() || null,
    });
    close();
  });

  return (
    <Modal
      opened={opened}
      onClose={close}
      title={
        <Text fw={700} c="primary.9">
          {item
            ? tp('masterData.edit', { entity: entityLabel })
            : tp('masterData.add', { entity: entityLabel })}
        </Text>
      }
      centered
      radius="lg"
    >
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label={tp('masterData.formNameLabel', { entity })}
            placeholder={namePlaceholder}
            withAsterisk
            data-autofocus
            {...form.getInputProps('name')}
          />
          <Textarea
            label={tp('masterData.formDescription')}
            description={tp('masterData.formDescriptionHint')}
            autosize
            minRows={2}
            {...form.getInputProps('description')}
          />
          <Group justify="flex-end" mt="xs">
            <Button variant="default" onClick={close} disabled={isSubmitting}>
              {tp('masterData.cancel')}
            </Button>
            <Button type="submit" color="primary" loading={isSubmitting}>
              {tp('masterData.save')}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}
