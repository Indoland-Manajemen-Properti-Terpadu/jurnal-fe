import { useEffect, useState } from 'react';
import { Alert, Button, Group, Paper, Select, Skeleton, Stack, Table, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconAlertCircle, IconDeviceFloppy } from '@tabler/icons-react';
import { useTranslation } from '@/i18n';
import { SettingsLayout } from '@/module/settings';
import { columnHeader } from '@/module/inventory/presentation/components/shared/columnHeader';
import { DataTableFrame } from '@/module/inventory/presentation/components/shared/DataTableFrame';
import {
  useOpnameAccounts,
  useOpnameMutations,
  useStockTakeErrorMessage,
} from '@/module/inventory/presentation/hooks/useOpnames';

/** The account each reason of a count difference is booked to; one row per reason. */
export default function OpnameAccountsPage() {
  const { t } = useTranslation('stockTake');
  const describe = useStockTakeErrorMessage();
  const query = useOpnameAccounts();
  const { saveAccounts } = useOpnameMutations();
  const [choice, setChoice] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!query.data) return;
    setChoice(
      Object.fromEntries(
        query.data.flatMap((rule) => (rule.accountId ? [[rule.reason, rule.accountId]] : []))
      )
    );
  }, [query.data]);

  const rules = query.data ?? [];
  const complete = rules.every((rule) => Boolean(choice[rule.reason]));
  const changed = rules.some((rule) => (choice[rule.reason] ?? null) !== rule.accountId);

  const save = () =>
    saveAccounts.mutate(choice, {
      onSuccess: () => notifications.show({ color: 'green', message: t('accounts.saved') }),
    });

  const directionLabel = (directions: ('loss' | 'gain')[]) =>
    directions.map((direction) => t(`accounts.${direction}`)).join(', ');

  const renderBody = () => {
    if (query.isLoading) return <Skeleton height={220} radius="md" />;
    if (query.isError) {
      return (
        <Alert color="red" variant="light" icon={<IconAlertCircle size={18} />}>
          <Group justify="space-between" wrap="wrap" gap="sm">
            {describe(query.error)}
            <Button size="xs" variant="default" onClick={() => query.refetch()}>
              {t('loadFailed.retry')}
            </Button>
          </Group>
        </Alert>
      );
    }
    return (
      <DataTableFrame minWidth={620}>
        <Table.Thead bg="gray.0">
          <Table.Tr>
            {columnHeader(t('accounts.reason'))}
            {columnHeader(t('accounts.direction'))}
            {columnHeader(t('accounts.account'))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rules.map((rule) => (
            <Table.Tr key={rule.reason}>
              <Table.Td>
                <Text size="sm" fw={600}>
                  {t(`reason.${rule.reason}`)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Text size="sm" c="dimmed">
                  {directionLabel(rule.directions)}
                </Text>
              </Table.Td>
              <Table.Td>
                <Select
                  aria-label={`${t('accounts.account')} ${t(`reason.${rule.reason}`)}`}
                  placeholder={t('accounts.pick')}
                  data={rule.options.map((option) => ({
                    value: option.id,
                    label: `${option.accountNumber} · ${option.name}`,
                  }))}
                  value={choice[rule.reason] ?? null}
                  onChange={(value) =>
                    setChoice((current) => {
                      const next = { ...current };
                      if (value) next[rule.reason] = value;
                      else delete next[rule.reason];
                      return next;
                    })
                  }
                  searchable
                  radius="md"
                  w={{ base: '100%', sm: 380 }}
                />
              </Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </DataTableFrame>
    );
  };

  return (
    <SettingsLayout
      title={t('accounts.title')}
      description={t('accounts.description')}
      action={
        <Button
          color="primary"
          leftSection={<IconDeviceFloppy size={16} />}
          disabled={!changed || !complete}
          loading={saveAccounts.isPending}
          onClick={save}
        >
          {t('accounts.save')}
        </Button>
      }
    >
      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          {saveAccounts.isError && (
            <Alert
              color="red"
              variant="light"
              icon={<IconAlertCircle size={18} />}
              title={t('accounts.failedTitle')}
            >
              {describe(saveAccounts.error)}
            </Alert>
          )}
          {renderBody()}
          <Text size="xs" c="dimmed">
            {t('accounts.hint')}
          </Text>
        </Stack>
      </Paper>
    </SettingsLayout>
  );
}
