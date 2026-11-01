import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import type {
  CreateUserInput,
  ManagedUser,
  UpdateUserInput,
  UserList,
  UserListParams,
} from '@/module/user-management/domain/userTypes';
import type { PaginatedDto, UserDto } from './dto';
import { toManagedUser, toPaginated } from './mappers';

// The default client rejects on an HTTP error, so the queries report `isError`.

export const fetchUsers = async (params: Partial<UserListParams> = {}): Promise<UserList> => {
  const response = await apiClient.get<PaginatedDto<UserDto>>(API_USERS.GET_ALL_USER, {
    params: { ...params, sortBy: 'createdAt:desc' },
  });
  return toPaginated(response.data, toManagedUser);
};

export const createUser = async (input: CreateUserInput): Promise<ManagedUser> => {
  const { accessRoleIds, ...rest } = input;
  const response = await apiClient.post<UserDto>(API_USERS.GET_ALL_USER, {
    ...rest,
    accessRole: accessRoleIds,
  });
  return toManagedUser(response.data);
};

export const updateUser = async (id: string, input: UpdateUserInput): Promise<ManagedUser> => {
  const { accessRoleIds, ...rest } = input;
  const body = accessRoleIds === undefined ? rest : { ...rest, accessRole: accessRoleIds };
  return toManagedUser((await apiClient.patch<UserDto>(API_USERS.USER(id), body)).data);
};
