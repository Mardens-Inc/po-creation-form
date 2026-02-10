import {createContext, ReactNode, useContext} from "react";
import {useUsers, UserStats} from "../hooks/useUsers.ts";
import {User, UserRole} from "./AuthenticationProvider.tsx";

interface UsersContextType {
    users: User[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getUserStats: () => UserStats;
    updateUser: (id: number, updates: { first_name?: string; last_name?: string; email?: string; role?: UserRole }) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    forcePasswordReset: (id: number) => Promise<void>;
    disableUserMFA: (id: number) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export function UsersProvider({children}: { children: ReactNode }) {
    const usersData = useUsers();

    return (
        <UsersContext.Provider value={usersData}>
            {children}
        </UsersContext.Provider>
    );
}

export function useUsersContext(): UsersContextType {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error("useUsersContext must be used within a UsersProvider");
    }
    return context;
}
