import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import type { MyAccess } from '../domain/access';
import type { Profile, UpdateProfileInput } from '../domain/profile';
import { PasswordChangeFailure, toPasswordChangeError } from './passwordError';
import type { MyPermissionsDto, ProfileDto } from './profileDto';
import { toMyAccess, toProfile } from './profileMapper';

/** The signed-in user; needs no right beyond being signed in. */
export const fetchProfile = async (): Promise<Profile> =>
  toProfile((await apiClient.get<ProfileDto>(API_USERS.ME)).data);

/** Answers without the `{ code, message, data }` envelope. */
export const fetchMyAccess = async (): Promise<MyAccess> =>
  toMyAccess((await apiClient.get<MyPermissionsDto>(API_USERS.MY_PERMISSIONS)).data);

/** Only for someone who may update users; the API refuses it for everyone else (403). */
export const updateProfile = async ({ id, name, email }: UpdateProfileInput): Promise<void> => {
  await apiClient.patch(API_USERS.USER(id), { name: name.trim(), email: email.trim() });
};

/** Answers 204. The API signs the user out of every device, so the caller must sign in again. */
export const changePassword = async (input: {
  currentPassword: string;
  newPassword: string;
}): Promise<void> => {
  try {
    await apiClient.post(API_USERS.MY_PASSWORD, input);
  } catch (error) {
    throw new PasswordChangeFailure(toPasswordChangeError(error));
  }
};
