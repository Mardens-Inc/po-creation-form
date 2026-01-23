import {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {addToast} from "@heroui/react";
import {listen} from "@tauri-apps/api/event";
import {useFormDataStore} from "../stores/useFormDataStore.ts";

/**
 * Hook that listens for file open events from the single-instance handler.
 * Handles unsaved changes prompts and loads the requested file.
 */
export function useFileOpenListener(): void
{
    const navigate = useNavigate();
    const {currentFilePath, hasUnsavedChanges, saveCurrentFile, loadFromFile} = useFormDataStore();

    useEffect(() =>
    {
        const unlisten = listen<string>("open-file", async (event) =>
        {
            const filePath = event.payload;

            try
            {
                // Check if there are unsaved changes
                if (hasUnsavedChanges)
                {
                    // Show confirmation using browser confirm for now (can be enhanced with modal later)
                    const shouldSave = window.confirm("You have unsaved changes. Do you want to save before loading the new file?\n\nClick OK to save, Cancel to discard changes, or close this dialog to cancel loading.");

                    if (shouldSave === null)
                    {
                        // User closed dialog - cancel loading
                        return;
                    }

                    if (shouldSave)
                    {
                        // User wants to save first
                        if (currentFilePath)
                        {
                            await saveCurrentFile();
                        } else
                        {
                            addToast({
                                title: "Cannot Save",
                                description: "No current file to save. Loading new file anyway.",
                                color: "warning"
                            });
                        }
                    }
                    // If shouldSave is false, discard changes and continue
                }

                // Load the file
                await loadFromFile(filePath);

                addToast({
                    title: "File Opened",
                    description: `Loaded ${filePath.split(/[\\/]/).pop()}`,
                    color: "success"
                });

                // Navigate to first tab to show loaded data
                navigate("/po-number");
            } catch (error)
            {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addToast({
                    title: "Load Error",
                    description: errorMessage,
                    color: "danger"
                });
            }
        });

        return () =>
        {
            unlisten.then(fn => fn());
        };
    }, [hasUnsavedChanges, navigate, saveCurrentFile, loadFromFile, currentFilePath]);
}
