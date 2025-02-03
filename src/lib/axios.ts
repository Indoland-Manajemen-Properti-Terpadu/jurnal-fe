import axios from 'axios';

export const axiosInstance = axios.create({
    baseURL: 'https://api-jurnal.proapps.id/',
});
