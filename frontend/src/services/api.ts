import axios from 'axios';

export const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000/api').replace('/api', '');
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const getImageUrl = (url?: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('data:')) return url;
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    return `${BASE_URL.replace(/\/$/, '')}/${cleanPath}`;
};

// Add a request interceptor to add the auth token to every request
import { getDeviceFingerprint } from '../utils/fingerprint';

// ... existing code ...

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Add Device Fingerprint
        let fingerprint = localStorage.getItem('device_fingerprint');
        if (!fingerprint) {
            fingerprint = await getDeviceFingerprint();
            localStorage.setItem('device_fingerprint', fingerprint);
        }
        config.headers['X-Device-Fingerprint'] = fingerprint;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Clear token and redirect to login if unauthorized
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Only redirect if not already on auth page
            if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);
