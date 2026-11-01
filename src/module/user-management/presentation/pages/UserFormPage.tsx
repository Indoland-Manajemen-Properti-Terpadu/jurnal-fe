import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Collapse,
  Grid,
  Group,
  Skeleton,
  Stack,
  Switch,
  Text,
  TextInput,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconInfoCircle,
  IconKey,
  IconShieldLock,
  IconUser,
  IconUserCheck,
} from '@tabler/icons-react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AppShellLayout } from '@/components/AppShellLayout';
import { EmptyState } from '@/components/EmptyState';
import { ModuleHeader } from '@/components/ModuleHeader/ModuleHeader';
import { useTranslation } from '@/i18n';
import { routes } from '@/router/routes';
import { combineRoles } from '@/module/user-management/domain/grantRules';
import {
  deactivateBlockReason,
  isPasswordValid,
  removesLastSuperAdmin,
} from '@/module/user-management/domain/userRules';
import type { ManagedUser } from '@/module/user-management/domain/userTypes';
import { DeactivateUserModal } from '@/module/user-management/presentation/components/DeactivateUserModal';
import { FormCard } from '@/module/user-management/presentation/components/FormCard';
import { PasswordField } from '@/module/user-management/presentation/components/PasswordField';
import { RolePicker } from '@/module/user-management/presentation/components/RolePicker';
import { RoleSummaryCard } from '@/module/user-management/presentation/components/RoleSummaryCard';
import { UnsavedChangesGuard } from '@/module/user-management/presentation/components/UnsavedChangesGuard';
import { useMyGrants, useMyId } from '@/module/user-management/presentation/hooks/useMyGrants';
import { useRoleMenus } from '@/module/user-management/presentation/hooks/useRoleMenus';
import { useRoles } from '@/module/user-management/presentation/hooks/useRoles';
import {
  useCreateUser,
  useUpdateUser,
} from '@/module/user-management/presentation/hooks/useUserMutations';
import { useUsers } from '@/module/user-management/presentation/hooks/useUsers';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SITE_USERS_LIMIT = 100;

const sameIds = (a: string[], b: string[]) =>
  a.length === b.length && [...a].sort().join() === [...b].sort().join();

