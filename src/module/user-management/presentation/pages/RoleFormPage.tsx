import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Grid,
  Group,
  Skeleton,
  Stack,
  Textarea,
  TextInput,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEdit,
  IconInfoCircle,
  IconKey,
  IconShieldLock,
} from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import {
  applyRolePermissions,
  buildRolePayload,
  createInitialPermissions,
  type MenuPermission,
} from '@/module/user-management/domain/rolePermissions';
import { FormCard } from '@/module/user-management/presentation/components/FormCard';
import { PermissionMatrix } from '@/module/user-management/presentation/components/PermissionMatrix';
import { RoleSummaryCard } from '@/module/user-management/presentation/components/RoleSummaryCard';
import { UnsavedChangesGuard } from '@/module/user-management/presentation/components/UnsavedChangesGuard';
import { useMyGrants } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useRoleMenus } from '@/module/user-management/presentation/hooks/useRoleMenus';
import {
  useCreateRole,
  useUpdateRole,
} from '@/module/user-management/presentation/hooks/useRoleMutations';
import { useRole } from '@/module/user-management/presentation/hooks/useRoles';

export type RoleFormMode = 'add' | 'view' | 'edit';

const samePermissions = (a: MenuPermission[], b: MenuPermission[]) =>
  JSON.stringify(a) === JSON.stringify(b);

export default function RoleFormPage({ mode }: Readonly<{ mode: RoleFormMode }>) {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { grants, canRoles } = useMyGrants();
  const menusQuery = useRoleMenus();
  const roleQuery = useRole(mode === 'add' ? undefined : id);
  const menus = useMemo(() => menusQuery.data ?? [], [menusQuery.data]);
  const role = roleQuery.data;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<MenuPermission[]>([]);
  const [initial, setInitial] = useState<{
    name: string;
    description: string;
    permissions: MenuPermission[];
  } | null>(null);
  const [touched, setTouched] = useState(false);
  const leaving = useRef(false);

  const ready = menus.length > 0 && (mode === 'add' || role !== undefined);
  useEffect(() => {
    if (!ready || initial) return;
    const start = {
      name: role?.name ?? '',
      description: role?.description ?? '',
      permissions: role
        ? applyRolePermissions(menus, role.permissions)
        : createInitialPermissions(menus),
    };
    setInitial(start);
    setName(start.name);
    setDescription(start.description);
    setPermissions(start.permissions);
  }, [ready, initial, role, menus]);

  const goBack = () => {
    leaving.current = true;
    navigate(routes.userManagement.main);
  };
  const create = useCreateRole(goBack);
  const update = useUpdateRole(id ?? '', goBack);
  const saving = create.isPending || update.isPending;

  const readOnly = mode === 'view' || Boolean(role?.isDefault);
  const dirty =
    initial !== null &&
    (name !== initial.name ||
      description !== initial.description ||
      !samePermissions(permissions, initial.permissions));
  const nameMissing = name.trim() === '';

  const save = () => {
    setTouched(true);
    if (nameMissing || !dirty) return;
    const payload = buildRolePayload(menus, name, description, permissions);
    if (mode === 'edit') update.mutate(payload);
    else create.mutate(payload);
  };

  const header = (
    <ModuleHeader
      icon={IconShieldLock}
      title={t(`roleForm.${mode}Title`)}
      description={t(`roleForm.${mode}Description`)}
      breadcrumbs={[
        { label: t('roleForm.crumbRoot'), to: routes.userManagement.main },
        { label: role?.name ?? t(`roleForm.${mode}Title`) },
      ]}
      actions={
        <>
          <Button
            variant="default"
            leftSection={<IconArrowLeft size={16} />}
            onClick={() => navigate(routes.userManagement.main)}
          >
            {t('common.back')}
          </Button>
          {mode === 'view' && role && !role.isDefault && canRoles('update') && (
            <Button
              leftSection={<IconEdit size={16} />}
              onClick={() => navigate(routes.userManagement.editRole.replace(':id', role.id))}
            >
              {t('roles.menu.edit')}
            </Button>
          )}
        </>
      }
    />
  );

  let body;
  if (mode !== 'add' && roleQuery.isError) {
    body = (
      <EmptyState
        title={t('roleForm.notFoundTitle')}
        description={t('roleForm.notFoundDescription')}
        actionLabel={t('common.back')}
        onAction={() => navigate(routes.userManagement.main)}
      />
    );
  } else if (menusQuery.isError) {
    body = (
      <Alert color="red" variant="light">
        {t('roleForm.menusFailed')}
      </Alert>
    );
  } else if (!initial) {
    body = <Skeleton height={320} radius="md" />;
  } else {
    body = (
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            {role?.isDefault && (
              <Alert color="blue" variant="light" icon={<IconInfoCircle size={18} />}>
                {t('roleForm.defaultBanner')}
              </Alert>
            )}
            <FormCard
              icon={IconKey}
              title={t('roleForm.infoTitle')}
              subtitle={t('roleForm.infoSubtitle')}
            >
              <TextInput
                label={t('roleForm.name')}
                placeholder={t('roleForm.namePlaceholder')}
                withAsterisk={!readOnly}
                readOnly={readOnly}
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                error={touched && nameMissing ? t('roleForm.nameRequired') : undefined}
              />
              <Textarea
                label={t('roleForm.description')}
                placeholder={t('roleForm.descriptionPlaceholder')}
                readOnly={readOnly}
                autosize
                minRows={2}
                maxRows={5}
                value={description}
                onChange={(event) => setDescription(event.currentTarget.value)}
              />
            </FormCard>
            <FormCard
              icon={IconShieldLock}
              title={t('roleForm.matrixTitle')}
              subtitle={readOnly ? undefined : t('roleForm.matrixSubtitle')}
            >
              <PermissionMatrix
                menus={menus}
                permissions={permissions}
                original={initial.permissions}
                grants={grants}
                readOnly={readOnly}
                onChange={setPermissions}
              />
            </FormCard>
            {!readOnly && (
              <Group justify="flex-end">
                <Button
                  variant="default"
                  onClick={() => navigate(routes.userManagement.main)}
                  disabled={saving}
                >
                  {t('common.cancel')}
                </Button>
                <Button onClick={save} loading={saving} disabled={!dirty && touched}>
                  {saving
                    ? t('roleForm.saving')
                    : t(mode === 'edit' ? 'roleForm.update' : 'roleForm.create')}
                </Button>
              </Group>
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Box pos={{ lg: 'sticky' }} top={20}>
            <RoleSummaryCard menus={menus} permissions={permissions} withGuidance={!readOnly} />
          </Box>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          {header}
          {body}
        </Stack>
      </Box>
      <UnsavedChangesGuard
        when={() => dirty && !leaving.current && !readOnly}
        title={t('roleForm.leaveTitle')}
        body={t('roleForm.leaveBody')}
        leaveLabel={t('roleForm.leaveConfirm')}
        stayLabel={t('roleForm.leaveStay')}
      />
    </AppShellLayout>
  );
}
