import {create} from "zustand";
import {POInformationFormData, UploadFileItem, UploadFileType} from "../components/forms/POInformationForm.tsx";
import {getLocalTimeZone, parseDate, today} from "@internationalized/date";
import {ManifestData} from "../types/manifest.ts";
import {invoke} from "@tauri-apps/api/core";
import {ManifestRow} from "../components/forms/CreateManifestTable.tsx";

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
    createdManifest: ManifestRow[];
    history: HistoryItem[];
    isSaving: boolean;
    isLoading: boolean;
    currentFilePath: string | null;  // Currently open .pocf file
    hasUnsavedChanges: boolean;      // Dirty flag
    lastSavedStateHash: string | null;  // For change detection
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
    setCreatedManifest: (data: ManifestRow[]) => void;
    clearCreatedManifest: () => void;
    addToHistory: (item: HistoryItem) => void;
    removeFromHistory: (filePath: string) => void;
    clearHistory: () => void;
    loadHistoryFromLocalStorage: () => void;
    setCurrentFilePath: (path: string | null) => void;
    markAsSaved: () => void;
    markAsModified: () => void;
    saveCurrentFile: () => Promise<void>;
    computeStateHash: () => string;
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
    createdManifest: [],
    history: [],
    isSaving: false,
    isLoading: false,
    currentFilePath: null,
    hasUnsavedChanges: false,
    lastSavedStateHash: null,
    setUploadForm: (data: POInformationFormData) =>
    {
        set({uploadForm: data});
        get().markAsModified();
    },
    saveToFile: async (filePath: string) =>
    {
        set({isSaving: true});

        try
        {
            const state = get();

            // Handle created manifest - write to CSV if it exists
            let createdManifestPath: string | null = null;
            let createdManifestFilename: string | null = null;

            if (state.createdManifest.length > 0)
            {
                // Generate filename for created manifest
                createdManifestFilename = `created_manifest_${Date.now()}.csv`;

                // Call Rust command to write CSV
                createdManifestPath = await invoke<string>("write_manifest_csv", {
                    rows: state.createdManifest,
                    filename: createdManifestFilename
                });
            }

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

            // Add created manifest to manifests array if it exists
            if (createdManifestPath && createdManifestFilename)
            {
                // Create identity mapping for created manifest (all fields map to themselves)
                const identityMapping: Record<string, string> = {
                    item_number: "Item Number",
                    upc: "UPC",
                    description: "Description",
                    case_pack: "Case Pack",
                    cases: "Cases",
                    mardens_cost: "Mardens Cost",
                    mardens_price: "Mardens Price",
                    comp_retail: "Comp Retail",
                    department: "Department",
                    category: "Category",
                    sub_category: "Sub Category",
                    season: "Season",
                    notes: "Notes"
                };

                saveData.manifests.push({
                    filename: createdManifestFilename,
                    path: createdManifestPath,
                    mappings: identityMapping
                });

                // Also add to assets
                saveData.assets.push({
                    filename: createdManifestFilename,
                    path: createdManifestPath,
                    file_type: "manifest"
                });
            }

            // Invoke save command
            await invoke("save", {path: filePath, item: saveData});

            // Set current file path and mark as saved
            set({currentFilePath: filePath});
            get().markAsSaved();

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
            localStorage.setItem("pocf_history", JSON.stringify(get().history));
        } finally
        {
            set({isSaving: false});
        }
    },
    loadFromFile: async (filePath: string) =>
    {
        set({isLoading: true});

        try
        {
            // Invoke load command
            const saveData = await invoke<SaveItemData>("load", {path: filePath});

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
            saveData.manifests.forEach(m =>
            {
                get().setManifestMapping(m.path, m.mappings);
            });

            // Set current file path and mark as saved
            set({currentFilePath: filePath});
            get().markAsSaved();
        } finally
        {
            set({isLoading: false});
        }
    },
    setManifestMapping: (path: string, mapping: Record<string, string>) =>
    {
        set((state) => ({
            manifestMappings: state.manifestMappings.map(m =>
                m.path === path ? {...m, mappings: mapping} : m
            )
        }));
        get().markAsModified();
    },
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
    initializeManifestMappings: (files: UploadFileItem[]) => set((state) =>
    {
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
    setCreatedManifest: (data: ManifestRow[]) =>
    {
        set({createdManifest: data});
        get().markAsModified();
    },
    clearCreatedManifest: () => set(() => ({createdManifest: []})),
    addToHistory: (item: HistoryItem) =>
    {
        set(state => ({
            history: [...state.history, item]
        }));
        localStorage.setItem("pocf_history", JSON.stringify(get().history));
    },
    removeFromHistory: (filePath: string) =>
    {
        set(state => ({
            history: state.history.filter(h => h.filePath !== filePath)
        }));
        localStorage.setItem("pocf_history", JSON.stringify(get().history));
    },
    clearHistory: () =>
    {
        set({history: []});
        localStorage.removeItem("pocf_history");
    },
    loadHistoryFromLocalStorage: () =>
    {
        const storedHistory = localStorage.getItem("pocf_history");
        if (storedHistory)
        {
            try
            {
                const history = JSON.parse(storedHistory) as HistoryItem[];
                set({history});
            } catch (e)
            {
                console.error("Failed to load history from localStorage:", e);
                localStorage.removeItem("pocf_history");
            }
        }
    },
    setCurrentFilePath: (path: string | null) => set({currentFilePath: path}),
    markAsSaved: () =>
    {
        const currentHash = get().computeStateHash();
        set({
            hasUnsavedChanges: false,
            lastSavedStateHash: currentHash
        });
    },
    markAsModified: () => set({hasUnsavedChanges: true}),
    computeStateHash: () =>
    {
        const state = get();
        // Create deterministic string representation of save-relevant state
        const stateString = JSON.stringify({
            uploadForm: state.uploadForm,
            manifestMappings: state.manifestMappings.map(m => ({
                filename: m.filename,
                mappings: m.mappings
            })),
            createdManifest: state.createdManifest
        });
        // Simple hash function (for dirty detection, not cryptographic)
        let hash = 0;
        for (let i = 0; i < stateString.length; i++)
        {
            const char = stateString.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString(36);
    },
    saveCurrentFile: async () =>
    {
        const currentPath = get().currentFilePath;
        if (!currentPath)
        {
            throw new Error("No file currently open");
        }

        set({isSaving: true});
        try
        {
            const state = get();

            // Handle created manifest - write to CSV if it exists
            let createdManifestPath: string | null = null;
            let createdManifestFilename: string | null = null;

            if (state.createdManifest.length > 0)
            {
                createdManifestFilename = `created_manifest_${Date.now()}.csv`;
                createdManifestPath = await invoke<string>("write_manifest_csv", {
                    rows: state.createdManifest,
                    filename: createdManifestFilename
                });
            }

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

            // Add created manifest if exists
            if (createdManifestPath && createdManifestFilename)
            {
                const identityMapping: Record<string, string> = {
                    item_number: "Item Number",
                    upc: "UPC",
                    description: "Description",
                    case_pack: "Case Pack",
                    cases: "Cases",
                    mardens_cost: "Mardens Cost",
                    mardens_price: "Mardens Price",
                    comp_retail: "Comp Retail",
                    department: "Department",
                    category: "Category",
                    sub_category: "Sub Category",
                    season: "Season",
                    notes: "Notes"
                };

                saveData.manifests.push({
                    filename: createdManifestFilename,
                    path: createdManifestPath,
                    mappings: identityMapping
                });

                saveData.assets.push({
                    filename: createdManifestFilename,
                    path: createdManifestPath,
                    file_type: "manifest"
                });
            }

            // Use update_save command instead of save
            await invoke("save", {path: currentPath, item: saveData});

            // Mark as saved
            get().markAsSaved();

            // Update history
            const historyItem: HistoryItem = {
                filePath: currentPath,
                poNumber: state.uploadForm.po_number,
                vendor: state.uploadForm.vendor_name,
                buyerId: state.uploadForm.buyer_id,
                savedAt: new Date().toISOString()
            };

            // Update existing history item or add new one
            const existingIndex = state.history.findIndex(h => h.filePath === currentPath);
            if (existingIndex >= 0)
            {
                const newHistory = [...state.history];
                newHistory[existingIndex] = historyItem;
                set({history: newHistory});
            } else
            {
                set(state => ({history: [...state.history, historyItem]}));
            }

            localStorage.setItem("pocf_history", JSON.stringify(get().history));
        } finally
        {
            set({isSaving: false});
        }
    }
}));
