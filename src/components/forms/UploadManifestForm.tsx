import {Button, Chip, Select, SelectItem} from "@heroui/react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Dispatch} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {Icon} from "@iconify-icon/react";
import {open} from "@tauri-apps/plugin-dialog";

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

export function UploadManifestForm()
{
    const {uploadForm, setUploadForm} = useFormDataStore();

    const selectFile = async () =>
    {
        const selected = await open({
            multiple: true,
            filters: [
                {
                    name: "Manifest Files",
                    extensions: ["xlsx", "csv", "pdf"]
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
            const paths = Array.isArray(selected) ? selected : [selected];
            console.log(paths);
        }
    };

    return (
        <ErrorBoundary>
            <div className={"flex flex-col h-full w-full gap-8"}>
                <InfoCard>
                    <InfoCard.Header>Upload Assets</InfoCard.Header>
                    <InfoCard.Body>
                        <div className={"w-full h-48 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-primary/20 rounded-lg transition-all border-white/50 border-2 border-dashed"} onClick={selectFile}>
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