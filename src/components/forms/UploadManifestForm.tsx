import {Button, Chip, cn, Select, SelectItem} from "@heroui/react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Dispatch, useCallback, useRef} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {Icon} from "@iconify-icon/react";
import {open} from "@tauri-apps/plugin-dialog";
import {useTauriDragDropZone} from "../../hooks/useTauriDragDropZone.ts";

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
        console.log("Selected Files: ", paths);
        const files: UploadFileItem[] = paths.map(path =>
        {
            // Handle both forward and back slashes for cross-platform compatibility
            const filename = path.split(/[/\\]/).pop()!;
            const extension = filename.split(".").pop() ?? "";
            const asset_type = manifestExtensions.includes(extension)
                ? UploadFileType.Manifest
                : UploadFileType.Asset;

            return {key: path, filename, path, asset_type};
        });
        setUploadForm({...uploadForm, files: [...uploadForm.files, ...files]});
    }, [uploadForm, setUploadForm]);

    // Use Tauri drag-drop hook for the specific drop zone
    const {isDraggingOver} = useTauriDragDropZone(dragDropAreaRef, handleFiles);

    console.log("UploadManifestForm render - isDraggingOver:", isDraggingOver);

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
                            {
                                uploadForm.files.map(
                                    (file: UploadFileItem) =>
                                        <UploadItem
                                            item={file}
                                            onChange={value => setUploadForm({...uploadForm, files: uploadForm.files.map(f => f === file ? value : f)})}
                                        />
                                )
                            }
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
    onChange: Dispatch<UploadFileItem>
}

function UploadItem(props: UploadItemProps)
{
    const {item, onChange} = props;
    return (
        <ErrorBoundary>
            <div className={"flex flex-row bg-primary/20 rounded-lg p-4 items-center justify-between"}>
                <p className={"font-bold"}>{item.filename}</p>
                <div className={"flex flex-row gap-4"}>
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
                </div>
            </div>
        </ErrorBoundary>
    );
}