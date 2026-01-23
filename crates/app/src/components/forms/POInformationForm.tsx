import {Button, Link} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useCallback, useEffect, useRef, useState} from "react";
import {InfoCard} from "../InfoCard.tsx";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {useFormDataStore} from "../../stores/useFormDataStore.ts";
import {open} from "@tauri-apps/plugin-dialog";
import {useTauriDragDropZone} from "../../hooks/useTauriDragDropZone.ts";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {
    FOBSection,
    FOBType,
    manifestExtensions,
    MardensContactsSection,
    OrderDetailsSection,
    POInformationFormData,
    PONumberSection,
    ShippingInfoSection,
    UploadFileItem,
    UploadFileType,
    UploadManifestSection
} from "./po-information";

// Re-export types for external use
export type {POInformationFormData, UploadFileItem, FOBType};
export {UploadFileType};

// Generate initial PO number: 1 + buyerId (2 digits) + sequential (4 digits)
// Format: 1XXYYYY where XX is buyer ID, YYYY is sequential number
const generateInitialPoNumber = (buyerId: number, sequentialNumber: number): string =>
{
    const buyerIdStr = String(buyerId).padStart(2, "0");
    const seqStr = String(sequentialNumber).padStart(4, "0");
    return `1${buyerIdStr}${seqStr}`;
};

// Extract sequential number from PO (for local storage)
const getSequentialFromPoNumber = (poNumber: string): number =>
{
    // Remove extension if present
    const baseNumber = poNumber.replace(/-[a-zA-Z0-9]+$/, "");
    // Get last 4 digits (or fewer if shorter)
    const seqPart = baseNumber.slice(-4);
    return parseInt(seqPart, 10) || 1;
};

const getPoSequentialFromLocalStorage = (buyerId: number): number =>
{
    const key = `po_last_sequential_${buyerId}`;
    const stored = localStorage.getItem(key);
    return stored ? parseInt(stored, 10) : 1;
};

const savePoSequentialToLocalStorage = (buyerId: number, sequential: number) =>
{
    const key = `po_last_sequential_${buyerId}`;
    localStorage.setItem(key, sequential.toString());
};

export function POInformationForm()
{
    const {uploadForm, setUploadForm} = useFormDataStore();
    const {currentUser} = useAuthentication();

    // Use user ID from authentication as buyer ID
    const buyerId = currentUser?.id ?? 0;

    // Initialize PO number from local storage or generate new one
    const [poNumber, setPoNumber] = useState(() =>
    {
        if (uploadForm.po_number && uploadForm.po_number.length > 0)
        {
            return uploadForm.po_number;
        }
        const sequential = getPoSequentialFromLocalStorage(buyerId);
        return generateInitialPoNumber(buyerId, sequential);
    });

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

    // Update PO number when buyer ID changes
    useEffect(() =>
    {
        const sequential = getPoSequentialFromLocalStorage(buyerId);
        setPoNumber(generateInitialPoNumber(buyerId, sequential));
    }, [buyerId]);

    // Save sequential number to local storage whenever PO number changes
    useEffect(() =>
    {
        const sequential = getSequentialFromPoNumber(poNumber);
        savePoSequentialToLocalStorage(buyerId, sequential);
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

    // Memoized callbacks for child components
    const handlePoNumberChange = useCallback((value: string) => setPoNumber(value), []);
    const handleVendorNameChange = useCallback((value: string) => setVendorName(value), []);
    const handleOrderDateChange = useCallback((value: CalendarDate | null) => setOrderDate(value), []);
    const handleDescriptionChange = useCallback((value: string) => setDescription(value), []);
    const handleTermsChange = useCallback((value: string) => setTerms(value), []);
    const handleShipToAddressChange = useCallback((value: string) => setShipToAddress(value), []);
    const handleNotesChange = useCallback((value: string) => setNotes(value), []);
    const handleShipDateChange = useCallback((value: CalendarDate | null) => setShipDate(value), []);
    const handleCancelDateChange = useCallback((value: CalendarDate | null) => setCancelDate(value), []);
    const handleShippingNotesChange = useCallback((value: string) => setShippingNotes(value), []);
    const handleFobTypeChange = useCallback((value: FOBType) => setFobType(value), []);
    const handleFobPointChange = useCallback((value: string) => setFobPoint(value), []);

    const handleFilesChange = useCallback((files: UploadFileItem[]) =>
    {
        setUploadForm({...uploadForm, files});
    }, [uploadForm, setUploadForm]);

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

    const selectFile = useCallback(async () =>
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
    }, [handleFiles]);

    // Use Tauri drag-drop hook for the specific drop zone
    const {isDraggingOver} = useTauriDragDropZone(dragDropAreaRef, handleFiles);

    return (
        <div className={"flex flex-col h-full gap-8 mb-16"} ref={dragDropAreaRef}>
            <InfoCard>
                <InfoCard.Header>Purchase Order</InfoCard.Header>
                <InfoCard.Body>
                    {/* PO Number Section */}
                    <PONumberSection
                        poNumber={poNumber}
                        buyerId={buyerId}
                        onPoNumberChange={handlePoNumberChange}
                    />

                    {/* Order Details Section */}
                    <div className={"flex flex-col gap-6 py-6"}>
                        <OrderDetailsSection
                            vendorName={vendorName}
                            onVendorNameChange={handleVendorNameChange}
                            orderDate={orderDate}
                            onOrderDateChange={handleOrderDateChange}
                            description={description}
                            onDescriptionChange={handleDescriptionChange}
                            terms={terms}
                            onTermsChange={handleTermsChange}
                            shipToAddress={shipToAddress}
                            onShipToAddressChange={handleShipToAddressChange}
                            notes={notes}
                            onNotesChange={handleNotesChange}
                        />

                        {/* Shipping Information */}
                        <ShippingInfoSection
                            shipDate={shipDate}
                            onShipDateChange={handleShipDateChange}
                            cancelDate={cancelDate}
                            onCancelDateChange={handleCancelDateChange}
                            shippingNotes={shippingNotes}
                            onShippingNotesChange={handleShippingNotesChange}
                        />

                        {/* FOB Section */}
                        <FOBSection
                            fobType={fobType}
                            onFobTypeChange={handleFobTypeChange}
                            fobPoint={fobPoint}
                            onFobPointChange={handleFobPointChange}
                        />

                        {/* Marden's Contacts */}
                        <MardensContactsSection/>

                        {/* Upload Manifest Section */}
                        <UploadManifestSection
                            files={uploadForm.files}
                            onFilesChange={handleFilesChange}
                            isDraggingOver={isDraggingOver}
                            onSelectFile={selectFile}
                        />
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
