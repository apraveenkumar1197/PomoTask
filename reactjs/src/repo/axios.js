import axios from './axios';
import {RoutePath} from "../constants/RoutePath";

axios.interceptors.response.use(
    function (response) {
        return response;
    },
    function (error) {
        if (error.response) {
            const status = error.response.status;
            if(status === 401 || status === 403){
                window.location.href = RoutePath.Login
            }
        }
        return Promise.reject(error);
    }
);

export default axios;