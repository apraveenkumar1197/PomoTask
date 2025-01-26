
class LocalStorage {

    static accessToken = (value= null) => {
        if(value !== null) LocalStorage.set("accessToken", value)
        value = LocalStorage.get("accessToken")
        return value
    }
    static refreshToken = (value) => {
        if(value === null) LocalStorage.set("refreshToken", value)
        value = LocalStorage.get("refreshToken")
        return value
    }


    static get = (key) => {
        return localStorage.getItem(key)
    }
    static set = (key, value) => {
        return localStorage.setItem(key, value)
    }

}

export default LocalStorage