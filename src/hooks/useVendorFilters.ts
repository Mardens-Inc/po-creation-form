import {useSearchParams} from "react-router-dom";
import {useCallback, useMemo} from "react";

export interface VendorFilterState {
    statuses: string[];
    search: string | null;
    minPOs: number | null;
    maxPOs: number | null;
    minSpend: number | null;
    maxSpend: number | null;
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

function parseNumber(value: string | null): number | null {
    if (!value) return null;
    const n = parseFloat(value);
    return isNaN(n) ? null : n;
}

export function useVendorFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: VendorFilterState = useMemo(() => ({
        statuses: parseJsonArray<string>(searchParams.get("status")),
        search: searchParams.get("search"),
        minPOs: parseNumber(searchParams.get("minPOs")),
        maxPOs: parseNumber(searchParams.get("maxPOs")),
        minSpend: parseNumber(searchParams.get("minSpend")),
        maxSpend: parseNumber(searchParams.get("maxSpend")),
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
        return filters.statuses.length > 0
            || filters.search !== null
            || filters.minPOs !== null
            || filters.maxPOs !== null
            || filters.minSpend !== null
            || filters.maxSpend !== null;
    }, [filters]);

    return {filters, setFilter, clearFilters, hasActiveFilters};
}
