/* eslint-disable linebreak-style */
import axios from 'axios';
import { navigate, routes } from '@/router';
import { BASE_URL } from './endpoint';
import { blob } from 'stream/consumers';

const apiClient = axios.create({
  baseURL: BASE_URL,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, Promise.reject);

apiClient.interceptors.response.use(
  (response) => response, // Directly return successful responses.
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried to avoid infinite loops.
      try {
        const refreshToken = localStorage.getItem('refreshToken'); // Retrieve the stored refresh token.
        // Make a request to your auth server to refresh the token.
        const response = await apiClient.post(`${BASE_URL}/v1/auth/refresh-tokens`, {
          refreshToken,
        });
        const {
          tokens: {
            access: { token: accessToken },
            refresh: { token: newRefreshToken },
          },
        } = response.data;
        // Store the new access and refresh tokens.
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefreshToken);
        // Update the authorization header with the new access token.
        return await apiClient(originalRequest); // Retry the original request with the new access token.
      } catch (refreshError) {
        // Handle refresh token errors by clearing stored tokens and redirecting to the login page.
        // console.error('Token refresh failed:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate(routes.login);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error); // For all other errors, return the error as is.
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
