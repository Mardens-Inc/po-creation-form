import {create} from "zustand";
import {POInformationFormData, UploadFileItem, UploadFileType} from "../components/forms/POInformationForm.tsx";
import {addToast} from "@heroui/react";
import {getLocalTimeZone, today} from "@internationalized/date";
import {ManifestData} from "../types/manifest.ts";

export type ManifestMapping = {
    filename: string;
    path: string;
    mappings: Record<string, string>;
    parsedData: ManifestData | null;
    isLoading: boolean;
    error: string | null;
}

export type FormDataStore = {
    uploadForm: POInformationFormData;
    manifestMappings: ManifestMapping[];
}

type FormDataActions = {
    setUploadForm: (data: POInformationFormData) => void;
    saveToFile: (data: FormDataStore) => void;
    loadFromFile: (file: string) => void;
    setManifestMapping: (path: string, mapping: Record<string, string>) => void;
    setManifestParsedData: (path: string, data: ManifestData | null) => void;
    setManifestLoading: (path: string, isLoading: boolean) => void;
    setManifestError: (path: string, error: string | null) => void;
    initializeManifestMappings: (files: UploadFileItem[]) => void;
}

export const useFormDataStore = create<FormDataStore & FormDataActions>((set) => ({
    uploadForm: {
        po_number: 1,
        buyer_id: "01",
        vendor_name: "",
        creation_date: today(getLocalTimeZone()),
        estimated_arrival: null,
        files: []
    },
    manifestMappings: [],
    setUploadForm: (data: POInformationFormData) => set(() => ({uploadForm: data})),
    saveToFile: (_data: FormDataStore) => addToast({title: "Error", description: "This feature is not yet implemented.", color: "danger"}),
    loadFromFile: (_file: string) => addToast({title: "Error", description: "This feature is not yet implemented.", color: "danger"}),
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
    })
}));
