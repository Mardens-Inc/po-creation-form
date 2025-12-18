import {Button, Chip, cn, DatePicker, Input, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {Dispatch, useCallback, useRef, useState} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
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

export function POInformation()
{
    const [buyerId, setBuyerId] = useState("01");
    const [poNumber, setPoNumber] = useState(96);
    const [vendorName, setVendorName] = useState("");
    const [creationDate, setCreationDate] = useState<CalendarDate | null>(today(getLocalTimeZone()));
    const [estimatedArrival, setEstimatedArrival] = useState<CalendarDate | null>(null);

    const {uploadForm, setUploadForm} = useFormDataStore();
    const dragDropAreaRef = useRef<HTMLDivElement | null>(null);

    const incrementPO = () => setPoNumber(prev => prev + 1);
    const decrementPO = () => setPoNumber(prev => Math.max(1, prev - 1));

    // Format PO number with buyer ID prefix
    const formattedPO = buyerId + String(poNumber).padStart(4, "0");

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

        if (files.length > 0)
        {
            setUploadForm({...uploadForm, files: [...uploadForm.files, ...files]});
        }
    }, [uploadForm, setUploadForm]);

    const handleRemove = useCallback((item: UploadFileItem) =>
    {
        setUploadForm({
            ...uploadForm,
            files: uploadForm.files.filter(f => f.path !== item.path)
        });
    }, [uploadForm, setUploadForm]);

    // Use Tauri drag-drop hook for the specific drop zone
    const {isDraggingOver} = useTauriDragDropZone(dragDropAreaRef, handleFiles);

    return (
        <div className={"flex flex-col h-full gap-8 mb-16"} ref={dragDropAreaRef}>
            <InfoCard>
                <InfoCard.Header>Purchase Order</InfoCard.Header>
                <InfoCard.Body>
                    {/* PO Number Section */}
                    <div className={"flex flex-col items-center gap-4 py-6 border-b-2 border-primary/20"}>
                        <p className={"font-accent text-xl uppercase tracking-wide"}>PO Number</p>
                        <div className={"flex items-center gap-4"}>
                            <Button
                                radius={"none"}
                                color={"primary"}
                                size={"lg"}
                                isIconOnly
                                onPress={decrementPO}
                            >
                                <Icon icon={"tabler:minus"} width={24} height={24}/>
                            </Button>
                            <div className={"text-primary font-black font-headers text-6xl xl:text-8xl min-w-[300px] text-center"}>
                                {formattedPO}
                            </div>
                            <Button
                                radius={"none"}
                                color={"primary"}
                                size={"lg"}
                                isIconOnly
                                onPress={incrementPO}
                            >
                                <Icon icon={"tabler:plus"} width={24} height={24}/>
                            </Button>
                        </div>
                    </div>

                    {/* Invoice Details Section */}
                    <div className={"flex flex-col gap-6 py-6"}>
                        <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                            {/* Buyer ID */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Buyer ID
                                </label>
                                <Input
                                    radius={"none"}
                                    size={"lg"}
                                    maxLength={2}
                                    minLength={2}
                                    placeholder="Enter buyer ID"
                                    value={buyerId}
                                    onValueChange={setBuyerId}
                                    classNames={{
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }}
                                />
                            </div>

                            {/* Vendor Name */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Vendor Name
                                </label>
                                <Input
                                    radius={"none"}
                                    size={"lg"}
                                    placeholder="Enter vendor name"
                                    value={vendorName}
                                    onValueChange={setVendorName}
                                    classNames={{
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }}
                                />
                            </div>
                        </div>

                        <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>

                            {/* Creation Date */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Creation Date
                                </label>
                                <DatePicker
                                    radius={"none"}
                                    size={"lg"}
                                    value={creationDate as any}
                                    onChange={setCreationDate as any}
                                    showMonthAndYearPickers
                                    classNames={{
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }}
                                    calendarProps={{
                                        classNames: {
                                            base: "rounded-none",
                                            title: "!text-white",
                                            pickerHighlight: "rounded-none bg-primary/30"

                                        },
                                        buttonPickerProps: {
                                            radius: "none",
                                            className: "relative select-none order-2 h-8",
                                            color: "primary",
                                            variant: "solid"
                                        },
                                        navButtonProps: {
                                            radius: "none",
                                            className: "relative select-none text-white data-[hover=true]:opacity-hover flex items-center justify-center gap-2 z-10 order-2 h-8",
                                            color: "primary",
                                            variant: "solid"
                                        }

                                    }}
                                />
                            </div>

                            {/* Estimated Arrival Date */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Estimated Date of Arrival
                                </label>
                                <DatePicker
                                    radius={"none"}
                                    size={"lg"}
                                    placeholderValue={today(getLocalTimeZone()) as any}
                                    value={estimatedArrival as any}
                                    onChange={setEstimatedArrival as any}
                                    showMonthAndYearPickers
                                    minValue={today(getLocalTimeZone()) as any}
                                    classNames={{
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }}
                                    calendarProps={{
                                        classNames: {
                                            base: "rounded-none",
                                            title: "!text-white",
                                            pickerHighlight: "rounded-none bg-primary/30"

                                        },
                                        buttonPickerProps: {
                                            radius: "none",
                                            className: "relative select-none order-2 h-8",
                                            color: "primary",
                                            variant: "solid"
                                        },
                                        navButtonProps: {
                                            radius: "none",
                                            className: "relative select-none text-white data-[hover=true]:opacity-hover flex items-center justify-center gap-2 z-10 order-2 h-8",
                                            color: "primary",
                                            variant: "solid"
                                        }

                                    }}
                                />
                            </div>
                        </div>

                        {/* Upload Manifest Section */}
                        <div className={"flex flex-col gap-4 py-6 border-t-2 border-primary/20"}>
                            <p className={"font-headers font-bold text-xl uppercase"}>Upload Manifest Files</p>
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
                                    onPress={selectFile}
                                >
                                    Choose File
                                </Button>
                            </div>

                            {/* Uploaded Items List */}
                            {uploadForm.files.length > 0 && (
                                <div className={"flex flex-col gap-2 mt-4"}>
                                    <p className={"font-headers font-bold text-lg uppercase"}>Uploaded Items</p>
                                    <div className={"max-h-96 overflow-y-auto"}>
                                        <AnimatePresence mode="popLayout">
                                            {uploadForm.files.map((file: UploadFileItem, index: number) =>
                                                <UploadItem
                                                    key={file.key}
                                                    item={file}
                                                    index={index}
                                                    onChange={value => setUploadForm({...uploadForm, files: uploadForm.files.map(f => f === file ? value : f)})}
                                                    onRemove={() => handleRemove(file)}
                                                />
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </InfoCard.Body>
            </InfoCard>

            {/* Continue Button */}
            <div className={"fixed bottom-2 right-5 flex flex-row gap-2"}>
                <Button
                    radius={"none"}
                    color={"primary"}
                    size={"lg"}
                    endContent={<Icon icon={"charm:chevron-right"}/>}
                >
                    {uploadForm.files.length > 0 ? "Continue" : "Skip"}
                </Button>
            </div>
        </div>
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
                className={"flex flex-row hover:bg-primary/20 border-b-2 border-primary rounded-none p-4 items-center justify-between gap-4 transition-background"}
            >
                <div className={"flex flex-col"}>
                    <p className={"font-bold truncate flex-1"}>{item.filename}</p>
                    <p className={"italic truncate flex-1 text-tiny"}>{item.path}</p>
                </div>
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
                        <Icon icon="tabler:x" width={20} height={20}/>
                    </Button>
                </div>
            </motion.div>
        </ErrorBoundary>
    );
}