import { useMemo } from 'react';
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  Grid,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
} from '@mantine/core';
import type { UseFormReturnType } from '@mantine/form';
import { IconBuildingBank, IconPlus, IconTrash } from '@tabler/icons-react';
import { INDONESIA_BANKS } from '@/constants/banks';
import { useTranslation } from '@/i18n';
import type { ContactFormValues } from '@/module/contacts/domain/contact';

type Props = { form: UseFormReturnType<ContactFormValues> };

export function ContactBankTab({ form }: Readonly<Props>) {
  const { t } = useTranslation('contacts');

  const bankOptions = useMemo(
    () =>
      INDONESIA_BANKS.map((bank) => ({
        value: bank.name,
        label: `${bank.name} (${bank.code}) - ${bank.category}`,
      })),
    []
  );

  const handleAddBankAccount = () => {
    form.insertListItem('bankAccounts', {
      bankName: '',
      branch: '',
      accountHolder: '',
      accountNumber: '',
    });
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="center">
        <Box>
          <Text fw={700} size="sm" c="primary.9">
            {t('form.banks.title')}
          </Text>
          <Text size="xs" c="dimmed">
            {t('form.banks.subtitle')}
          </Text>
        </Box>
        <Button
          size="xs"
          variant="light"
          color="primary"
          leftSection={<IconPlus size={14} />}
          onClick={handleAddBankAccount}
        >
          {t('form.banks.add')}
        </Button>
      </Group>

      {form.values.bankAccounts.length === 0 ? (
        <Paper withBorder p="xl" radius="md" ta="center" bg="gray.0">
          <ThemeIcon size={40} radius="xl" color="gray" variant="light" mx="auto" mb="xs">
            <IconBuildingBank size={20} />
          </ThemeIcon>
          <Text size="sm" fw={600} c="dark.8">
            {t('form.banks.emptyTitle')}
          </Text>
          <Text size="xs" c="dimmed" mt={2} mb="md">
            {t('form.banks.emptyDescription')}
          </Text>
          <Button
            size="xs"
            variant="outline"
            color="primary"
            leftSection={<IconPlus size={14} />}
            onClick={handleAddBankAccount}
          >
            {t('form.banks.addFirst')}
          </Button>
        </Paper>
      ) : (
        <Stack gap="sm">
          {form.values.bankAccounts.map((_, index) => (
            // eslint-disable-next-line react/no-array-index-key
            <Paper key={`bank-${index}`} withBorder p="sm" radius="md" bg="white">
              <Group justify="space-between" align="center" mb="xs">
                <Text size="xs" fw={700} c="primary.8">
                  {t('form.banks.itemTitle', { number: index + 1 })}
                </Text>
                <ActionIcon
                  color="red"
                  variant="subtle"
                  size="sm"
                  onClick={() => form.removeListItem('bankAccounts', index)}
                  aria-label={t('form.banks.remove')}
                >
                  <IconTrash size={14} />
                </ActionIcon>
              </Group>

              <Grid gutter="sm">
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <Autocomplete
                    label={t('form.banks.bankName.label')}
                    placeholder={t('form.banks.bankName.placeholder')}
                    data={bankOptions}
                    limit={8}
                    maxDropdownHeight={240}
                    {...form.getInputProps(`bankAccounts.${index}.bankName`)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.banks.accountNumber.label')}
                    placeholder={t('form.banks.accountNumber.placeholder')}
                    {...form.getInputProps(`bankAccounts.${index}.accountNumber`)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.banks.accountHolder.label')}
                    placeholder={t('form.banks.accountHolder.placeholder')}
                    {...form.getInputProps(`bankAccounts.${index}.accountHolder`)}
                  />
                </Grid.Col>
                <Grid.Col span={{ base: 12, sm: 6 }}>
                  <TextInput
                    label={t('form.banks.branch.label')}
                    placeholder={t('form.banks.branch.placeholder')}
                    {...form.getInputProps(`bankAccounts.${index}.branch`)}
                  />
                </Grid.Col>
              </Grid>
            </Paper>
          ))}
        </Stack>
      )}
    </Stack>
  );
}