export default function UserFormPage({ mode }: Readonly<{ mode: 'add' | 'edit' }>) {
  const { t } = useTranslation('userManagement');
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const location = useLocation();
  const { grants } = useMyGrants();
  const { data: myId } = useMyId();
  const roles = useRoles();
  const menus = useRoleMenus();
  const siteUsers = useUsers({ page: 1, limit: SITE_USERS_LIMIT }, { enabled: mode === 'edit' });

  // The list passes the row along; opening the link directly falls back to the first users page.
  const passed = (location.state as { user?: ManagedUser } | null)?.user;
  const user: ManagedUser | undefined =
    mode === 'edit'
      ? (passed ?? siteUsers.data?.results.find((item) => item.id === userId))
      : undefined;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [roleIds, setRoleIds] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [password, setPassword] = useState('');
  const [resetPassword, setResetPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [confirmingOff, setConfirmingOff] = useState(false);
  const [loaded, setLoaded] = useState(mode === 'add');
  const leaving = useRef(false);

  useEffect(() => {
    if (loaded || !user) return;
    setName(user.name);
    setEmail(user.email);
    setRoleIds(user.accessRoleIds);
    setIsActive(user.isActive);
    setLoaded(true);
  }, [loaded, user]);

  const goBack = () => {
    leaving.current = true;
    navigate(routes.userManagement.main);
  };
  const create = useCreateUser(goBack);
  const update = useUpdateUser(userId ?? '', goBack);
  const saving = create.isPending || update.isPending;

  const allRoles = useMemo(() => roles.data ?? [], [roles.data]);
  const selectedRoles = allRoles.filter((role) => roleIds.includes(role.id));
  const effective = useMemo(() => combineRoles(selectedRoles), [selectedRoles]);

  const errors = {
    name: name.trim() === '' ? t('userForm.nameRequired') : undefined,
    email: EMAIL_PATTERN.test(email.trim()) ? undefined : t('userForm.emailInvalid'),
    roles: roleIds.length === 0 ? t('userForm.accessRequired') : undefined,
    password:
      (mode === 'add' || resetPassword) && !isPasswordValid(password)
        ? t('userForm.ruleLength')
        : undefined,
  };
  const invalid = Boolean(errors.name || errors.email || errors.roles || errors.password);
  const show = (message?: string) => (touched ? message : undefined);

  const sitePeople = siteUsers.data?.results ?? [];
  const offBlock = user
    ? deactivateBlockReason({ user, currentUserId: myId, roles: allRoles, siteUsers: sitePeople })
    : null;
  const lastSuperAdminLost = user
    ? removesLastSuperAdmin({ user, nextRoleIds: roleIds, roles: allRoles, siteUsers: sitePeople })
    : false;

  const dirty =
    mode === 'add'
      ? name !== '' || email !== '' || roleIds.length > 0 || password !== ''
      : user !== undefined &&
        (name !== user.name ||
          email !== user.email ||
          isActive !== user.isActive ||
          !sameIds(roleIds, user.accessRoleIds) ||
          (resetPassword && password !== ''));

  const submit = () => {
    if (mode === 'add') {
      create.mutate({ name: name.trim(), email: email.trim(), password, accessRoleIds: roleIds });
      return;
    }
    if (!user) return;
    update.mutate({
      ...(name !== user.name && { name: name.trim() }),
      ...(email !== user.email && { email: email.trim() }),
      ...(isActive !== user.isActive && { isActive }),
      ...(!sameIds(roleIds, user.accessRoleIds) && { accessRoleIds: roleIds }),
      ...(resetPassword && password !== '' && { password }),
    });
  };

  const save = () => {
    setTouched(true);
    if (invalid || lastSuperAdminLost || (mode === 'edit' && !dirty)) return;
    if (mode === 'edit' && user?.isActive && !isActive) {
      setConfirmingOff(true);
      return;
    }
    submit();
  };

  let body;
  if (mode === 'edit' && !user && !siteUsers.isLoading) {
    body = (
      <EmptyState
        title={t('userForm.notFoundTitle')}
        description={t('userForm.notFoundDescription')}
        actionLabel={t('common.back')}
        onAction={() => navigate(routes.userManagement.main)}
      />
    );
  } else if (!loaded) {
    body = <Skeleton height={320} radius="md" />;
  } else {
    body = (
      <Grid gutter="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Stack gap="lg">
            <FormCard
              icon={IconUser}
              title={t('userForm.detailsTitle')}
              subtitle={t('userForm.detailsSubtitle')}
            >
              <TextInput
                label={t('userForm.name')}
                placeholder={t('userForm.namePlaceholder')}
                withAsterisk
                value={name}
                onChange={(event) => setName(event.currentTarget.value)}
                error={show(errors.name)}
              />
              <TextInput
                label={t('userForm.email')}
                placeholder={t('userForm.emailPlaceholder')}
                type="email"
                withAsterisk
                value={email}
                onChange={(event) => setEmail(event.currentTarget.value)}
                error={show(errors.email)}
              />
            </FormCard>

            <FormCard
              icon={IconShieldLock}
              title={t('userForm.accessTitle')}
              subtitle={t('userForm.accessSubtitle')}
            >
              <RolePicker
                roles={allRoles}
                selected={roleIds}
                held={user?.accessRoleIds ?? []}
                grants={grants}
                error={show(errors.roles)}
                onChange={setRoleIds}
              />
              {lastSuperAdminLost && (
                <Alert color="yellow" variant="light" icon={<IconInfoCircle size={18} />}>
                  {t('userForm.removesLastSuperAdmin')}
                </Alert>
              )}
            </FormCard>

            <FormCard
              icon={IconKey}
              title={t('userForm.passwordTitle')}
              subtitle={mode === 'add' ? t('userForm.passwordSubtitle') : undefined}
            >
              {mode === 'add' ? (
                <PasswordField
                  value={password}
                  label={t('userForm.password')}
                  error={show(errors.password)}
                  onChange={setPassword}
                />
              ) : (
                <Stack gap="sm">
                  <Switch
                    label={t('userForm.resetToggle')}
                    checked={resetPassword}
                    onChange={(event) => {
                      setResetPassword(event.currentTarget.checked);
                      setPassword('');
                    }}
                  />
                  <Collapse in={resetPassword}>
                    <Stack gap="sm">
                      <Alert color="yellow" variant="light" icon={<IconInfoCircle size={18} />}>
                        {t('userForm.resetWarning')}
                      </Alert>
                      <PasswordField
                        value={password}
                        label={t('userForm.passwordNew')}
                        error={show(errors.password)}
                        onChange={setPassword}
                      />
                    </Stack>
                  </Collapse>
                </Stack>
              )}
            </FormCard>

            {mode === 'edit' && (
              <FormCard icon={IconUserCheck} title={t('userForm.statusTitle')}>
                <Switch
                  label={t('userForm.statusLabel')}
                  description={offBlock ? t(`users.blocked.${offBlock}`) : t('userForm.statusHelp')}
                  checked={isActive}
                  disabled={Boolean(offBlock) && isActive}
                  onChange={(event) => setIsActive(event.currentTarget.checked)}
                />
              </FormCard>
            )}

            <Group justify="flex-end">
              <Button
                variant="default"
                onClick={() => navigate(routes.userManagement.main)}
                disabled={saving}
              >
                {t('common.cancel')}
              </Button>
              <Button onClick={save} loading={saving} disabled={mode === 'edit' && !dirty}>
                {saving
                  ? t('userForm.saving')
                  : t(mode === 'add' ? 'userForm.create' : 'userForm.update')}
              </Button>
            </Group>
            {mode === 'edit' && !dirty && (
              <Text size="xs" c="dimmed" ta="right">
                {t('userForm.unchanged')}
              </Text>
            )}
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Box pos={{ lg: 'sticky' }} top={20}>
            <RoleSummaryCard
              title={t('userForm.effectiveTitle')}
              subtitle={t('userForm.effectiveSubtitle')}
              emptyText={t('userForm.effectiveEmpty')}
              menus={menus.data ?? []}
              permissions={effective}
            />
          </Box>
        </Grid.Col>
      </Grid>
    );
  }

  return (
    <AppShellLayout>
      <Box p={{ base: 'md', sm: 'xl' }}>
        <Stack gap="lg">
          <ModuleHeader
            icon={IconUser}
            title={t(mode === 'add' ? 'userForm.addTitle' : 'userForm.editTitle')}
            description={t(mode === 'add' ? 'userForm.addDescription' : 'userForm.editDescription')}
            breadcrumbs={[
              { label: t('userForm.crumbRoot'), to: routes.userManagement.main },
              {
                label: user?.name || t(mode === 'add' ? 'userForm.addTitle' : 'userForm.editTitle'),
              },
            ]}
            actions={
              <Button
                variant="default"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(routes.userManagement.main)}
              >
                {t('common.back')}
              </Button>
            }
          />
          {body}
        </Stack>
      </Box>
      <DeactivateUserModal
        opened={confirmingOff}
        name={user?.name || user?.email || ''}
        blocked={null}
        isPending={saving}
        onClose={() => setConfirmingOff(false)}
        onConfirm={() => {
          setConfirmingOff(false);
          submit();
        }}
      />
      <UnsavedChangesGuard
        when={() => dirty && !leaving.current}
        title={t('userForm.leaveTitle')}
        body={t('userForm.leaveBody')}
        leaveLabel={t('userForm.leaveConfirm')}
        stayLabel={t('userForm.leaveStay')}
      />
    </AppShellLayout>
  );
}
