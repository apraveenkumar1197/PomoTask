import axios from 'axios'
import LocalStorage from "../providers/LocalStorage";

class Base {

    static BASE_URL = "http://localhost:8000/";
    static accessToken = null;
    static refreshToken = null;

    static getConfig = () => {
        return { headers: { Authorization: `Bearer ${LocalStorage.accessToken()}`}}
    };

    static get = (url, auth = true) => {
        let config = Base.getConfig();
        if (!auth) {
            config = {}
        }
        return axios.get(Base.BASE_URL + url, config)
    }

    static post = (url, params = {}, auth = true) => {
        let config = Base.getConfig();
        if (!auth) {
            config = {}
        }
        return axios.post(Base.BASE_URL + url, params, config)
    }

    static put = (url, params, auth = true) => {
        let config = Base.getConfig();
        if (!auth) {
            config = {}
        }
        return axios.put(Base.BASE_URL + url, params, config)
    }

    static patch = (url, params, auth = true) => {
        let config = Base.getConfig();
        if (!auth) {
            config = {}
        }
        return axios.patch(Base.BASE_URL + url, params, config)
    }

    static delete = (url, auth = true) => {
        let config = Base.getConfig();
        if (!auth) {
            config = {}
        }
        return axios.delete(Base.BASE_URL + url, config)
    }
}



export default Base