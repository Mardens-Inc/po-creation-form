import {Button, Chip, cn} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback, useRef, useState} from "react";
import {AnimatePresence} from "framer-motion";
import {UploadFileItem, UploadFileType, manifestExtensions} from "./types.ts";
import {UploadItem} from "./UploadItem.tsx";

type UploadManifestSectionProps = {
    files: UploadFileItem[];
    onFilesChange: (files: UploadFileItem[]) => void;
}

export const UploadManifestSection = memo(function UploadManifestSection(props: UploadManifestSectionProps)
{
    const {files, onFilesChange} = props;
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);

    const processFiles = useCallback((incoming: FileList | File[]) =>
    {
        const existingNames = new Set(files.map(f => f.filename));
        const newItems: UploadFileItem[] = [];

        for (const file of Array.from(incoming))
        {
            if (existingNames.has(file.name)) continue;
            const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
            const asset_type = manifestExtensions.includes(extension)
                ? UploadFileType.Manifest
                : UploadFileType.Asset;
            newItems.push({key: `${file.name}-${Date.now()}`, filename: file.name, file, asset_type});
        }

        if (newItems.length > 0)
        {
            onFilesChange([...files, ...newItems]);
        }
    }, [files, onFilesChange]);

    const handleSelectFile = useCallback(() =>
    {
        fileInputRef.current?.click();
    }, []);

    const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    {
        if (e.target.files && e.target.files.length > 0)
        {
            processFiles(e.target.files);
            e.target.value = "";
        }
    }, [processFiles]);

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
            processFiles(e.dataTransfer.files);
        }
    }, [processFiles]);

    const handleFileChange = useCallback((file: UploadFileItem, newValue: UploadFileItem) =>
    {
        onFilesChange(files.map(f => f.key === file.key ? newValue : f));
    }, [files, onFilesChange]);

    const handleRemove = useCallback((file: UploadFileItem) =>
    {
        onFilesChange(files.filter(f => f.key !== file.key));
    }, [files, onFilesChange]);

    return (
        <div className={"flex flex-col gap-4 py-6 border-t-2 border-primary/20"}>
            <p className={"font-headers font-bold text-xl uppercase"}>Upload Manifest Files</p>
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleInputChange}
            />
            <div
                className={cn(
                    "w-full h-48 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                    isDraggingOver ? "bg-primary/20 border-primary border-3" : "border-default-300 border-2 border-dashed",
                    "hover:bg-primary/10 select-none rounded-lg"
                )}
                onClick={handleSelectFile}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <Icon icon="tabler:cloud-upload" width={40} height={40} className="text-default-400"/>
                <p className={"font-headers text-xl font-bold"}>Drag & drop files here or click to browse</p>
                <div className={"flex gap-2 items-center"}>
                    <span className="text-sm text-default-500">Manifest formats:</span>
                    <Chip size="sm" color={"primary"}>XLSX</Chip>
                    <Chip size="sm" color={"primary"}>CSV</Chip>
                    <Chip size="sm" color={"primary"}>PDF</Chip>
                </div>
                <p className="text-xs text-default-400">All other file formats will be uploaded as a generic asset.</p>
            </div>
            <div className={"flex flex-row mx-auto gap-2"}>
                <Button
                    radius={"none"}
                    color={"primary"}
                    size={"lg"}
                    startContent={<Icon icon={"tabler:file-upload-filled"}/>}
                    onPress={handleSelectFile}
                >
                    Choose File
                </Button>
            </div>

            {/* Uploaded Items List */}
            {files.length > 0 && (
                <div className={"flex flex-col gap-2 mt-4"}>
                    <p className={"font-headers font-bold text-lg uppercase"}>Uploaded Items</p>
                    <div className={"max-h-96 overflow-y-auto"}>
                        <AnimatePresence mode="popLayout">
                            {files.map((file: UploadFileItem, index: number) =>
                                <UploadItem
                                    key={file.key}
                                    item={file}
                                    index={index}
                                    onChange={value => handleFileChange(file, value)}
                                    onRemove={() => handleRemove(file)}
                                />
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            )}
        </div>
    );
});
