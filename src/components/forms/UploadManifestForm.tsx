import {Button, Chip, cn, Select, SelectItem} from "@heroui/react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Dispatch, useCallback, useEffect, useRef, useState} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {Icon} from "@iconify-icon/react";
import {open} from "@tauri-apps/plugin-dialog";
import $ from "jquery";

export type UploadManifestFormData = {
    files: UploadFileItem[];
}

export enum UploadFileType
{
    Asset,
    Manifest,
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
    const [isDraggingOver, setIsDraggingOver] = useState(false);
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
        const files: UploadFileItem[] = paths.map(path =>
        {
            const filename = path.split("/").pop()!;
            const extension = filename.split(".").pop() ?? "";
            const asset_type = manifestExtensions.includes(extension)
                ? UploadFileType.Manifest
                : UploadFileType.Asset;

            return {key: path, filename, path, asset_type};
        });
        uploadForm.files = [...uploadForm.files, ...files];
    }, [uploadForm]);

    useEffect(() =>
    {
        if (!dragDropAreaRef.current)
        {
            console.error("Drag drop area ref is null.");
            return;
        }
        console.log("Setting up drag drop area event listeners.");
        $(dragDropAreaRef.current)
            .on("dragenter", (event) =>
            {
                event.preventDefault();
                setIsDraggingOver(true);
            })
            .on("dragend", (event) =>
            {
                event.preventDefault();
                setIsDraggingOver(false);
            })
            .on("drop", (event) =>
            {
                event.preventDefault();
                setIsDraggingOver(false);
                console.log("Drop event: ", event);
                // handleFiles();
            });

        return () =>
        {
            console.log("Cleaning up drag drop area event listeners.");
            $(dragDropAreaRef)
                .off("dragover")
                .off("drop")
                .off("dragleave")
                .off("dragenter")
                .off("dragend");
        };
    }, [dragDropAreaRef]);


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
                        <InfoCard.Header>Items</InfoCard.Header>
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

                <div className={"fixed bottom-2 right-2 flex flex-row gap-2"}>
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
                <p></p>
                <div className={"flex flex-row gap-4"}>
                    <Select
                        value={item.key}
                        onSelectionChange={keys => onChange({...item, asset_type: [...keys][0] as UploadFileType})}
                        selectionMode={"single"}

                    >
                        {Object.values(UploadFileType).filter(v => typeof v === "number").map((type) => (
                            <SelectItem key={type as number}>{type}</SelectItem>
                        ))}
                    </Select>
                </div>
            </div>
        </ErrorBoundary>
    );
}