import {useSearchParams} from "react-router-dom";
import {useCallback, useMemo} from "react";

export interface UserFilterState {
    search: string | null;
    roles: string[];
    mfa: string | null;
    status: string | null;
}

function parseJsonArray<T>(value: string | null): T[] {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

export function useUserFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: UserFilterState = useMemo(() => ({
        search: searchParams.get("search"),
        roles: parseJsonArray<string>(searchParams.get("roles")),
        mfa: searchParams.get("mfa"),
        status: searchParams.get("status"),
    }), [searchParams]);

    const setFilter = useCallback((key: string, value: string | null) => {
        setSearchParams(prev => {
            const next = new URLSearchParams(prev);
            if (value === null || value === "" || value === "[]") {
                next.delete(key);
            } else {
                next.set(key, value);
            }
            return next;
        }, {replace: true});
    }, [setSearchParams]);

    const clearFilters = useCallback(() => {
        setSearchParams({}, {replace: true});
    }, [setSearchParams]);

    const hasActiveFilters = useMemo(() => {
        return filters.search !== null
            || filters.roles.length > 0
            || filters.mfa !== null
            || filters.status !== null;
    }, [filters]);

    return {filters, setFilter, clearFilters, hasActiveFilters};
}
