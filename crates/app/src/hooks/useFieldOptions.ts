import {useEffect, useState} from "react";
import {getApiRoute} from "../api_route.ts";

type FieldOptionKey = "department" | "category" | "subcategory" | "season";

const STORAGE_PREFIX = "pocf_field_options_";

function getStorageKey(field: FieldOptionKey): string {
    return `${STORAGE_PREFIX}${field}`;
}

function loadFromStorage(field: FieldOptionKey): string[] {
    try {
        const raw = localStorage.getItem(getStorageKey(field));
        if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        }
    } catch {
        // ignore parse errors
    }
    return [];
}

function saveToStorage(field: FieldOptionKey, options: string[]) {
    localStorage.setItem(getStorageKey(field), JSON.stringify(options));
}

async function fetchFieldOptions(field: FieldOptionKey): Promise<string[]> {
    const apiRoute = await getApiRoute();
    const response = await fetch(`${apiRoute}/data/${field}`);
    if (!response.ok) {
        throw new Error(`Failed to fetch ${field} options: ${response.statusText}`);
    }
    return response.json();
}

export function useFieldOptions(field: FieldOptionKey): string[] {
    const [options, setOptions] = useState<string[]>(() => loadFromStorage(field));

    useEffect(() => {
        fetchFieldOptions(field)
            .then((data) => {
                setOptions(data);
                saveToStorage(field, data);
            })
            .catch(() => {
                // Offline or error — keep localStorage values
            });
    }, [field]);

    return options;
}
