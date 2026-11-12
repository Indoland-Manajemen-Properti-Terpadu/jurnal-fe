import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/http/apiClient';
import { API_USERS } from '@/lib/http/endpoints';
import { useAuthStore } from '@/store/useAuthentications';
import {
  toSessionProfile,
  type SessionProfile,
  type SessionProfileDto,
} from '@/components/UserMenu/sessionProfile';

/**
 * The signed-in user for the header menu. It owns its own read of `GET /v1/users/me` (the profile
 * page has its own), and its key carries the token, so one user's data is never shown to the next.
 */
export const useSessionProfile = () => {
  const accessToken = useAuthStore((state) => state.accessToken);
  return useQuery<SessionProfile>({
    queryKey: ['session', 'me', accessToken],
    queryFn: async () =>
      toSessionProfile((await apiClient.get<SessionProfileDto>(API_USERS.ME)).data),
    enabled: Boolean(accessToken),
    staleTime: 5 * 60_000,
  });
};
