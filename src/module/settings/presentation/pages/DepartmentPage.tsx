import { useState } from 'react';
import { Button, Group, Paper, Select, Stack, TextInput } from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import { IconPlus, IconRefresh, IconSearch } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import type { Department } from '@/module/settings/domain/department';
import { DepartmentDeleteDialog } from '@/module/settings/presentation/components/departments/DepartmentDeleteDialog';
import { DepartmentFormModal } from '@/module/settings/presentation/components/departments/DepartmentFormModal';
import { DepartmentTable } from '@/module/settings/presentation/components/departments/DepartmentTable';
import SettingsLayout from '@/module/settings/presentation/components/SettingsLayout';
import {
  useDepartmentErrorMessage,
  useDepartmentList,
  useDepartmentRights,
  useUpdateDepartment,
} from '@/module/settings/presentation/hooks/useDepartments';

type StatusFilter = 'active' | 'inactive';
const SEARCH_DELAY_MS = 300;

export default function DepartmentPage() {
  const { t: st } = useTranslation('settings');
  const rights = useDepartmentRights();
  const describe = useDepartmentErrorMessage();
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DELAY_MS);
  const [status, setStatus] = useState<StatusFilter | null>(null);
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<Department | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [deleting, setDeleting] = useState<Department | null>(null);

  const list = useDepartmentList({
    search,
    isActive: status === null ? undefined : status === 'active',
    page,
  });
  const toggle = useUpdateDepartment();

  const canCreate = rights.create;
  const canUpdate = rights.update;
  const canDelete = rights.delete;
  const hasFilters = search !== '' || status !== null;

  const openForm = (department: Department | null) => {
    setEditing(department);
    setFormOpen(true);
  };
  const resetFilters = () => {
    setSearchInput('');
    setStatus(null);
    setPage(1);
  };

  return (
    <SettingsLayout
      title={st('department.title')}
      description={st('department.description')}
      action={
        <Group gap="xs">
          <Button
            variant="default"
            leftSection={<IconRefresh size={16} />}
            loading={list.isFetching && !list.isLoading}
            onClick={() => list.refetch()}
          >
            {st('common.refresh')}
          </Button>
          {canCreate && (
            <Button
              color="primary"
              leftSection={<IconPlus size={16} />}
              onClick={() => openForm(null)}
            >
              {st('department.addNew')}
            </Button>
          )}
        </Group>
      }
    >
      <Paper withBorder radius="lg" p="md" bg="white">
        <Stack gap="md">
          <Group gap="sm" wrap="wrap">
            <TextInput
              placeholder={st('department.search')}
              aria-label={st('department.search')}
              leftSection={<IconSearch size={16} />}
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.currentTarget.value);
                setPage(1);
              }}
              w={{ base: '100%', sm: 260 }}
              radius="md"
            />
            <Select
              aria-label={st('department.filterStatus')}
              placeholder={`${st('department.filterStatus')}: ${st('department.filterAll')}`}
              data={(['active', 'inactive'] as const).map((value) => ({
                value,
                label: st(`department.status.${value}`),
              }))}
              value={status}
              onChange={(value) => {
                setStatus(value as StatusFilter | null);
                setPage(1);
              }}
              clearable
              radius="md"
              w={{ base: '100%', sm: 190 }}
            />
          </Group>
          <DepartmentTable
            data={list.data}
            loading={list.isLoading}
            failed={list.isError}
            hasFilters={hasFilters}
            canCreate={canCreate}
            canUpdate={canUpdate}
            canDelete={canDelete}
            statusPendingId={toggle.isPending ? toggle.variables?.id : undefined}
            onRetry={() => list.refetch()}
            onResetFilters={resetFilters}
            onAddNew={() => openForm(null)}
            onPageChange={setPage}
            onEdit={openForm}
            onToggleStatus={(department) =>
              toggle.mutate(
                { id: department.id, input: { isActive: !department.isActive } },
                {
                  onError: (error) =>
                    notifications.show({
                      color: 'red',
                      title: st('notify.failure'),
                      message: describe(error),
                    }),
                }
              )
            }
            onDelete={setDeleting}
          />
        </Stack>
      </Paper>

      <DepartmentFormModal
        opened={formOpen}
        department={editing}
        onClose={() => setFormOpen(false)}
      />
      <DepartmentDeleteDialog
        department={deleting}
        canDeactivate={canUpdate}
        onClose={() => setDeleting(null)}
      />
    </SettingsLayout>
  );
}
