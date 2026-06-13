import LocalStorage from '../providers/LocalStorage';
import apiClient from './apiClient';

class Base {
    static BASE_URL_MS1 = process.env.EXPO_PUBLIC_API_BASE_URL_MS1;
    static BASE_URL_MS2 = process.env.EXPO_PUBLIC_API_BASE_URL_MS2;

    static getConfig = () => {
        return { headers: { Authorization: `Bearer ${LocalStorage.accessToken()}` } };
    };

    static get = (url, auth = true, baseUrl = Base.BASE_URL_MS1) => {
        let config = auth ? Base.getConfig() : {};
        return apiClient.get(baseUrl + url, config);
    };

    static post = (url, params = {}, auth = true, baseUrl = Base.BASE_URL_MS1) => {
        let config = auth ? Base.getConfig() : {};
        return apiClient.post(baseUrl + url, params, config);
    };

    static put = (url, params, auth = true, baseUrl = Base.BASE_URL_MS1) => {
        let config = auth ? Base.getConfig() : {};
        return apiClient.put(baseUrl + url, params, config);
    };

    static patch = (url, params, auth = true, baseUrl = Base.BASE_URL_MS1) => {
        let config = auth ? Base.getConfig() : {};
        return apiClient.patch(baseUrl + url, params, config);
    };

    static delete = (url, auth = true, baseUrl = Base.BASE_URL_MS1) => {
        let config = auth ? Base.getConfig() : {};
        return apiClient.delete(baseUrl + url, config);
    };
}

export default Base;
