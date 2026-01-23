import {useEffect} from "react";
import {addToast} from "@heroui/react";
import {save} from "@tauri-apps/plugin-dialog";
import {useFormDataStore} from "../stores/useFormDataStore.ts";

/**
 * Hook that handles global keyboard shortcuts for the application.
 * Currently supports:
 * - Ctrl+S / Cmd+S: Save current file or show "Save As" dialog
 */
export function useGlobalKeyboardShortcuts(): void
{
    const {currentFilePath, saveCurrentFile, saveToFile, uploadForm} = useFormDataStore();

    useEffect(() =>
    {
        const handleKeyDown = async (event: KeyboardEvent) =>
        {
            // Ctrl+S or Cmd+S (for Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === "s")
            {
                event.preventDefault();

                // If file is open, save to it
                if (currentFilePath)
                {
                    try
                    {
                        await saveCurrentFile();
                        addToast({
                            title: "Saved",
                            description: "Purchase order updated successfully",
                            color: "success"
                        });
                    } catch (error)
                    {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        addToast({
                            title: "Save Error",
                            description: errorMessage,
                            color: "danger"
                        });
                    }
                } else
                {
                    // No file open, show "Save As" dialog
                    try
                    {
                        const filePath = await save({
                            filters: [{
                                name: "Purchase Order Files",
                                extensions: ["pocf"]
                            }],
                            defaultPath: `PO_${uploadForm.po_number}_${uploadForm.buyer_id}.pocf`
                        });

                        if (filePath)
                        {
                            await saveToFile(filePath);
                            addToast({
                                title: "Saved",
                                description: "Purchase order created successfully",
                                color: "success"
                            });
                        }
                    } catch (error)
                    {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        addToast({
                            title: "Save Error",
                            description: errorMessage,
                            color: "danger"
                        });
                    }
                }
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentFilePath, saveCurrentFile, saveToFile, uploadForm]);
}
