import {addToast, Button, Chip, cn, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback, useRef, useState} from "react";
import {ManifestParseResult, manifestExtensions, UploadFileItem, UploadFileType} from "./types.ts";
import {useAuthentication} from "../../../providers/AuthenticationProvider.tsx";

type UploadTemplateSectionProps = {
    templateFile: UploadFileItem | null;
    isProcessing: boolean;
    onTemplateFileChange: (file: UploadFileItem | null) => void;
    onProcessingChange: (processing: boolean) => void;
    onMetadataExtracted: (result: ManifestParseResult) => void;
}

export const UploadTemplateSection = memo(function UploadTemplateSection(props: UploadTemplateSectionProps)
{
    const {templateFile, isProcessing, onTemplateFileChange, onProcessingChange, onMetadataExtracted} = props;
    const {getToken} = useAuthentication();
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const processFile = useCallback(async (file: File) =>
    {
        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!manifestExtensions.includes(extension))
        {
            addToast({title: "Only .xlsx files are allowed", color: "warning"});
            return;
        }

        const token = getToken();
        if (!token)
        {
            addToast({title: "Not authenticated", color: "danger"});
            return;
        }

        onProcessingChange(true);

        try
        {
            const buffer = await file.arrayBuffer();
            const response = await fetch("/api/purchase-orders/process-manifest?limit_line_items=0", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/octet-stream"
                },
                body: buffer
            });

            if (!response.ok)
            {
                const errorText = await response.text().catch(() => "Failed to process template");
                throw new Error(errorText);
            }

            const result: ManifestParseResult = await response.json();

            const uploadItem: UploadFileItem = {
                key: `template-${file.name}-${Date.now()}`,
                filename: file.name,
                file,
                asset_type: UploadFileType.Manifest
            };

            onTemplateFileChange(uploadItem);
            onMetadataExtracted(result);

            addToast({title: "Template processed successfully", color: "success"});
        } catch (error)
        {
            console.error("Error processing template:", error);
            addToast({
                title: "Error processing template",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally
        {
            onProcessingChange(false);
        }
    }, [getToken, onProcessingChange, onTemplateFileChange, onMetadataExtracted]);

    const handleSelectFile = useCallback(() =>
    {
        fileInputRef.current?.click();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    {
        if (e.target.files && e.target.files.length > 0)
        {
            processFile(e.target.files[0]);
            e.target.value = "";
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) =>
    {
        e.preventDefault();
        setIsDraggingOver(true);
    }, []);

    const handleDragLeave = useCallback(() =>
    {
        setIsDraggingOver(false);
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) =>
    {
        e.preventDefault();
        setIsDraggingOver(false);
        if (e.dataTransfer.files.length > 0)
        {
            processFile(e.dataTransfer.files[0]);
        }
    }, [processFile]);

    const handleRemove = useCallback(() =>
    {
        onTemplateFileChange(null);
    }, [onTemplateFileChange]);

    return (
        <div className="flex flex-col gap-0">
            <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                className="hidden"
                onChange={handleInputChange}
            />
            {templateFile ? (
                <div className="flex flex-row items-center gap-3 px-3 py-2 bg-success/5 border border-success/30 rounded-lg">
                    <Icon icon="tabler:file-spreadsheet" width={18} height={18} className="text-success shrink-0"/>
                    <span className="text-sm font-medium truncate flex-1">{templateFile.filename}</span>
                    <Chip size="sm" color="success" variant="flat" className="shrink-0">Processed</Chip>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        radius="sm"
                        onPress={handleRemove}
                        aria-label="Remove template"
                    >
                        <Icon icon="tabler:x" width={16} height={16}/>
                    </Button>
                </div>
            ) : (
                <div
                    className={cn(
                        "flex flex-row items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all",
                        isDraggingOver
                            ? "bg-success/20 border-success border-2"
                            : "border border-default-300 border-dashed hover:bg-default-100"
                    )}
                    onClick={handleSelectFile}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    {isProcessing ? (
                        <>
                            <Spinner size="sm"/>
                            <span className="text-sm text-default-500">Processing template...</span>
                        </>
                    ) : (
                        <>
                            <Icon icon="tabler:file-upload" width={18} height={18} className="text-default-400 shrink-0"/>
                            <span className="text-sm text-default-500 flex-1">Drop a PO template (.xlsx) or click to browse</span>
                            <Button
                                size="sm"
                                variant="flat"
                                color="success"
                                radius="sm"
                                onPress={handleSelectFile}
                                startContent={<Icon icon="tabler:upload" width={14} height={14}/>}
                            >
                                Upload
                            </Button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});
