import {Autocomplete, AutocompleteItem, Button, Chip, cn, DatePicker, Input, Link, Radio, RadioGroup, Select, SelectItem, Textarea} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {Dispatch, useCallback, useEffect, useRef, useState} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {open} from "@tauri-apps/plugin-dialog";
import {useTauriDragDropZone} from "../../hooks/useTauriDragDropZone.ts";
import {AnimatePresence, motion} from "framer-motion";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";

export type FOBType = "Pickup" | "Delivered";

export type POInformationFormData = {
    po_number: number;
    buyer_id: number;
    vendor_name: string;
    order_date: CalendarDate;
    ship_date: CalendarDate | null;
    cancel_date: CalendarDate | null;
    shipping_notes: string;
    description: string;
    terms: string;
    ship_to_address: string;
    fob_type: FOBType;
    fob_point: string;
    notes: string;
    files: UploadFileItem[];
}

// Template data for autocomplete fields
const vendorOptions = [
    {key: "vendor-1", label: "Vendor 1"},
    {key: "vendor-2", label: "Vendor 2"},
    {key: "vendor-3", label: "Vendor 3"},
    {key: "vendor-4", label: "Vendor 4"},
    {key: "vendor-5", label: "Vendor 5"},
];

const shipToAddressOptions = [
    {key: "address-1", label: "123 Main Street, Waterville, ME 04901"},
    {key: "address-2", label: "456 Oak Avenue, Portland, ME 04101"},
    {key: "address-3", label: "789 Warehouse Drive, Bangor, ME 04401"},
    {key: "address-4", label: "321 Distribution Center, Lewiston, ME 04240"},
];

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

