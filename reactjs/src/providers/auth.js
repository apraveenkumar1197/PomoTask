import React, {useState, useContext, createContext} from "react";

const AuthContext = createContext(null)

export const AuthProvider = ({children}) => {
    const [user, setUser] = useState(null)

    const login = (user) => {
        setUser(user)
    }
    const logout = (user) => {
        setUser(user)
    }
    console.log(children)
    return <AuthContext.Provier value={{user, login, logout}}>
        {children}
    </AuthContext.Provier>
}

export const useAuth = () => {
    return useContext(AuthContext)
}