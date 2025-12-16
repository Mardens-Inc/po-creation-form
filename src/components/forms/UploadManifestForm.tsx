import {Select, SelectItem} from "@heroui/react";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Dispatch} from "react";

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
    asset_type: UploadFileType;
} & File

export function UploadManifestForm()
{
    const {uploadForm, setUploadForm} = useFormDataStore();

    return (
        <ErrorBoundary>
            <div className={"flex flex-col h-full w-full gap-8"}>
                <div className={"border-dotted border-2 border-white/50 rounded-lg p-8 flex flex-col items-center justify-center gap-4 bg-primary/10"}>
                    <p className={"font-headers text-2xl text-white font-bold"}>Upload your manifest files here</p>
                </div>
                <div className={"flex flex-col gap-4"}>
                    {
                        uploadForm.files.map(
                            (file: UploadFileItem) =>
                                <UploadItem
                                    item={file}
                                    onChange={value => setUploadForm({...uploadForm, files: uploadForm.files.map(f => f === file ? value : f)})}
                                />
                        )
                    }
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