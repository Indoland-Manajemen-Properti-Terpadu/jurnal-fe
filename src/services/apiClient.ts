/* eslint-disable linebreak-style */
import axios from 'axios';
import { navigate } from '@/router';
import { routes } from '@/router/routes';
import { BASE_URL } from './endpoint';
import { useAuthStore } from '@/store/useAuthentications';

const apiClient = axios.create({
  baseURL: BASE_URL,
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token: string) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    if (response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token: string) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
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
        const refreshResponse = await axios.post(`${BASE_URL}/v1/auth/refresh-tokens`, {
          refreshToken,
        });

        const {
          tokens: {
            access: { token: accessToken },
            refresh: { token: newRefreshToken },
          },
        } = refreshResponse.data;

        // Update Zustand store (this also updates localStorage)
        useAuthStore.getState().setTokens(accessToken, newRefreshToken);

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return await apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
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
