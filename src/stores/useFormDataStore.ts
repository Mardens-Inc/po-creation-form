import {create} from "zustand";
import {POInformationFormData, UploadFileItem, UploadFileType} from "../components/forms/POInformationForm.tsx";
import {getLocalTimeZone, parseDate, today} from "@internationalized/date";
import {ManifestData} from "../types/manifest.ts";
import {invoke} from "@tauri-apps/api/core";

export type ManifestMapping = {
    filename: string;
    path: string;
    mappings: Record<string, string>;
    parsedData: ManifestData | null;
    isLoading: boolean;
    error: string | null;
}

export type HistoryItem = {
    filePath: string;
    poNumber: number;
    vendor: string;
    buyerId: string;
    savedAt: string; // ISO 8601
}

// Types for save/load backend communication
type SaveItemData = {
    version: string;
    po_number: number;
    buyer_id: string;
    vendor: string;
    creation_date: string;
    expected_delivery_date: string | null;
    manifests: Array<{
        filename: string;
        path: string;
        mappings: Record<string, string>;
    }>;
    assets: Array<{
        filename: string;
        path: string;
        file_type: string;
    }>;
}

export type FormDataStore = {
    uploadForm: POInformationFormData;
    manifestMappings: ManifestMapping[];
    history: HistoryItem[];
    isSaving: boolean;
    isLoading: boolean;
}

type FormDataActions = {
    setUploadForm: (data: POInformationFormData) => void;
    saveToFile: (filePath: string) => Promise<void>;
    loadFromFile: (filePath: string) => Promise<void>;
    setManifestMapping: (path: string, mapping: Record<string, string>) => void;
    setManifestParsedData: (path: string, data: ManifestData | null) => void;
    setManifestLoading: (path: string, isLoading: boolean) => void;
    setManifestError: (path: string, error: string | null) => void;
    initializeManifestMappings: (files: UploadFileItem[]) => void;
    addToHistory: (item: HistoryItem) => void;
    removeFromHistory: (filePath: string) => void;
    clearHistory: () => void;
    loadHistoryFromLocalStorage: () => void;
}

export const useFormDataStore = create<FormDataStore & FormDataActions>((set, get) => ({
    uploadForm: {
        po_number: 1,
        buyer_id: "01",
        vendor_name: "",
        creation_date: today(getLocalTimeZone()),
        estimated_arrival: null,
        files: []
    },
    manifestMappings: [],
    history: [],
    isSaving: false,
    isLoading: false,
    setUploadForm: (data: POInformationFormData) => set(() => ({uploadForm: data})),
    saveToFile: async (filePath: string) => {
        set({isSaving: true});

        try {
            const state = get();

            // Prepare SaveItem data
            const saveData: SaveItemData = {
                version: "1.0",
                po_number: state.uploadForm.po_number,
                buyer_id: state.uploadForm.buyer_id,
                vendor: state.uploadForm.vendor_name,
                creation_date: state.uploadForm.creation_date.toString(),
                expected_delivery_date: state.uploadForm.estimated_arrival?.toString() || null,
                manifests: state.manifestMappings.map(m => ({
                    filename: m.filename,
                    path: m.path,
                    mappings: m.mappings
                })),
                assets: state.uploadForm.files.map(f => ({
                    filename: f.filename,
                    path: f.path,
                    file_type: f.asset_type
                }))
            };

            // Invoke save command
            await invoke('save', {path: filePath, item: saveData});

            // Add to history
            const historyItem: HistoryItem = {
                filePath,
                poNumber: state.uploadForm.po_number,
                vendor: state.uploadForm.vendor_name,
                buyerId: state.uploadForm.buyer_id,
                savedAt: new Date().toISOString()
            };

            set(state => ({
                history: [...state.history, historyItem]
            }));

            // Persist history to localStorage
            localStorage.setItem('pocf_history', JSON.stringify(get().history));
        } finally {
            set({isSaving: false});
        }
    },
    loadFromFile: async (filePath: string) => {
        set({isLoading: true});

        try {
            // Invoke load command
            const saveData = await invoke<SaveItemData>('load', {path: filePath});

            // Convert and populate store
            set({
                uploadForm: {
                    po_number: saveData.po_number,
                    buyer_id: saveData.buyer_id,
                    vendor_name: saveData.vendor,
                    creation_date: parseDate(saveData.creation_date),
                    estimated_arrival: saveData.expected_delivery_date
                        ? parseDate(saveData.expected_delivery_date)
                        : null,
                    files: saveData.assets.map(a => ({
                        key: a.path, // Use path as unique key
                        filename: a.filename,
                        path: a.path,
                        asset_type: a.file_type as UploadFileType
                    }))
                }
            });

            // Re-initialize manifest mappings
            get().initializeManifestMappings(get().uploadForm.files);

            // Set mappings from saved data
            saveData.manifests.forEach(m => {
                get().setManifestMapping(m.path, m.mappings);
            });
        } finally {
            set({isLoading: false});
        }
    },
    setManifestMapping: (path: string, mapping: Record<string, string>) => set((state) => ({
        manifestMappings: state.manifestMappings.map(m =>
            m.path === path ? {...m, mappings: mapping} : m
        )
    })),
    setManifestParsedData: (path: string, data: ManifestData | null) => set((state) => ({
        manifestMappings: state.manifestMappings.map(m =>
            m.path === path ? {...m, parsedData: data, isLoading: false, error: null} : m
        )
    })),
    setManifestLoading: (path: string, isLoading: boolean) => set((state) => ({
        manifestMappings: state.manifestMappings.map(m =>
            m.path === path ? {...m, isLoading, error: isLoading ? null : m.error} : m
        )
    })),
    setManifestError: (path: string, error: string | null) => set((state) => ({
        manifestMappings: state.manifestMappings.map(m =>
            m.path === path ? {...m, error, isLoading: false} : m
        )
    })),
    initializeManifestMappings: (files: UploadFileItem[]) => set((state) => {
        const manifestFiles = files.filter(f => f.asset_type === UploadFileType.Manifest);
        const existingPaths = new Set(state.manifestMappings.map(m => m.path));
        const newMappings: ManifestMapping[] = manifestFiles
            .filter(f => !existingPaths.has(f.path))
            .map(f => ({
                filename: f.filename,
                path: f.path,
                mappings: {},
                parsedData: null,
                isLoading: false,
                error: null
            }));
        return {
            manifestMappings: [...state.manifestMappings, ...newMappings]
        };
    }),
    addToHistory: (item: HistoryItem) => {
        set(state => ({
            history: [...state.history, item]
        }));
        localStorage.setItem('pocf_history', JSON.stringify(get().history));
    },
    removeFromHistory: (filePath: string) => {
        set(state => ({
            history: state.history.filter(h => h.filePath !== filePath)
        }));
        localStorage.setItem('pocf_history', JSON.stringify(get().history));
    },
    clearHistory: () => {
        set({history: []});
        localStorage.removeItem('pocf_history');
    },
    loadHistoryFromLocalStorage: () => {
        const storedHistory = localStorage.getItem('pocf_history');
        if (storedHistory) {
            try {
                const history = JSON.parse(storedHistory) as HistoryItem[];
                set({history});
            } catch (e) {
                console.error('Failed to load history from localStorage:', e);
                localStorage.removeItem('pocf_history');
            }
        }
    }
}));
