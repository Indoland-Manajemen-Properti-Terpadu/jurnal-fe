import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Skeleton,
  Stack,
  Table,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconPencil, IconPlus, IconSearch, IconTrash, type Icon } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import type { MasterDataInput, MasterDataItem } from '@/module/products/domain/product';
import { formatDate } from '@/module/products/domain/productFormat';
import { MasterDataFormModal } from './MasterDataFormModal';

type MasterDataPanelProps = {
  icon: Icon;
  entityLabel: string;
  helperText: string;
  namePlaceholder: string;
  items: MasterDataItem[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  onCreate: (input: MasterDataInput) => Promise<unknown>;
  onUpdate: (id: string, input: MasterDataInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

/** List + create/edit/delete for simple product master data (categories, units). */
export function MasterDataPanel({
  icon: EntityIcon,
  entityLabel,
  helperText,
  namePlaceholder,
  items,
  isLoading,
  isCreating,
  isUpdating,
  isDeleting,
  onCreate,
  onUpdate,
  onDelete,
}: Readonly<MasterDataPanelProps>) {
  const { t } = useTranslation('products');
  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [editing, setEditing] = useState<MasterDataItem | null>(null);
  const [pendingDelete, setPendingDelete] = useState<MasterDataItem | null>(null);

  const entity = entityLabel.toLowerCase();
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? items.filter((item) => item.name.toLowerCase().includes(keyword))
    : items;

  const openCreate = () => {
    setEditing(null);
    setModalOpened(true);
  };

  const openEdit = (item: MasterDataItem) => {
    setEditing(item);
    setModalOpened(true);
  };

  return (
    <Stack gap="md">
      <Group justify="space-between" align="flex-end" wrap="wrap" gap="sm">
        <Group gap="sm" wrap="wrap" align="flex-end">
          <TextInput
            placeholder={t('masterData.searchPlaceholder', { entity })}
            aria-label={t('masterData.searchPlaceholder', { entity })}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: '100%', sm: 320 }}
          />
          <Text size="xs" c="dimmed" pb={10}>
            {helperText}
          </Text>
        </Group>
        <Button color="primary" leftSection={<IconPlus size={16} />} onClick={openCreate}>
          {t('masterData.add', { entity: entityLabel })}
        </Button>
      </Group>

      <Paper withBorder radius="md" bg="white" p={0} style={{ overflow: 'hidden' }}>
        <Table.ScrollContainer minWidth={560}>
          <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
            <Table.Thead bg="gray.0">
              <Table.Tr>
                {(['colName', 'colDescription', 'colCreated'] as const).map((key) => (
                  <Table.Th key={key}>
                    <Text size="xs" fw={700} c="dimmed" tt="uppercase">
                      {t(`masterData.${key}`)}
                    </Text>
                  </Table.Th>
                ))}
                <Table.Th w={96} />
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading
                ? Array.from({ length: 4 }, (_, i) => (
                    <Table.Tr key={i}>
                      <Table.Td colSpan={4}>
                        <Skeleton height={16} radius="sm" />
                      </Table.Td>
                    </Table.Tr>
                  ))
                : filtered.map((item) => (
                    <Table.Tr key={item.id}>
                      <Table.Td>
                        <Text size="sm" fw={700} c="primary.9">
                          {item.name}
                        </Text>
                        {item.code && (
                          <Text size="xs" c="dimmed">
                            {item.code}
                          </Text>
                        )}
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c={item.description ? 'dark.7' : 'dimmed'} lineClamp={2}>
                          {item.description || t('masterData.noDescription')}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" c="dark.7" style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(item.createdAt)}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} justify="flex-end" wrap="nowrap">
                          <Tooltip label={t('masterData.editTooltip', { entity })}>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              radius="md"
                              aria-label={t('masterData.editItem', { name: item.name })}
                              onClick={() => openEdit(item)}
                            >
                              <IconPencil size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label={t('masterData.removeTooltip', { entity })}>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              radius="md"
                              aria-label={t('masterData.removeItem', { name: item.name })}
                              onClick={() => setPendingDelete(item)}
                            >
                              <IconTrash size={16} />
                            </ActionIcon>
                          </Tooltip>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
              {!isLoading && filtered.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={4} p={0}>
                    <EmptyState
                      icon={<EntityIcon size={32} stroke={1.6} />}
                      title={
                        keyword
                          ? t('masterData.emptyNoResultTitle')
                          : t('masterData.emptyTitle', { entity: entityLabel })
                      }
                      description={
                        keyword
                          ? t('masterData.emptyNoResultDescription')
                          : t('masterData.emptyDescription', { entity })
                      }
                      actionLabel={
                        keyword ? undefined : t('masterData.add', { entity: entityLabel })
                      }
                      onAction={keyword ? undefined : openCreate}
                      actionIcon={<IconPlus size={16} />}
                    />
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>
      </Paper>

      <MasterDataFormModal
        key={editing?.id ?? 'new'}
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        entityLabel={entityLabel}
        item={editing}
        namePlaceholder={namePlaceholder}
        isSubmitting={editing ? isUpdating : isCreating}
        onSubmit={(input) => (editing ? onUpdate(editing.id, input) : onCreate(input))}
      />

      <ConfirmModal
        opened={pendingDelete !== null}
        onClose={() => setPendingDelete(null)}
        title={t('masterData.deleteTitle', { entity })}
        message={t('masterData.deleteMessage', {
          entityName: entityLabel,
          name: pendingDelete?.name ?? '',
        })}
        helperText={t('masterData.deleteHelper')}
        confirmLoading={isDeleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          await onDelete(pendingDelete.id);
          setPendingDelete(null);
        }}
      />
    </Stack>
  );
}
