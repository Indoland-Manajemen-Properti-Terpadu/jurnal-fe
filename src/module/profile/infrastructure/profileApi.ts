import axios from 'axios';
import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import type { Profile, UpdateProfileInput } from '../domain/profile';
import type { ApiMessageDto, ProfileDto } from './profileDto';
import { toProfile, toUpdateRequest } from './profileMapper';

const bodyMessage = (body?: ApiMessageDto): string | undefined =>
  body?.data?.message || body?.message;

export const fetchProfile = async (): Promise<Profile> => {
  const response = await apiClient.get<ProfileDto>(API_USERS.GET_USER_DETAIL);
  return toProfile(response.data);
};

/**
 * Throws an `Error` whose message is the server message, or an empty string when the
 * server sent none (the caller supplies the localized fallback).
 */
export const updateProfile = async (input: UpdateProfileInput): Promise<void> => {
  try {
    const response = await apiClient.patch<ApiMessageDto>(
      `/v1/users/${input.id}`,
      toUpdateRequest(input)
    );
    const body = response.data;
    if (body && (response.status >= 400 || (body.code ?? 0) >= 400)) {
      throw new Error(bodyMessage(body) ?? '');
    }
  } catch (error) {
    if (axios.isAxiosError<ApiMessageDto>(error)) {
      throw new Error(error.response?.data?.message || error.message || '');
    }
    throw error;
  }
};
