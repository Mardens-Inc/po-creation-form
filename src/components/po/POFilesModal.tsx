import {addToast, Button, Chip, Modal, ModalBody, ModalContent, ModalHeader, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useCallback, useEffect, useState} from "react";
import {POFile} from "../../types/po.ts";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";

type POFilesModalProps = {
    isOpen: boolean;
    onClose: () => void;
    poId: number;
    poNumber: string;
};

export function POFilesModal({isOpen, onClose, poId, poNumber}: POFilesModalProps)
{
    const {getToken} = useAuthentication();
    const [files, setFiles] = useState<POFile[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [downloadingId, setDownloadingId] = useState<number | null>(null);

    const loadFiles = useCallback(async () =>
    {
        const token = getToken();
        if (!token) return;

        setIsLoading(true);
        try
        {
            const response = await fetch(`/api/purchase-orders/${poId}/files`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to load files");

            const data: POFile[] = await response.json();
            setFiles(data);
        } catch (error)
        {
            console.error("Error loading files:", error);
            setFiles([]);
        } finally
        {
            setIsLoading(false);
        }
    }, [getToken, poId]);

    useEffect(() =>
    {
        if (isOpen) loadFiles();
    }, [isOpen, loadFiles]);

    const handleDownload = useCallback(async (file: POFile) =>
    {
        const token = getToken();
        if (!token) return;

        setDownloadingId(file.id);
        try
        {
            const response = await fetch(`/api/purchase-orders/${poId}/files/${file.id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error("Failed to download file");

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = file.filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (error)
        {
            console.error("Error downloading file:", error);
            addToast({
                title: "Error downloading file",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally
        {
            setDownloadingId(null);
        }
    }, [getToken, poId]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="3xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="font-headers font-black text-xl uppercase flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-secondary/10 text-secondary">
                                <Icon icon="tabler:file-spreadsheet" width={20} height={20}/>
                            </div>
                            Files - PO #{poNumber}
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Spinner size="lg"/>
                                    <span className="ml-4">Loading files...</span>
                                </div>
                            ) : files.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-default-400">
                                    <Icon icon="tabler:file-off" width={48} height={48}/>
                                    <p className="mt-4 text-lg font-medium">No files uploaded for this PO</p>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {files.map(file => (
                                        <div key={file.id} className="flex items-center gap-4 p-3 bg-default-100 rounded-lg hover:bg-default-200 transition-background">
                                            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-default-200">
                                                <Icon
                                                    icon={file.asset_type === 1 ? "tabler:file-spreadsheet" : "tabler:file"}
                                                    width={24}
                                                    height={24}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium truncate">{file.filename}</p>
                                                <p className="text-xs text-default-500">
                                                    {file.uploaded_at && new Date(file.uploaded_at).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <Chip
                                                size="sm"
                                                color={file.asset_type === 1 ? "primary" : "default"}
                                                variant="flat"
                                            >
                                                {file.asset_type === 1 ? "Manifest" : "Asset"}
                                            </Chip>
                                            <Button
                                                size="sm"
                                                variant="flat"
                                                color="primary"
                                                isIconOnly
                                                aria-label="Download file"
                                                isLoading={downloadingId === file.id}
                                                onPress={() => handleDownload(file)}
                                            >
                                                <Icon icon="tabler:download" width={16} height={16}/>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
