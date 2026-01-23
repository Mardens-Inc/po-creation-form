import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {getApiRoute} from "../api_route.ts";

type User = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    role: UserRole;
}

enum UserRole
{
    Admin = 0,
    Buyer = 1,
    Warehouse = 2,
}

interface AuthenticationContextType
{
    isAuthenticated: boolean;
    me: ()=>Promise<User | undefined>;
    login: (email: string, password: string)=>Promise<User | undefined>;
    register: (user: User)=>Promise<User | undefined>;
    logout: ()=>void;
}

const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export function AuthenticationProvider({children}: { children: ReactNode })
{
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [apiUrl, setApiUrl] = useState<string|undefined>(undefined);

    useEffect(() =>
    {
        getApiRoute().then(setApiUrl);
    }, []);

    if (!apiUrl) return null;

    const login = useCallback(async (email: string, password: string)=>{
        if (!apiUrl) return undefined;
        let response = await $.post(`${apiUrl}/auth/login`, JSON.stringify({email, password}));
        return undefined;
    }, [apiUrl])

    return (
        <AuthenticationContext.Provider value={{login, isAuthenticated}}>
            {children}
        </AuthenticationContext.Provider>
    );
}

export function useAuthentication(): AuthenticationContextType
{
    const context = useContext(AuthenticationContext);
    if (!context)
    {
        throw new Error("useAuthentication must be used within a AuthenticationProvider");
    }
    return context;
}