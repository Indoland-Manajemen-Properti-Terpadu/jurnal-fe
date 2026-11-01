import { useState } from 'react';
import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Skeleton,
  Table,
  Text,
  TextInput,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { IconPlus, IconSearch, IconTrash, type Icon } from '@tabler/icons-react';
import { EmptyState } from '@/components/EmptyState';
import { ConfirmModal } from '@/components/ui/ConfirmModal/ConfirmModal';
import { useTranslation } from '@/i18n';
import type { MasterDataInput } from '@/module/products/domain/product';
import { formatDate } from '@/module/products/domain/productFormat';
import { MasterDataFormModal } from './MasterDataFormModal';

type MasterDataItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  code?: string;
};

type MasterDataPanelProps = {
  icon: Icon;
  entityLabel: string;
  helperText: string;
  namePlaceholder: string;
  items: MasterDataItem[];
  isLoading: boolean;
  isCreating: boolean;
  isDeleting: boolean;
  onCreate: (input: MasterDataInput) => Promise<unknown>;
  onDelete: (id: string) => Promise<unknown>;
};

/** List + create/delete for simple product master data (categories, units). */
export function MasterDataPanel({
  icon: EntityIcon,
  entityLabel,
  helperText,
  namePlaceholder,
  items,
  isLoading,
  isCreating,
  isDeleting,
  onCreate,
  onDelete,
}: Readonly<MasterDataPanelProps>) {
  const { t } = useTranslation('products');
  const [search, setSearch] = useState('');
  const [modalOpened, setModalOpened] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<MasterDataItem | null>(null);

  const entity = entityLabel.toLowerCase();
  const keyword = search.trim().toLowerCase();
  const filtered = keyword
    ? items.filter((item) => item.name.toLowerCase().includes(keyword))
    : items;

  return (
    <Paper withBorder radius="lg" style={{ overflow: 'hidden' }}>
      <Group justify="space-between" p="md" gap="sm" wrap="wrap">
        <Group gap="sm" wrap="nowrap">
          <ThemeIcon variant="light" color="primary" radius="md" size={36}>
            <EntityIcon size={18} />
          </ThemeIcon>
          <div>
            <Text fw={600} size="sm" c="dark.8">
              {t('masterData.registeredCount', { count: items.length, entity })}
            </Text>
            <Text size="xs" c="dimmed">
              {helperText}
            </Text>
          </div>
        </Group>
        <Group gap="sm">
          <TextInput
            placeholder={t('masterData.searchPlaceholder', { entity })}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(event) => setSearch(event.currentTarget.value)}
            w={{ base: '100%', xs: 240 }}
          />
          <Button
            color="primary"
            leftSection={<IconPlus size={16} />}
            onClick={() => setModalOpened(true)}
          >
            {t('masterData.add', { entity: entityLabel })}
          </Button>
        </Group>
      </Group>

      <Table.ScrollContainer minWidth={560}>
        <Table verticalSpacing="sm" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="gray.0">
            <Table.Tr>
              {(['colName', 'colDescription', 'colCreated'] as const).map((key) => (
                <Table.Th key={key}>
                  <Text size="xs" fw={600} c="dimmed" tt="uppercase" lts={0.4}>
                    {t(`masterData.${key}`)}
                  </Text>
                </Table.Th>
              ))}
              <Table.Th w={64} />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading
              ? Array.from({ length: 4 }, (_, i) => (
                  <Table.Tr key={i}>
                    {Array.from({ length: 4 }, (__, j) => (
                      <Table.Td key={j}>
                        <Skeleton height={14} width="60%" />
                      </Table.Td>
                    ))}
                  </Table.Tr>
                ))
              : filtered.map((item) => (
                  <Table.Tr key={item.id}>
                    <Table.Td>
                      <Text size="sm" fw={600} c="primary.9">
                        {item.name}
                      </Text>
                      {item.code && (
                        <Text size="xs" c="dimmed" ff="monospace">
                          {item.code}
                        </Text>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c={item.description ? undefined : 'dimmed'} lineClamp={2}>
                        {item.description || t('masterData.noDescription')}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Text size="sm" c="dimmed">
                        {formatDate(item.createdAt)}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Tooltip label={t('masterData.removeTooltip', { entity })}>
                        <ActionIcon
                          variant="subtle"
                          color="red"
                          aria-label={t('masterData.removeItem', { name: item.name })}
                          onClick={() => setPendingDelete(item)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Tooltip>
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
                    actionLabel={keyword ? undefined : t('masterData.add', { entity: entityLabel })}
                    onAction={keyword ? undefined : () => setModalOpened(true)}
                    actionIcon={<IconPlus size={16} />}
                  />
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>

      <MasterDataFormModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        entityLabel={entityLabel}
        namePlaceholder={namePlaceholder}
        isSubmitting={isCreating}
        onSubmit={onCreate}
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
    </Paper>
  );
}
