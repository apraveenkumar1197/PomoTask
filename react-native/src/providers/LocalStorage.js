import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const webPrefix = 'pomotask:';
const storageKey = (key) => Platform.OS === 'web' ? webPrefix + key : key;

class LocalStorage {
    static _cache = {};

    static init = async () => {
        try {
            const storedKeys = await AsyncStorage.getAllKeys();
            const keys = Platform.OS === 'web'
                ? storedKeys.filter(key => key.startsWith(webPrefix))
                : storedKeys;
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
        return this._cache[storageKey(key)] || null;
    }

    static set = (key, value) => {
        this._cache[storageKey(key)] = value;
        AsyncStorage.setItem(storageKey(key), value).catch(e => console.error(`Failed to set ${key} in AsyncStorage`, e));
    }

    static remove = (key) => {
        delete this._cache[storageKey(key)];
        AsyncStorage.removeItem(storageKey(key)).catch(e => console.error(`Failed to remove ${key} from AsyncStorage`, e));
    }
}

export default LocalStorage;
