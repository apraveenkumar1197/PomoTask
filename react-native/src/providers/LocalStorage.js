import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorage {
    static _cache = {};

    static init = async () => {
        try {
            const keys = await AsyncStorage.getAllKeys();
            const pairs = await AsyncStorage.multiGet(keys);
            pairs.forEach(([key, value]) => {
                this._cache[key] = value;
            });
        } catch (e) {
            console.error("Failed to load LocalStorage cache", e);
        }
    }

    static accessToken = (value = null) => {
        if (value !== null) {
            LocalStorage.set("accessToken", value);
        }
        return LocalStorage.get("accessToken");
    }

    static refreshToken = (value = null) => {
        if (value !== null) {
            LocalStorage.set("refreshToken", value);
        }
        return LocalStorage.get("refreshToken");
    }

    static get = (key) => {
        return this._cache[key] || null;
    }

    static set = (key, value) => {
        this._cache[key] = value;
        AsyncStorage.setItem(key, value).catch(e => console.error(`Failed to set ${key} in AsyncStorage`, e));
    }

    static remove = (key) => {
        delete this._cache[key];
        AsyncStorage.removeItem(key).catch(e => console.error(`Failed to remove ${key} from AsyncStorage`, e));
    }
}

export default LocalStorage;
