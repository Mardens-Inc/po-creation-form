import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";

// ============== Types ==============

export enum UserRole
{
    Admin = 0,
    Buyer = 1,
    Warehouse = 2,
}

export type User = {
    id: number;
    email: string;
    first_name?: string;
    last_name?: string;
    role?: "Admin" | "Buyer" | "Warehouse"; // Backend sends "Admin", "Buyer", or "Warehouse"
    mfa_enabled: boolean;
}

export type UserRegistrationRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: UserRole;
}

type LoginResponse = {
    token: string;
    token_type: string;
}


type JWTClaims = {
    sub: number;
    email: string;
    exp: number;
    iat: number;
}

// ============== Token Storage Utilities ==============

const TOKEN_KEY = "pocf_auth_token";

function storeToken(token: string): void
{
    localStorage.setItem(TOKEN_KEY, token);
}

function getStoredToken(): string | null
{
    return localStorage.getItem(TOKEN_KEY);
}

function clearStoredToken(): void
{
    localStorage.removeItem(TOKEN_KEY);
}

function decodeJWT(token: string): JWTClaims | null
{
    try
    {
        const parts = token.split(".");
        if (parts.length !== 3) return null;

        const payload = parts[1];
        // Base64Url decode
        const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map(c => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );

        return JSON.parse(jsonPayload) as JWTClaims;
    } catch
    {
        return null;
    }
}

function isTokenExpired(token: string): boolean
{
    const claims = decodeJWT(token);
    if (!claims) return true;

    // exp is in seconds, Date.now() is in milliseconds
    const expirationTime = claims.exp * 1000;
    return Date.now() >= expirationTime;
}

function getUserFromToken(token: string): User | null
{
    const claims = decodeJWT(token);
    if (!claims) return null;

    return {
        id: claims.sub,
        email: claims.email,
        mfa_enabled: false
    };
}

// ============== Context ==============

interface AuthenticationContextType
{
    isAuthenticated: boolean;
    isLoading: boolean;
    currentUser: User | null;
    login: (email: string, password: string) => Promise<User | undefined>;
    register: (user: UserRegistrationRequest) => Promise<void>;
    logout: () => void;
    me: () => Promise<User | undefined>;
    getToken: () => string | null;
    enableMFA: () => Promise<void>;
    disableMFA: () => Promise<void>;
    validateMFA: (code: string) => Promise<boolean>;
    getMFAQRCode: () => Promise<string>;
}

const AuthenticationContext = createContext<AuthenticationContextType | undefined>(undefined);

export function AuthenticationProvider({children}: { children: ReactNode })
{
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<User | null>(null);


    // Auto-check authentication on mount
    useEffect(() =>
    {
        const initializeAuth = async () =>
        {
            const token = getStoredToken();

            if (!token)
            {
                setIsLoading(false);
                return;
            }

            if (isTokenExpired(token))
            {
                clearStoredToken();
                setIsLoading(false);
                return;
            }

            // Token exists and is not expired, extract user and validate
            const tokenUser = getUserFromToken(token);
            if (tokenUser)
            {
                setCurrentUser(tokenUser);
                setIsAuthenticated(true);

                // Optionally validate with /auth/me endpoint
                try
                {
                    const validatedUser = await me();

                    if (!validatedUser)
                    {
                        // Token is invalid server-side, clear auth state
                        clearStoredToken();
                        setCurrentUser(null);
                        setIsAuthenticated(false);
                    } else
                    {
                        // Update with full user data from server
                        setCurrentUser(validatedUser);
                    }

                } catch
                {
                    // Network error, keep local state (offline support)
                    console.warn("Could not validate token with server");
                }
            }

            setIsLoading(false);
        };

        initializeAuth();
    }, []);

    const login = useCallback(async (email: string, password: string): Promise<User | undefined> =>
    {

        try
        {
            const response = await fetch(`/api/auth/login`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({email, password})
            });

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Login failed");
            }

            const data: LoginResponse = await response.json();
            storeToken(data.token);

            const tokenUser = getUserFromToken(data.token);
            if (tokenUser)
            {
                const validatedUser = await me();
                if (validatedUser)
                {
                    setCurrentUser(validatedUser);
                    setIsAuthenticated(true);
                    return validatedUser;
                }
            }

            return undefined;
        } catch (error)
        {
            console.error("Login error:", error);
            throw error;
        }
    }, []);

    const register = useCallback(async (userData: UserRegistrationRequest): Promise<void> =>
    {

        try
        {
            const response = await fetch(`/api/auth/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    first_name: userData.firstName,
                    last_name: userData.lastName,
                    email: userData.email,
                    password: userData.password,
                    role: userData.role
                })
            });

            if (!response.ok)
            {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || "Registration failed");
            }

            // Registration successful, user must confirm email before logging in
        } catch (error)
        {
            console.error("Registration error:", error);
            throw error;
        }
    }, []);

    const logout = useCallback((): void =>
    {
        clearStoredToken();
        setCurrentUser(null);
        setIsAuthenticated(false);
    }, []);

    const me = useCallback(async (): Promise<User | undefined> =>
    {
        const token = getStoredToken();
        if (!token) return undefined;

        try
        {
            const response = await fetch(`/api/auth/me`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (response.status === 401)
            {
                // Token is invalid, clear auth state
                clearStoredToken();
                setCurrentUser(null);
                setIsAuthenticated(false);
                return undefined;
            }

            if (!response.ok)
            {
                throw new Error("Failed to fetch user info");
            }

            const user: User = await response.json();

            setCurrentUser(user);
            return user;
        } catch (error)
        {
            console.error("Me error:", error);
            throw error;
        }
    }, []);

    const getToken = useCallback((): string | null =>
    {
        return getStoredToken();
    }, []);

    const enableMFA = async () =>
    {
        try
        {
            await fetch(`/api/auth/mfa/enable`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            });

            // Refresh the current user.
            await me();
        } catch (e: Error | any)
        {
            console.error("MFA Enable Error:", e);
            throw e;
        }
    };

    const disableMFA = async () =>
    {
        try
        {
            await fetch(`/api/auth/mfa/disable`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            });
        } catch (e: Error | any)
        {
            console.error("MFA Disable Error:", e);
            throw e;
        }
    };

    const validateMFA = async (code: string) =>
    {
        try
        {
            const response = await fetch(`/api/auth/mfa/verify-code?code=${code}`, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            return response.ok;
        } catch (e: Error | any)
        {
            console.error("MFA Validation Error:", e);
            throw e;
        }
    };

    const getMFAQRCode = async () =>
    {
        try
        {
            const response = await fetch(`/api/auth/mfa/link-qrcode.svg`, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${getToken()}`,
                    "Content-Type": "application/json"
                }
            });
            if (!response.ok)
            {
                throw new Error(`Failed to fetch MFA QR code: ${response.status} ${response.statusText}`);
            }
            return await response.text();
        } catch (e: Error | any)
        {
            console.error("MFA QR Code Fetch Error:", e);
            throw e;
        }
    };


    return (
        <AuthenticationContext.Provider value={{
            isAuthenticated,
            isLoading,
            currentUser,
            login,
            register,
            logout,
            me,
            getToken,
            enableMFA,
            disableMFA,
            validateMFA,
            getMFAQRCode
        }}>
            {children}
        </AuthenticationContext.Provider>
    );
}

export function useAuthentication(): AuthenticationContextType
{
    const context = useContext(AuthenticationContext);
    if (!context)
    {
        throw new Error("useAuthentication must be used within an AuthenticationProvider");
    }
    return context;
}
