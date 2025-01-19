/* eslint-disable no-useless-catch */
import axios from 'axios';
import { BASE_URL } from './endpoint';

// Membuat instance axios dengan konfigurasi dasar
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Menambahkan interceptor untuk menangani request dan response
apiClient.interceptors.request.use(
  (config) => {
    // Misalnya, tambahkan token di header jika diperlukan
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) =>
    // Tangani error di sini, misalnya menampilkan notifikasi atau logging
     Promise.reject(error)

);

// Fungsi untuk melakukan GET request
export const get = async (url: string, params: any) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk melakukan POST request
export const post = async (url: string, data: any) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk melakukan PUT request
export const put = async (url: string, data: any) => {
  try {
    const response = await apiClient.put(url, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Fungsi untuk melakukan DELETE request
export const del = async (url: string) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default apiClient;
