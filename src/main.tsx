import React, {useEffect} from "react";
import {BrowserRouter, Navigate, Route, Routes, useNavigate} from "react-router-dom";
import ReactDOM from "react-dom/client";
import $ from "jquery";

import "./styles/index.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "./styles/swiper-custom.scss";
import {Home} from "./pages/Home.tsx";
import Titlebar from "./components/Titlebar.tsx";
import {addToast, HeroUIProvider, ToastProvider} from "@heroui/react";
import {ScreenSizeProvider} from "./providers/ScreenSizeProvider.tsx";
import {ErrorBoundary} from "./components/ErrorBoundry.tsx";
import {HistoryForm} from "./components/forms/HistoryForm.tsx";
import {POInformationForm} from "./components/forms/POInformationForm.tsx";
import {InventoryItemsForm} from "./components/forms/InventoryItemsForm.tsx";
import {FinalizeForm} from "./components/forms/FinalizeForm.tsx";
import {UpdateModal} from "./components/UpdateModal.tsx";
import {useFormDataStore} from "./stores/useFormDataStore.ts";
import {save} from "@tauri-apps/plugin-dialog";
import {listen} from "@tauri-apps/api/event";


ReactDOM.createRoot($("#root")[0]!).render(
    <React.StrictMode>
        <BrowserRouter>
            <ScreenSizeProvider>
                <MainContentRenderer/>
            </ScreenSizeProvider>
        </BrowserRouter>
    </React.StrictMode>
);

export function MainContentRenderer()
{
    const navigate = useNavigate();
    const {currentFilePath, hasUnsavedChanges, saveCurrentFile, saveToFile, loadFromFile, uploadForm} = useFormDataStore();

    $(window).on("contextmenu", e => e.preventDefault());

    // Global Ctrl+S keyboard shortcut
    useEffect(() => {
        const handleKeyDown = async (event: KeyboardEvent) => {
            // Ctrl+S or Cmd+S (for Mac)
            if ((event.ctrlKey || event.metaKey) && event.key === 's') {
                event.preventDefault();

                // If file is open, save to it
                if (currentFilePath) {
                    try {
                        await saveCurrentFile();
                        addToast({
                            title: "Saved",
                            description: "Purchase order updated successfully",
                            color: "success"
                        });
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : String(error);
                        addToast({
                            title: "Save Error",
                            description: errorMessage,
                            color: "danger"
                        });
                    }
                } else {
                    // No file open, show "Save As" dialog
                    try {
                        const filePath = await save({
                            filters: [{
                                name: "Purchase Order Files",
                                extensions: ["pocf"]
                            }],
                            defaultPath: `PO_${uploadForm.po_number}_${uploadForm.buyer_id}.pocf`
                        });

                        if (filePath) {
                            await saveToFile(filePath);
                            addToast({
                                title: "Saved",
                                description: "Purchase order created successfully",
                                color: "success"
                            });
                        }
                    } catch (error) {
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

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentFilePath, saveCurrentFile, saveToFile, uploadForm]);

    // Listen for file open events from single-instance handler
    useEffect(() => {
        const unlisten = listen<string>('open-file', async (event) => {
            const filePath = event.payload;

            try {
                // Check if there are unsaved changes
                if (hasUnsavedChanges) {
                    // Show confirmation using browser confirm for now (can be enhanced with modal later)
                    const shouldSave = window.confirm('You have unsaved changes. Do you want to save before loading the new file?\n\nClick OK to save, Cancel to discard changes, or close this dialog to cancel loading.');

                    if (shouldSave === null) {
                        // User closed dialog - cancel loading
                        return;
                    }

                    if (shouldSave) {
                        // User wants to save first
                        if (currentFilePath) {
                            await saveCurrentFile();
                        } else {
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
                navigate('/po-number');
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                addToast({
                    title: "Load Error",
                    description: errorMessage,
                    color: "danger"
                });
            }
        });

        return () => {
            unlisten.then(fn => fn());
        };
    }, [hasUnsavedChanges, navigate, saveCurrentFile, loadFromFile, currentFilePath]);

    return (
        <HeroUIProvider navigate={navigate}>

            <ToastProvider
                placement={"bottom-right"}
                toastProps={{
                    shouldShowTimeoutProgress: true,
                    timeout: 3000,
                    variant: "flat"
                }}
            />

            <UpdateModal />

            <main className={"flex flex-col p-0 m-0"}>
                <Titlebar/>

                <div className={"flex flex-row w-full max-h-[calc(100vh-2rem)] h-screen overflow-y-auto p-0 m-0"}>
                    <Routes>
                        {/* Root redirect */}
                        <Route path="/" element={<Navigate to="/po-number" replace/>}/>

                        {/* Home as layout with nested routes */}
                        <Route element={<ErrorBoundary><Home/></ErrorBoundary>}>
                            <Route path="/history" element={<ErrorBoundary><HistoryForm/></ErrorBoundary>}/>
                            <Route path="/po-number" element={<ErrorBoundary><POInformationForm/></ErrorBoundary>}/>
                            <Route path="/items" element={<ErrorBoundary><InventoryItemsForm/></ErrorBoundary>}/>
                            <Route path="/finalize" element={<ErrorBoundary><FinalizeForm/></ErrorBoundary>}/>
                        </Route>

                        {/* Catch-all for invalid routes - redirect to default */}
                        <Route path="*" element={<Navigate to="/po-number" replace/>}/>
                    </Routes>
                </div>

            </main>
        </HeroUIProvider>
    );
}