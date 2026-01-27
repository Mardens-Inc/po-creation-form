import {useEffect, useState} from "react";
import {getApiRoute} from "../api_route.ts";

export type FieldOption = {
    id: number;
    name: string;
    code?: string;
};

const STORAGE_PREFIX = "pocf_field_options_";

function getStorageKey(type: string, parentId?: number): string {
    return parentId != null
        ? `${STORAGE_PREFIX}${type}_${parentId}`
        : `${STORAGE_PREFIX}${type}`;
}

function loadFromStorage(type: string, parentId?: number): FieldOption[] {
    try {
        const raw = localStorage.getItem(getStorageKey(type, parentId));
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // ignore parse errors
    }
    return [];
}

function saveToStorage(type: string, options: FieldOption[], parentId?: number) {
    localStorage.setItem(getStorageKey(type, parentId), JSON.stringify(options));
}

async function fetchOptions(path: string): Promise<FieldOption[]> {
    const apiRoute = await getApiRoute();
    const response = await fetch(`${apiRoute}/data/${path}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch options from ${path}: ${response.statusText}`);
    }
    return response.json();
}

/**
 * Fetch departments (no parent needed).
 */
export function useDepartments(): FieldOption[] {
    const [options, setOptions] = useState<FieldOption[]>(() => loadFromStorage("department"));

    useEffect(() => {
        fetchOptions("department")
            .then((data) => {
                setOptions(data);
                saveToStorage("department", data);
            })
            .catch(() => {});
    }, []);

    return options;
}

/**
 * Fetch categories for a given department.
 * Returns empty array when departmentId is undefined/null.
 */
export function useCategories(departmentId: number | undefined | null): FieldOption[] {
    const [options, setOptions] = useState<FieldOption[]>(() =>
        departmentId != null ? loadFromStorage("category", departmentId) : []
    );

    useEffect(() => {
        if (departmentId == null) {
            setOptions([]);
            return;
        }
        // Load cached first
        const cached = loadFromStorage("category", departmentId);
        if (cached.length > 0) setOptions(cached);

        fetchOptions(`category/${departmentId}`)
            .then((data) => {
                setOptions(data);
                saveToStorage("category", data, departmentId);
            })
            .catch(() => {});
    }, [departmentId]);

    return options;
}

/**
 * Fetch subcategories for a given category.
 * Returns empty array when categoryId is undefined/null.
 */
export function useSubcategories(categoryId: number | undefined | null): FieldOption[] {
    const [options, setOptions] = useState<FieldOption[]>(() =>
        categoryId != null ? loadFromStorage("subcategory", categoryId) : []
    );

    useEffect(() => {
        if (categoryId == null) {
            setOptions([]);
            return;
        }
        const cached = loadFromStorage("subcategory", categoryId);
        if (cached.length > 0) setOptions(cached);

        fetchOptions(`subcategory/${categoryId}`)
            .then((data) => {
                setOptions(data);
                saveToStorage("subcategory", data, categoryId);
            })
            .catch(() => {});
    }, [categoryId]);

    return options;
}

/**
 * Fetch seasons (no parent needed).
 */
export function useSeasons(): FieldOption[] {
    const [options, setOptions] = useState<FieldOption[]>(() => loadFromStorage("season"));

    useEffect(() => {
        fetchOptions("season")
            .then((data) => {
                setOptions(data);
                saveToStorage("season", data);
            })
            .catch(() => {});
    }, []);

    return options;
}
