import {useSearchParams} from "react-router-dom";
import {useCallback, useMemo} from "react";
import {POStatus} from "../types/po.ts";

export interface POFilterState {
    buyers: number[];
    vendors: string[];
    statuses: POStatus[];
    dateFrom: string | null;
    dateTo: string | null;
    minAmount: number | null;
    maxAmount: number | null;
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

export function usePOFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    const filters: POFilterState = useMemo(() => ({
        buyers: parseJsonArray<number>(searchParams.get("buyers")),
        vendors: parseJsonArray<string>(searchParams.get("vendors")),
        statuses: parseJsonArray<POStatus>(searchParams.get("status")),
        dateFrom: searchParams.get("dateFrom"),
        dateTo: searchParams.get("dateTo"),
        minAmount: parseNumber(searchParams.get("minAmount")),
        maxAmount: parseNumber(searchParams.get("maxAmount")),
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
        return filters.buyers.length > 0
            || filters.vendors.length > 0
            || filters.statuses.length > 0
            || filters.dateFrom !== null
            || filters.dateTo !== null
            || filters.minAmount !== null
            || filters.maxAmount !== null;
    }, [filters]);

    return {filters, setFilter, clearFilters, hasActiveFilters};
}
