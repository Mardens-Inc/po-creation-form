import {Button, Chip, cn} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {memo, useCallback} from "react";
import {AnimatePresence} from "framer-motion";
import {UploadFileItem} from "./types.ts";
import {UploadItem} from "./UploadItem.tsx";

type UploadManifestSectionProps = {
    files: UploadFileItem[];
    onFilesChange: (files: UploadFileItem[]) => void;
    isDraggingOver: boolean;
    onSelectFile: () => void;
}

export const UploadManifestSection = memo(function UploadManifestSection(props: UploadManifestSectionProps)
{
    const {files, onFilesChange, isDraggingOver, onSelectFile} = props;

    const handleFileChange = useCallback((file: UploadFileItem, newValue: UploadFileItem) =>
    {
        onFilesChange(files.map(f => f.key === file.key ? newValue : f));
    }, [files, onFilesChange]);

    const handleRemove = useCallback((file: UploadFileItem) =>
    {
        onFilesChange(files.filter(f => f.path !== file.path));
    }, [files, onFilesChange]);

    return (
        <div className={"flex flex-col gap-4 py-6 border-t-2 border-primary/20"}>
            <p className={"font-headers font-bold text-xl uppercase"}>Upload Manifest Files</p>
            <div
                className={cn(
                    "w-full h-48 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                    "data-[dragging-over=true]:bg-primary/20 data-[dragging-over=true]:border-primary data-[dragging-over=true]:border-3",
                    "hover:bg-primary/20 border-white/50 border-2 border-dashed select-none rounded-lg"
                )}
                onClick={onSelectFile}
                data-dragging-over={isDraggingOver}
            >
                <p className={"font-headers text-2xl font-bold"}>Upload your manifest files here</p>
                <div className={"flex gap-2"}>
                    Supported manifest file formats:
                    <Chip color={"primary"}>XLSX</Chip>
                    <Chip color={"primary"}>CSV</Chip>
                    <Chip color={"primary"}>PDF</Chip>
                </div>
                <p>All other file formats will be uploaded as a generic asset.</p>
            </div>
            <div className={"flex flex-row mx-auto gap-2"}>
                <Button
                    radius={"none"}
                    color={"primary"}
                    size={"lg"}
                    startContent={<Icon icon={"tabler:file-upload-filled"}/>}
                    onPress={onSelectFile}
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
