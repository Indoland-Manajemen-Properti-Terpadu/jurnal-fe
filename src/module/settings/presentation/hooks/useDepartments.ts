import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notifications } from '@mantine/notifications';
import { useTranslation } from '@/i18n';
import { describeApiError } from '@/lib/http/apiError';
import type { DepartmentInput } from '@/module/settings/domain/department';
import {
  createDepartment,
  deleteDepartment,
  fetchDepartments,
  updateDepartment,
  type DepartmentListParams,
} from '@/module/settings/infrastructure/departmentApi';
import { fetchMenuRights, type MenuRights } from '@/module/settings/infrastructure/myRightsApi';
import { DEPARTMENT_MENU } from '@/module/settings/domain/department';
import { settingKeys } from '@/module/settings/presentation/hooks/settingKeys';

export const useDepartmentList = (params: DepartmentListParams = {}) =>
  useQuery({
    queryKey: settingKeys.departmentList(params),
    queryFn: () => fetchDepartments(params),
    placeholderData: keepPreviousData,
  });

/** A safe sentence for a failed department call (the server's Indonesian refusal for Indonesian readers). */
export const useDepartmentErrorMessage = () => {
  const { t: st, currentLanguage } = useTranslation('settings');
  return (error: unknown) =>
    describeApiError(error, currentLanguage, {
      rejected: st('department.errors.rejected'),
      forbidden: st('department.errors.forbidden'),
      validation: st('department.errors.validation'),
      unauthorized: st('department.errors.unauthorized'),
      notFound: st('department.errors.notFound'),
      network: st('department.errors.network'),
      generic: st('department.errors.generic'),
    });
};

const useAfterWrite = () => {
  const { t: st } = useTranslation('settings');
  const queryClient = useQueryClient();
  return {
    st,
    succeed: (message: string) => {
      queryClient.invalidateQueries({ queryKey: settingKeys.departments() });
      notifications.show({ color: 'teal', title: st('notify.success'), message });
    },
  };
};

export const useCreateDepartment = () => {
  const { st, succeed } = useAfterWrite();
  return useMutation({
    mutationFn: (input: DepartmentInput) => createDepartment(input),
    onSuccess: () => succeed(st('department.notify.created')),
  });
};

export const useUpdateDepartment = () => {
  const { st, succeed } = useAfterWrite();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Partial<DepartmentInput> }) =>
      updateDepartment(id, input),
    onSuccess: () => succeed(st('department.notify.updated')),
  });
};

export const useDeleteDepartment = () => {
  const { st, succeed } = useAfterWrite();
  return useMutation({
    mutationFn: (id: string) => deleteDepartment(id),
    onSuccess: () => succeed(st('department.notify.deleted')),
  });
};

const NO_RIGHTS: MenuRights = { create: false, read: false, update: false, delete: false };

/** The signed-in person's rights on the Departments menu; nothing is offered until they are known. */
export const useDepartmentRights = (): MenuRights => {
  const { data } = useQuery({
    queryKey: [...settingKeys.all, 'rights', DEPARTMENT_MENU],
    queryFn: () => fetchMenuRights(DEPARTMENT_MENU),
    staleTime: 60_000,
  });
  return data ?? NO_RIGHTS;
};
