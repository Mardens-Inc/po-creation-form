import {addToast, Button, ButtonGroup} from "@heroui/react";
import {getCurrentWindow} from "@tauri-apps/api/window";
import {Icon} from "@iconify-icon/react";
import {useEffect} from "react";
import {useFormDataStore} from "../stores/useFormDataStore.ts";
import {save as saveDialog} from "@tauri-apps/plugin-dialog";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {useRemoteServerConnection} from "../providers/RemoteServerConnectionProvider.tsx";

export default function Titlebar()
{
    const appWindow = getCurrentWindow();
    const {currentFilePath, hasUnsavedChanges, saveCurrentFile, saveToFile, uploadForm} = useFormDataStore();
    const {isAuthenticated} = useAuthentication();
    const {isConnected: isConnectedToRemote} = useRemoteServerConnection();

    useEffect(() =>
    {
        // Once React has rendered, switch to custom titlebar
        const initWindow = async () =>
        {
            await appWindow.setDecorations(false);
            await appWindow.show();
        };
        initWindow();
    }, [appWindow]);

    const handleSave = async () =>
    {
        try
        {
            if (currentFilePath)
            {
                // Update existing file
                await saveCurrentFile();
                addToast({
                    title: "Saved",
                    description: "Purchase order updated successfully",
                    color: "success"
                });
            } else
            {
                // Show Save As dialog
                const filePath = await saveDialog({
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
    };

    return (
        <div className={"flex flex-row h-fit backdrop-blur-sm sticky top-0 w-full z-[9999] backdrop-saturate-150 select-none bg-primary text-white"} data-tauri-drag-region="">
            <div className={"flex flex-row items-center"}>
                <p className={"mx-2 my-auto font-medium select-none"} data-tauri-drag-region="">PO Tracker App {isConnectedToRemote ? "" : <span className={"text-sm italic"}>(offline)</span>}</p>

                {/* File name indicator */}
                {currentFilePath && (
                    <div className={"flex items-center gap-2 px-3 py-1 bg-white/10 rounded"}>
                        <Icon icon="mdi:file" className="text-sm"/>
                        <span className="text-xs font-text">
                            {currentFilePath.split(/[\\/]/).pop()}
                        </span>
                        {hasUnsavedChanges && (
                            <span className="text-xs text-secondary">●</span>
                        )}
                    </div>
                )}
            </div>

            <div className={"flex flex-row ml-auto"}>
                <ButtonGroup className={"h-[2rem]"}>
                    {isAuthenticated ?
                        // Save Button
                        <Button
                            variant={"light"}
                            className={"min-w-0 h-[2rem] text-[.9rem] text-white/75 hover:text-white hover:!bg-white/10 px-3"}
                            radius={"none"}
                            onPress={handleSave}
                            title={currentFilePath ? "Save (Ctrl+S)" : "Save As (Ctrl+S)"}
                        >
                            <Icon icon={hasUnsavedChanges ? "mdi:content-save-alert" : "mdi:content-save"}/>
                            <span className="text-xs ml-1">{currentFilePath ? "Save" : "Save As"}</span>
                        </Button>
                        : null}

                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[1rem] text-white/75 hover:text-white hover:!bg-white/10"} radius={"none"} onPress={() => appWindow.minimize()}><Icon icon="material-symbols:minimize-rounded"/></Button>
                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[.7rem] text-white/75 hover:text-white hover:!bg-white/10"} radius={"none"} onPress={() => appWindow.toggleMaximize()}><Icon icon="material-symbols:square-outline-rounded"/></Button>
                    <Button variant={"light"} className={"min-w-0 h-[2rem] text-[1rem] text-white/75 hover:text-white hover:!bg-red"} radius={"none"} onPress={() => appWindow.close()}><Icon icon="material-symbols:close-rounded"/></Button>
                </ButtonGroup>
            </div>
        </div>
    );
}

