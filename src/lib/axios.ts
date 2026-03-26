import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'https://jurnal-api.proapps.id',
});
