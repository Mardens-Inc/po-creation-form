import {create} from "zustand";
import {UploadManifestFormData} from "../components/forms/PONumberForm.tsx";
import {addToast} from "@heroui/react";

export type FormDataStore = {
    uploadForm: UploadManifestFormData;
}

type FormDataActions = {
    setUploadForm: (data: UploadManifestFormData) => void;
    saveToFile: (data: FormDataStore) => void;
    loadFromFile: (file: string) => void;
}

export const useFormDataStore = create<FormDataStore & FormDataActions>((set) => ({
    uploadForm: {
        files: []
    },
    setUploadForm: (data: UploadManifestFormData) => set(() => ({uploadForm: data})),
    saveToFile: (_data: FormDataStore) => addToast({title: "Error", description: "This feature is not yet implemented.", color: "danger"}) /* Placeholder for future implementation */,
    loadFromFile: (_file: string) => addToast({title: "Error", description: "This feature is not yet implemented.", color: "danger"}) /* Placeholder for future implementation */
}));
