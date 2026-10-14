/* eslint-disable linebreak-style */
import axios from 'axios';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { BASE_URL, API_AUTH } from './endpoint';
import { useAuthStore } from '@/store/useAuthentications';
import { useApiLoadingStore } from '@/store/useApiLoading';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let refreshSubscribers: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

const subscribeTokenRefresh = (
  resolve: (token: string) => void,
  reject: (error: any) => void
) => {
  refreshSubscribers.push({ resolve, reject });
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach(({ resolve }) => resolve(token));
  refreshSubscribers = [];
};

const onRefreshError = (error: any) => {
  refreshSubscribers.forEach(({ reject }) => reject(error));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    useApiLoadingStore.getState().startRequest();

    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    useApiLoadingStore.getState().finishRequest();
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    useApiLoadingStore.getState().finishRequest();
    return response;
  },
  async (error) => {
    useApiLoadingStore.getState().finishRequest();

    const { config, response } = error;
    const originalRequest = config;

    const isAuthEndpoint =
      originalRequest?.url?.includes('/v1/auth/login') ||
      originalRequest?.url?.includes('/v1/auth/refresh-tokens') ||
      originalRequest?.url?.includes('/v1/auth/register') ||
      originalRequest?.url?.includes('/v1/auth/oauth');

    if (response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh(
            (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            (refreshErr: any) => {
              reject(refreshErr);
            }
          );
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        isRefreshing = false;
        useAuthStore.getState().clearTokens();
        navigate(routes.login);
        return Promise.reject(error);
      }

      try {
        const refreshEndpoint = API_AUTH.POST_REFRESH_TOKEN.startsWith('http')
          ? API_AUTH.POST_REFRESH_TOKEN
          : `${BASE_URL}${API_AUTH.POST_REFRESH_TOKEN}`;

        const refreshResponse = await axios.post(refreshEndpoint, {
          refreshToken,
        });

        const resBody = refreshResponse.data;
        const payload = resBody?.data || resBody?.tokens || resBody;

        const accessToken = payload?.access?.token;
        const newRefreshToken = payload?.refresh?.token || refreshToken;

        if (!accessToken) {
          throw new Error('Refresh token response missing access token');
        }

        // Update Zustand store (this also updates localStorage)
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        onRefreshError(refreshError);
        useAuthStore.getState().clearTokens();
        navigate(routes.login);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const get = async (url: string, params?: any) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error: any) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const download = async (url: string, params?: any) => {
  try {
    const response = await apiClient.get(url, { params, responseType: 'blob' });
    return response;
  } catch (error: any) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const postV2 = async (url: string, data: any) => {
  try {
    const response = await apiClient.post(url, data);
    return response;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const post = async (url: string, data: any) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const put = async (url: string, data: any) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const del = async (url: string, data?: any) => {
  try {
    const response = await apiClient.delete(url, { data });
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export const patch = async (url: string, data: any) => {
  try {
    const response = await apiClient.patch(url, data);
    return response.data;
  } catch (error) {
    console.error(error);
    if (axios.isAxiosError(error)) {
      return error.response;
    }
    return null;
  }
};

export default apiClient;
