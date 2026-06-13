import axios from 'axios';
import { router } from 'expo-router';
import LocalStorage from '../providers/LocalStorage';

const apiClient = axios.create();

let logoutHandler = null;

export const setLogoutHandler = (handler) => {
    logoutHandler = handler;
};

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;
            if (status === 401) {
                // Clear tokens
                LocalStorage.remove('accessToken');
                LocalStorage.remove('refreshToken');


                // If we have a logout handler, use it to update state and redirect
                if (logoutHandler) {
                    logoutHandler();
                } else {
                    // Fallback to manual redirect if context is not yet initialized
                    setTimeout(() => {
                        router.replace('/login');
                    }, 100);
                }
            }
        }
        return Promise.reject(error);
    }
);

export default apiClient;
