import axios from 'axios';

const api = axios.create({
    // baseURL:  'https://marketplacebackend.oxmite.com/api',
    baseURL:  'https://backend.highlandgroup.ch/api',
    // baseURL:  'http://192.168.43.208:5000/api',

    
    
});

api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