const getPoNumberFromLocalStorage = (buyerId: number): number =>
{
    const key = `po_last_number_${buyerId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 1;
};

const savePoNumberToLocalStorage = (buyerId: number, poNumber: number) =>
{
    const key = `po_last_number_${buyerId}`;
    localStorage.setItem(key, poNumber.toString());
};

export function POInformationForm()
{
    const {uploadForm, setUploadForm} = useFormDataStore();
    const {currentUser} = useAuthentication();

    // Use user ID from authentication as buyer ID
    const buyerId = currentUser?.id ?? 0;

    const [poNumber, setPoNumber] = useState(() => getPoNumberFromLocalStorage(buyerId));
    const [isEditingPO, setIsEditingPO] = useState(false);
    const [vendorName, setVendorName] = useState(uploadForm.vendor_name);
    const [orderDate, setOrderDate] = useState<CalendarDate | null>(uploadForm.order_date);
    const [shipDate, setShipDate] = useState<CalendarDate | null>(uploadForm.ship_date);
    const [cancelDate, setCancelDate] = useState<CalendarDate | null>(uploadForm.cancel_date);
    const [shippingNotes, setShippingNotes] = useState(uploadForm.shipping_notes);
    const [description, setDescription] = useState(uploadForm.description);
    const [terms, setTerms] = useState(uploadForm.terms);
    const [shipToAddress, setShipToAddress] = useState(uploadForm.ship_to_address);
    const [fobType, setFobType] = useState<FOBType>(uploadForm.fob_type);
    const [fobPoint, setFobPoint] = useState(uploadForm.fob_point);
    const [notes, setNotes] = useState(uploadForm.notes);

    const dragDropAreaRef = useRef<HTMLDivElement | null>(null);
    const poInputRef = useRef<HTMLInputElement | null>(null);

    // Load PO number from local storage when buyer ID changes
    useEffect(() =>
    {
        const storedPoNumber = getPoNumberFromLocalStorage(buyerId);
        setPoNumber(storedPoNumber);
    }, [buyerId]);

    // Save PO number to local storage whenever it changes
    useEffect(() =>
    {
        savePoNumberToLocalStorage(buyerId, poNumber);
    }, [buyerId, poNumber]);

    // Auto-save all form data to the store whenever any field changes
    useEffect(() =>
    {
        setUploadForm({
            po_number: poNumber,
            buyer_id: buyerId,
            vendor_name: vendorName,
            order_date: orderDate || today(getLocalTimeZone()),
            ship_date: shipDate,
            cancel_date: cancelDate,
            shipping_notes: shippingNotes,
            description,
            terms,
            ship_to_address: shipToAddress,
            fob_type: fobType,
            fob_point: fobPoint,
            notes,
            files: uploadForm.files
        });
    }, [poNumber, buyerId, vendorName, orderDate, shipDate, cancelDate, shippingNotes, description, terms, shipToAddress, fobType, fobPoint, notes, uploadForm.files, setUploadForm]);

    const incrementPO = () => setPoNumber(prev => prev + 1);
    const decrementPO = () => setPoNumber(prev => Math.max(1, prev - 1));

    // Format PO number with buyer ID prefix
    const formattedPO = String(buyerId).padStart(2, "0") + String(poNumber).padStart(4, "0");

    // Handle PO number editing
    const handlePOClick = () =>
    {
        setIsEditingPO(true);
        setTimeout(() => poInputRef.current?.focus(), 0);
    };

    const handlePOBlur = () =>
    {
        setIsEditingPO(false);
    };

    const handlePOKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) =>
    {
        if (e.key === "Enter" || e.key === "Escape")
        {
            setIsEditingPO(false);
        }
    };

    const handlePOChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value >= 1)
        {
            setPoNumber(value);
        }
    };

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
                            {isEditingPO ? (
                                <input
                                    ref={poInputRef}
                                    type="number"
                                    value={poNumber}
                                    onChange={handlePOChange}
                                    onBlur={handlePOBlur}
                                    onKeyDown={handlePOKeyDown}
                                    min={1}
                                    className={"text-primary font-black font-headers text-6xl xl:text-8xl min-w-[300px] text-center bg-transparent border-b-4 border-primary outline-none"}
                                    style={{MozAppearance: "textfield", WebkitAppearance: "none"}}
                                />
                            ) : (
                                <div
                                    className={"text-primary font-black font-headers text-6xl xl:text-8xl min-w-[300px] text-center cursor-pointer hover:opacity-80 transition-opacity"}
                                    onClick={handlePOClick}
                                    title="Click to edit"
                                >
                                    {formattedPO}
                                </div>
                            )}
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
                        <p className={"text-sm text-default-500"}>Click on the number to edit directly</p>
                    </div>

                    {/* Order Details Section */}
                    <div className={"flex flex-col gap-6 py-6"}>
                        <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                            {/* Vendor Name (Required) */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Vendor Name <span className={"text-danger"}>*</span>
                                </label>
                                <Autocomplete
                                    radius={"none"}
                                    size={"lg"}
                                    placeholder="Select or enter vendor name"
                                    allowsCustomValue
                                    inputValue={vendorName}
                                    onInputChange={setVendorName}
                                    isRequired
                                    classNames={{
                                        base: "font-text text-lg",
                                        listboxWrapper: "rounded-none",
                                        popoverContent: "rounded-none"
                                    }}
                                    inputProps={{
                                        classNames: {
                                            input: "font-text text-lg",
                                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                        }
                                    }}
                                    listboxProps={{
                                        itemClasses: {
                                            base: "rounded-none"
                                        }
                                    }}
                                >
                                    {vendorOptions.map((vendor) => (
                                        <AutocompleteItem key={vendor.key}>
                                            {vendor.label}
                                        </AutocompleteItem>
                                    ))}
                                </Autocomplete>
                            </div>

                            {/* Order Date */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Order Date
                                </label>
                                <DatePicker
                                    radius={"none"}
                                    size={"lg"}
                                    value={orderDate as any}
                                    onChange={setOrderDate as any}
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
                        </div>

                        {/* Description (Required) */}
                        <div className={"flex flex-col gap-2"}>
                            <label className={"font-headers font-bold text-lg uppercase"}>
                                Description <span className={"text-danger"}>*</span>
                            </label>
                            <Textarea
                                radius={"none"}
                                size={"lg"}
                                placeholder="Brief order description"
                                value={description}
                                onValueChange={setDescription}
                                isRequired
                                minRows={2}
                                maxRows={4}
                                classNames={{
                                    input: "font-text text-lg",
                                    inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                }}
                            />
                        </div>

                        {/* Terms */}
                        <div className={"flex flex-col gap-2"}>
                            <label className={"font-headers font-bold text-lg uppercase"}>
                                Terms
                            </label>
                            <Input
                                radius={"none"}
                                size={"lg"}
                                placeholder="Payment/delivery terms"
                                value={terms}
                                onValueChange={setTerms}
                                classNames={{
                                    input: "font-text text-lg",
                                    inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                }}
                            />
                        </div>

                        {/* Shipping Information */}
                        <div className={"flex flex-col gap-4 py-4 border-t-2 border-primary/20"}>
                            <p className={"font-headers font-bold text-xl uppercase"}>Shipping Information</p>
                            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                                {/* Ship Date */}
                                <div className={"flex flex-col gap-2"}>
                                    <label className={"font-headers font-bold text-lg uppercase"}>
                                        Ship Date
                                    </label>
                                    <DatePicker
                                        radius={"none"}
                                        size={"lg"}
                                        placeholderValue={today(getLocalTimeZone()) as any}
                                        value={shipDate as any}
                                        onChange={setShipDate as any}
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

                                {/* Cancel Date */}
                                <div className={"flex flex-col gap-2"}>
                                    <label className={"font-headers font-bold text-lg uppercase"}>
                                        Cancel Date
                                    </label>
                                    <DatePicker
                                        radius={"none"}
                                        size={"lg"}
                                        placeholderValue={today(getLocalTimeZone()) as any}
                                        value={cancelDate as any}
                                        onChange={setCancelDate as any}
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
                            </div>

                            {/* Shipping Notes */}
                            <div className={"flex flex-col gap-2"}>
                                <label className={"font-headers font-bold text-lg uppercase"}>
                                    Shipping Notes
                                </label>
                                <Textarea
                                    radius={"none"}
                                    size={"lg"}
                                    placeholder="Additional shipping instructions or notes"
                                    value={shippingNotes}
                                    onValueChange={setShippingNotes}
                                    minRows={2}
                                    maxRows={4}
                                    classNames={{
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }}
                                />
                            </div>
                        </div>

                        {/* Ship-To Address */}
                        <div className={"flex flex-col gap-2"}>
                            <label className={"font-headers font-bold text-lg uppercase"}>
                                Ship-To Address
                            </label>
                            <Autocomplete
                                radius={"none"}
                                size={"lg"}
                                placeholder="Select or enter delivery destination"
                                allowsCustomValue
                                inputValue={shipToAddress}
                                onInputChange={setShipToAddress}
                                classNames={{
                                    base: "font-text text-lg",
                                    listboxWrapper: "rounded-none",
                                    popoverContent: "rounded-none"
                                }}
                                inputProps={{
                                    classNames: {
                                        input: "font-text text-lg",
                                        inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                    }
                                }}
                                listboxProps={{
                                    itemClasses: {
                                        base: "rounded-none"
                                    }
                                }}
                            >
                                {shipToAddressOptions.map((address) => (
                                    <AutocompleteItem key={address.key}>
                                        {address.label}
                                    </AutocompleteItem>
                                ))}
                            </Autocomplete>
                        </div>

                        {/* FOB (Freight On Board) */}
                        <div className={"flex flex-col gap-4 py-4 border-t-2 border-primary/20"}>
                            <p className={"font-headers font-bold text-xl uppercase"}>FOB (Freight On Board)</p>
                            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                                <div className={"flex flex-col gap-2"}>
                                    <label className={"font-headers font-bold text-lg uppercase"}>
                                        FOB Type
                                    </label>
                                    <RadioGroup
                                        value={fobType}
                                        onValueChange={(value) => setFobType(value as FOBType)}
                                        orientation="horizontal"
                                        classNames={{
                                            wrapper: "gap-6"
                                        }}
                                    >
                                        <Radio value="Pickup" classNames={{label: "font-text text-lg"}}>
                                            Pickup
                                        </Radio>
                                        <Radio value="Delivered" classNames={{label: "font-text text-lg"}}>
                                            Delivered
                                        </Radio>
                                    </RadioGroup>
                                </div>
                                <div className={"flex flex-col gap-2"}>
                                    <label className={"font-headers font-bold text-lg uppercase"}>
                                        FOB Point / Location
                                    </label>
                                    <Input
                                        radius={"none"}
                                        size={"lg"}
                                        placeholder="Enter FOB point or location"
                                        value={fobPoint}
                                        onValueChange={setFobPoint}
                                        classNames={{
                                            input: "font-text text-lg",
                                            inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Marden's Contacts */}
                        <div className={"flex flex-col gap-4 py-4 border-t-2 border-primary/20"}>
                            <p className={"font-headers font-bold text-xl uppercase"}>Marden's Contacts</p>
                            <div className={"grid grid-cols-1 xl:grid-cols-2 gap-6"}>
                                <div className={"flex items-center gap-3 p-4 bg-primary/10 rounded-lg"}>
                                    <Icon icon={"tabler:truck"} width={24} height={24} className={"text-primary"}/>
                                    <div>
                                        <p className={"font-headers font-bold"}>Traffic</p>
                                        <a href={"mailto:traffic@mardens.com"} className={"text-primary hover:underline"}>
                                            traffic@mardens.com
                                        </a>
                                    </div>
                                </div>
                                <div className={"flex items-center gap-3 p-4 bg-primary/10 rounded-lg"}>
                                    <Icon icon={"tabler:file-invoice"} width={24} height={24} className={"text-primary"}/>
                                    <div>
                                        <p className={"font-headers font-bold"}>AP (Accounts Payable)</p>
                                        <a href={"mailto:ap@mardens.com"} className={"text-primary hover:underline"}>
                                            ap@mardens.com
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Notes/Disclaimers */}
                        <div className={"flex flex-col gap-2"}>
                            <label className={"font-headers font-bold text-lg uppercase"}>
                                Notes / Disclaimers
                            </label>
                            <Textarea
                                radius={"none"}
                                size={"lg"}
                                placeholder="Additional notes or disclaimers"
                                value={notes}
                                onValueChange={setNotes}
                                minRows={3}
                                maxRows={6}
                                classNames={{
                                    input: "font-text text-lg",
                                    inputWrapper: "border-2 border-primary/50 hover:border-primary transition-colors"
                                }}
                            />
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
                    as={Link}
                    href={"/items"}
                >
                    Continue
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