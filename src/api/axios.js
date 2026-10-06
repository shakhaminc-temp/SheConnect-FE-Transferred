
import axios from 'axios';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').trim();

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the auth token in headers
api.interceptors.request.use(
    (config) => {
        const token = sessionStorage.getItem('token');
        if (token) {
            if (config.headers && typeof config.headers.set === 'function') {
                config.headers.set('Authorization', `Bearer ${token}`);
            } else {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;
        
        // Prevent infinite loops on /auth/refresh-token itself
        if (originalRequest.url === '/auth/refresh-token') {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('refresh_token');
            return Promise.reject(error);
        }

        // Do not intercept 401s for login requests
        if (originalRequest.url === '/auth/login' || originalRequest.url.endsWith('/auth/login')) {
            return Promise.reject(error);
        }

        if (error.response && error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = sessionStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error("No refresh token available");
                }
                
                // Do a raw axios call to avoid interceptor loops
                const res = await axios.post(
                    `${API_BASE_URL}/auth/refresh-token`,
                    {},
                    { headers: { Authorization: `Bearer ${refreshToken}` } }
                );

                if (res.status === 200) {
                    sessionStorage.setItem('token', res.data.access_token);
                    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.access_token}`;
                    if (originalRequest.headers && typeof originalRequest.headers.set === 'function') {
                        originalRequest.headers.set('Authorization', `Bearer ${res.data.access_token}`);
                    } else {
                        originalRequest.headers['Authorization'] = `Bearer ${res.data.access_token}`;
                    }
                    return api(originalRequest);
                }
            } catch (err) {
                console.error("Refresh token failed", err);
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('refresh_token');
                return Promise.reject(err);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
