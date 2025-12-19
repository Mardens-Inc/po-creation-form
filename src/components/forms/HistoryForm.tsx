import {addToast, Button, Chip} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useNavigate} from "react-router-dom";
import {open} from "@tauri-apps/plugin-dialog";
import {useEffect} from "react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {InfoCard} from "../InfoCard.tsx";

export function HistoryForm()
{
    const {history, loadFromFile, removeFromHistory, clearHistory, loadHistoryFromLocalStorage} = useFormDataStore();
    const navigate = useNavigate();

    // Load history from localStorage on mount
    useEffect(() =>
    {
        loadHistoryFromLocalStorage();
    }, [loadHistoryFromLocalStorage]);

    // Handle loading a file from history
    const handleLoad = async (filePath: string) =>
    {
        try
        {
            await loadFromFile(filePath);
            addToast({
                title: "Success",
                description: "Purchase order loaded successfully",
                color: "success"
            });
            navigate("/po-number");
        } catch (error)
        {
            const errorMessage = error instanceof Error ? error.message : String(error);
            addToast({
                title: "Load Error",
                description: errorMessage,
                color: "danger"
            });

            // If file not found, remove from history
            if (errorMessage.includes("not found") || errorMessage.includes("No such file"))
            {
                removeFromHistory(filePath);
                addToast({
                    title: "File Removed",
                    description: "The file was removed from history as it no longer exists",
                    color: "warning"
                });
            }
        }
    };

    // Handle opening a file via dialog
    const handleOpenFile = async () =>
    {
        const selected = await open({
            filters: [{
                name: "Purchase Order Files",
                extensions: ["pocf"]
            }],
            title: "Open Purchase Order"
        });

        if (selected)
        {
            await handleLoad(selected as string);
        }
    };

    // Handle clearing all history
    const handleClearHistory = () =>
    {
        if (confirm("Are you sure you want to clear all history? This action cannot be undone."))
        {
            clearHistory();
            addToast({
                title: "History Cleared",
                description: "All history has been removed",
                color: "success"
            });
        }
    };

    // Format date for display
    const formatDate = (isoString: string): string =>
    {
        const date = new Date(isoString);
        return date.toLocaleString();
    };

    // Empty state
    if (history.length === 0)
    {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-6">
                <InfoCard className="max-w-2xl w-full">
                    <InfoCard.Body>
                        <div className="flex flex-col items-center justify-center gap-6 py-12">
                            <Icon icon="mdi:history" className="text-8xl text-primary/30"/>
                            <div className="flex flex-col items-center gap-2">
                                <h3 className="font-headers font-bold text-2xl uppercase">No History</h3>
                                <p className="font-text text-lg text-gray-600 text-center">
                                    You haven't saved any purchase orders yet.
                                </p>
                            </div>
                            <Button
                                radius="none"
                                color="primary"
                                size="lg"
                                startContent={<Icon icon="mdi:folder-open"/>}
                                onPress={handleOpenFile}
                            >
                                Open Purchase Order File
                            </Button>
                        </div>
                    </InfoCard.Body>
                </InfoCard>
            </div>
        );
    }

    // History list view
    return (
        <div className="flex flex-col h-full gap-6 mb-16">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <h2 className="font-headers font-bold text-3xl uppercase">Purchase Order History</h2>
                    <p className="font-text text-sm text-gray-600">
                        {history.length} saved {history.length === 1 ? "file" : "files"}
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        radius="none"
                        color="primary"
                        size="md"
                        startContent={<Icon icon="mdi:folder-open"/>}
                        onPress={handleOpenFile}
                    >
                        Open File
                    </Button>
                    <Button
                        radius="none"
                        color="danger"
                        size="md"
                        variant="bordered"
                        startContent={<Icon icon="mdi:delete"/>}
                        onPress={handleClearHistory}
                    >
                        Clear All
                    </Button>
                </div>
            </div>

            {/* History List */}
            <div className="grid grid-cols-1 gap-4">
                {[...history].reverse().map((item, index) => (
                    <InfoCard key={index}>
                        <InfoCard.Body>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4 flex-1 min-w-0">
                                    <Icon icon="mdi:file-document" className="text-4xl text-primary flex-shrink-0"/>
                                    <div className="flex flex-col gap-1 flex-1 min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="font-headers font-bold text-lg">
                                                PO #{item.poNumber}
                                            </span>
                                            <Chip color="secondary" size="sm">
                                                Buyer {item.buyerId}
                                            </Chip>
                                        </div>
                                        <span className="font-text text-sm text-gray-700">
                                            {item.vendor}
                                        </span>
                                        <span className="font-text text-xs text-gray-500">
                                            Saved: {formatDate(item.savedAt)}
                                        </span>
                                        <span className="font-text text-xs text-gray-400 truncate">
                                            {item.filePath}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    <Button
                                        radius="none"
                                        color="primary"
                                        size="md"
                                        startContent={<Icon icon="mdi:folder-open"/>}
                                        onPress={() => handleLoad(item.filePath)}
                                    >
                                        Load
                                    </Button>
                                    <Button
                                        radius="none"
                                        color="danger"
                                        size="md"
                                        variant="flat"
                                        isIconOnly
                                        onPress={() =>
                                        {
                                            if (confirm(`Remove "${item.filePath}" from history?`))
                                            {
                                                removeFromHistory(item.filePath);
                                                addToast({
                                                    title: "Removed",
                                                    description: "File removed from history",
                                                    color: "success"
                                                });
                                            }
                                        }}
                                    >
                                        <Icon icon="mdi:delete"/>
                                    </Button>
                                </div>
                            </div>
                        </InfoCard.Body>
                    </InfoCard>
                ))}
            </div>
        </div>
    );
}
