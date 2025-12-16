import {Button, Chip, cn, Select, SelectItem} from "@heroui/react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Dispatch, useCallback, useRef} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {Icon} from "@iconify-icon/react";
import {open} from "@tauri-apps/plugin-dialog";
import {useTauriDragDropZone} from "../../hooks/useTauriDragDropZone.ts";
import {AnimatePresence, motion} from "framer-motion";

export type UploadManifestFormData = {
    files: UploadFileItem[];
}

export enum UploadFileType
{
    Asset = "Asset",
    Manifest = "Manifest",
}

export type UploadFileItem = {
    key: string;
    filename: string;
    path: string;
    asset_type: UploadFileType;
}

const manifestExtensions = ["xlsx", "csv", "pdf"];

export function UploadManifestForm()
{
    const {uploadForm, setUploadForm} = useFormDataStore();
    const dragDropAreaRef = useRef<HTMLDivElement | null>(null);

    const selectFile = async () =>
    {
        const selected = await open({
            multiple: true,
            filters: [
                {
                    name: "Manifest Files",
                    extensions: manifestExtensions
                },
                {
                    name: "Other Asset Files",
                    extensions: ["*"]
                }
            ],
            title: "Select Asset Files",
            recursive: true
        });

        if (selected)
        {
            handleFiles(selected);
        }
    };

    const handleFiles = useCallback((selected: string | string[]) =>
    {
        const paths = Array.isArray(selected) ? selected : [selected];

        // Filter out paths that already exist
        const existingPaths = new Set(uploadForm.files.map(f => f.path));
        const newPaths = paths.filter(path => !existingPaths.has(path));

        const files: UploadFileItem[] = newPaths.map(path =>
        {
            // Handle both forward and back slashes for cross-platform compatibility
            const filename = path.split(/[/\\]/).pop()!;
            const extension = filename.split(".").pop() ?? "";
            const asset_type = manifestExtensions.includes(extension)
                ? UploadFileType.Manifest
                : UploadFileType.Asset;

            return {key: path, filename, path, asset_type};
        });

        if (files.length > 0) {
            setUploadForm({...uploadForm, files: [...uploadForm.files, ...files]});
        }
    }, [uploadForm, setUploadForm]);

    const handleRemove = useCallback((item: UploadFileItem) => {
        setUploadForm({
            ...uploadForm,
            files: uploadForm.files.filter(f => f.path !== item.path)
        });
    }, [uploadForm, setUploadForm]);

    // Use Tauri drag-drop hook for the specific drop zone
    const {isDraggingOver} = useTauriDragDropZone(dragDropAreaRef, handleFiles);

    return (
        <ErrorBoundary>
            <div className={"flex flex-col h-full w-full gap-8"} ref={dragDropAreaRef}>
                <InfoCard>
                    <InfoCard.Header>Upload Assets</InfoCard.Header>
                    <InfoCard.Body>
                        <div
                            className={cn(
                                "w-full h-48 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all",
                                "data-[dragging-over=true]:bg-primary/20 data-[dragging-over=true]:border-primary data-[dragging-over=true]:border-3",
                                "hover:bg-primary/20 border-white/50 border-2 border-dashed select-none rounded-lg"
                            )}
                            onClick={selectFile}
                            data-dragging-over={isDraggingOver}
                        >
                            <p className={"font-headers text-2xl font-bold"}>Upload your manifest files here</p>
                            <div className={"flex gap-2"}>Supported manifest file formats: <Chip color={"primary"}>XLSX</Chip><Chip color={"primary"}>CSV</Chip><Chip color={"primary"}>PDF</Chip></div>
                            <p>All other file formats will be uploaded as a generic asset.</p>
                        </div>
                        <div className={"flex flex-row mx-auto gap-2"}>
                            <Button radius={"none"} color={"primary"} size={"lg"} startContent={<Icon icon={"tabler:file-upload-filled"}/>} onPress={selectFile}>Choose File</Button>
                        </div>
                    </InfoCard.Body>
                </InfoCard>
                {uploadForm.files.length > 0 ? (
                    <InfoCard>
                        <InfoCard.Header>Uploaded Items</InfoCard.Header>
                        <InfoCard.Body>
                            <AnimatePresence mode="popLayout">
                                {
                                    uploadForm.files.map(
                                        (file: UploadFileItem, index: number) =>
                                            <UploadItem
                                                key={file.key}
                                                item={file}
                                                index={index}
                                                onChange={value => setUploadForm({...uploadForm, files: uploadForm.files.map(f => f === file ? value : f)})}
                                                onRemove={() => handleRemove(file)}
                                            />
                                    )
                                }
                            </AnimatePresence>
                        </InfoCard.Body>
                    </InfoCard>
                ) : null}

                <div className={"fixed bottom-2 right-5 flex flex-row gap-2"}>
                    <Button radius={"none"} color={"primary"} size={"lg"} endContent={<Icon icon={"charm:chevron-right"}/>}>{uploadForm.files.length > 0 ? "Continue" : "Skip"}</Button>
                </div>
            </div>
        </ErrorBoundary>
    );
}

type UploadItemProps = {
    item: UploadFileItem,
    index: number,
    onChange: Dispatch<UploadFileItem>,
    onRemove: () => void
}

function UploadItem(props: UploadItemProps)
{
    const {item, index, onChange, onRemove} = props;
    return (
        <ErrorBoundary>
            <motion.div
                layout
                initial={{opacity: 0, y: -20, scale: 0.95}}
                animate={{opacity: 1, y: 0, scale: 1}}
                exit={{opacity: 0, x: -100, scale: 0.95}}
                transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.05
                }}
                className={"flex flex-row bg-primary/20 rounded-lg p-4 items-center justify-between gap-4"}
            >
                <p className={"font-bold truncate flex-1"}>{item.filename}</p>
                <div className={"flex flex-row gap-2 items-center"}>
                    <Select
                        value={item.key}
                        selectedKeys={item.asset_type ? [item.asset_type] : [UploadFileType.Asset]}
                        onSelectionChange={keys => onChange({...item, asset_type: [...keys][0] as UploadFileType})}
                        selectionMode={"single"}
                        className={"w-32"}
                        size={"sm"}
                        radius={"none"}
                        label={"Asset Type"}
                        listboxProps={{
                            itemClasses: {
                                base: "rounded-none"
                            }
                        }}
                        popoverProps={{
                            classNames: {content: "p-0"},
                            radius: "none",
                            itemProp: "rounded-none"
                        }}
                    >
                        {Object.values(UploadFileType).map((type) => (
                            <SelectItem key={type as string}>{type}</SelectItem>
                        ))}
                    </Select>
                    <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        color="danger"
                        radius="none"
                        onPress={onRemove}
                        aria-label="Remove file"
                    >
                        <Icon icon="tabler:x" width={20} height={20} />
                    </Button>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
}