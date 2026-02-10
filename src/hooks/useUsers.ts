import {useCallback, useEffect, useState} from "react";
import {useAuthentication, User, UserRole} from "../providers/AuthenticationProvider.tsx";

export interface UserStats {
    total: number;
    admins: number;
    buyers: number;
    warehouse: number;
    mfaEnabled: number;
    pendingReset: number;
}

export function useUsers() {
    const {getToken, isAuthenticated, currentUser} = useAuthentication();
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchUsers = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/auth/users", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch users");
            }

            const data: User[] = await response.json();
            setUsers(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (isAuthenticated && currentUser?.role === UserRole.Admin) {
            fetchUsers();
        } else {
            setIsLoading(false);
        }
    }, [isAuthenticated, currentUser?.role, fetchUsers]);

    const getUserStats = useCallback((): UserStats => {
        return {
            total: users.length,
            admins: users.filter(u => u.role === UserRole.Admin).length,
            buyers: users.filter(u => u.role === UserRole.Buyer).length,
            warehouse: users.filter(u => u.role === UserRole.Warehouse).length,
            mfaEnabled: users.filter(u => u.mfa_enabled).length,
            pendingReset: users.filter(u => u.needs_password_reset).length,
        };
    }, [users]);

    const updateUser = useCallback(async (id: number, updates: { first_name?: string; last_name?: string; email?: string; role?: UserRole }) => {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/auth/users/${id}`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(updates),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to update user");
        }

        await fetchUsers();
    }, [getToken, fetchUsers]);

    const deleteUser = useCallback(async (id: number) => {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/auth/users/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to delete user");
        }

        await fetchUsers();
    }, [getToken, fetchUsers]);

    const forcePasswordReset = useCallback(async (id: number) => {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/auth/users/${id}/force-password-reset`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to force password reset");
        }

        await fetchUsers();
    }, [getToken, fetchUsers]);

    const disableUserMFA = useCallback(async (id: number) => {
        const token = getToken();
        if (!token) throw new Error("Not authenticated");

        const response = await fetch(`/api/auth/users/${id}/disable-mfa`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to disable MFA");
        }

        await fetchUsers();
    }, [getToken, fetchUsers]);

    return {
        users,
        isLoading,
        error,
        refetch: fetchUsers,
        getUserStats,
        updateUser,
        deleteUser,
        forcePasswordReset,
        disableUserMFA,
    };
}
