import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {useVendorsContext} from "../../providers/VendorsProvider.tsx";
import {FOBSection, FOBType, MardensContactsSection, OrderDetailsSection, PONumberSection, ShippingInfoSection, UploadFileItem, UploadFileType, UploadManifestSection} from "./po-information";

type POCreationProperties = {
    isOpen: boolean;
    onClose: () => void;
};

// Generate initial PO number: 1 + buyerId (2 digits) + sequential (4 digits)
const generateInitialPoNumber = (buyerId: number, sequentialNumber: number): string =>
{
    const buyerIdStr = String(buyerId).padStart(2, "0");
    const seqStr = String(sequentialNumber).padStart(4, "0");
    return `1${buyerIdStr}${seqStr}`;
};

const getSequentialFromPoNumber = (poNumber: string): number =>
{
    const baseNumber = poNumber.replace(/-[a-zA-Z0-9]+$/, "");
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

export function POCreationModal(props: POCreationProperties)
{
    const {currentUser, getToken} = useAuthentication();
    const buyerId = currentUser?.id ?? 0;
    const {vendors, isLoading: isLoadingVendors} = useVendorsContext();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const vendorOptions = useMemo(() =>
        vendors.map(v => ({key: String(v.id), label: v.name})),
        [vendors]
    );

    const [poNumber, setPoNumber] = useState(() =>
    {
        const sequential = getPoSequentialFromLocalStorage(buyerId);
        return generateInitialPoNumber(buyerId, sequential);
    });
    const [vendorName, setVendorName] = useState("");
    const [orderDate, setOrderDate] = useState<CalendarDate | null>(today(getLocalTimeZone()));
    const [shipDate, setShipDate] = useState<CalendarDate | null>(null);
    const [cancelDate, setCancelDate] = useState<CalendarDate | null>(null);
    const [shippingNotes, setShippingNotes] = useState("");
    const [description, setDescription] = useState("");
    const [terms, setTerms] = useState("");
    const [shipToAddress, setShipToAddress] = useState("");
    const [fobType, setFobType] = useState<FOBType>("Pickup");
    const [fobPoint, setFobPoint] = useState("");
    const [notes, setNotes] = useState("");
    const [files, setFiles] = useState<UploadFileItem[]>([]);

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
    const handleFilesChange = useCallback((value: UploadFileItem[]) => setFiles(value), []);

    const handleSubmit = useCallback(async () =>
    {
        const token = getToken();
        if (!token)
        {
            addToast({title: "Not authenticated", color: "danger"});
            return;
        }

        // Validate required fields
        if (!vendorName)
        {
            addToast({title: "Please select a vendor", color: "warning"});
            return;
        }

        if (!orderDate)
        {
            addToast({title: "Please select an order date", color: "warning"});
            return;
        }

        // Find vendor ID from vendor name
        const selectedVendor = vendors.find(v => v.name === vendorName || String(v.id) === vendorName);
        if (!selectedVendor)
        {
            addToast({title: "Invalid vendor selected", color: "danger"});
            return;
        }

        setIsSubmitting(true);

        try
        {
            // Format dates for API
            const formatDate = (date: CalendarDate | null) =>
                date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : null;

            // Step 1: Create the PO
            const createResponse = await fetch("/api/purchase-orders", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    po_number: poNumber,
                    vendor_id: selectedVendor.id,
                    description: description || "Purchase Order",
                    order_date: formatDate(orderDate),
                    ship_date: formatDate(shipDate),
                    cancel_date: formatDate(cancelDate),
                    shipping_notes: shippingNotes || null,
                    terms: terms || "",
                    ship_to_address: shipToAddress || "",
                    fob_type: fobType === "Pickup" ? 0 : 1,
                    fob_point: fobPoint || "",
                    notes: notes || null
                })
            });

            if (!createResponse.ok)
            {
                const errorData = await createResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to create PO: ${createResponse.status}`);
            }

            const createdPO = await createResponse.json();
            const poId = createdPO.id;

            // Step 2: Upload manifest files
            for (const file of files)
            {
                const assetType = file.asset_type === UploadFileType.Manifest ? 1 : 0;
                const uploadUrl = `/api/purchase-orders/${poId}/files?filename=${encodeURIComponent(file.filename)}&asset_type=${assetType}`;

                const fileBuffer = await file.file.arrayBuffer();

                const uploadResponse = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/octet-stream"
                    },
                    body: fileBuffer
                });

                if (!uploadResponse.ok)
                {
                    console.error(`Failed to upload file ${file.filename}:`, await uploadResponse.text());
                    addToast({
                        title: `Warning: Failed to upload ${file.filename}`,
                        color: "warning"
                    });
                }
            }

            addToast({
                title: "Purchase Order created successfully",
                description: `PO #${poNumber} has been created`,
                color: "success"
            });

            // Reset form
            const nextSequential = getSequentialFromPoNumber(poNumber) + 1;
            savePoSequentialToLocalStorage(buyerId, nextSequential);
            setPoNumber(generateInitialPoNumber(buyerId, nextSequential));
            setVendorName("");
            setOrderDate(today(getLocalTimeZone()));
            setShipDate(null);
            setCancelDate(null);
            setShippingNotes("");
            setDescription("");
            setTerms("");
            setShipToAddress("");
            setFobType("Pickup");
            setFobPoint("");
            setNotes("");
            setFiles([]);

            props.onClose();
        } catch (error)
        {
            console.error("Error creating PO:", error);
            addToast({
                title: "Error creating Purchase Order",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally
        {
            setIsSubmitting(false);
        }
    }, [getToken, vendorName, orderDate, vendors, poNumber, description, shipDate, cancelDate, shippingNotes, terms, shipToAddress, fobType, fobPoint, notes, files, buyerId, props]);

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            size="5xl"
            scrollBehavior="inside"
            backdrop={"blur"}
        >
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="font-headers font-black text-xl uppercase">
                            Create Purchase Order
                        </ModalHeader>
                        <ModalBody className="gap-0">
                            {/* PO Number Section */}
                            <PONumberSection
                                poNumber={poNumber}
                                buyerId={buyerId}
                                onPoNumberChange={handlePoNumberChange}
                            />

                            {/* Order Details Section */}
                            <div className="flex flex-col gap-6 py-6">
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
                                    vendors={vendorOptions}
                                    isLoadingVendors={isLoadingVendors}
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
                                    files={files}
                                    onFilesChange={handleFilesChange}
                                />
                            </div>
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                radius="none"
                                endContent={!isSubmitting && <Icon icon="mdi:check" width={18} height={18}/>}
                                onPress={handleSubmit}
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting}
                            >
                                {isSubmitting ? "Creating..." : "Create PO"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
type POCreationContextType = {
    openPOCreationModal: () => void;
    closePOCreationModal: () => void;
}

const POCreationContext = createContext<POCreationContextType | undefined>(undefined);

export function POCreationProvider({children}: { children: ReactNode })
{
    const [isOpen, setIsOpen] = useState(false);

    const openPOCreationModal = useCallback(() => setIsOpen(true), []);
    const closePOCreationModal = useCallback(() => setIsOpen(false), []);

    return (
        <POCreationContext.Provider value={{openPOCreationModal, closePOCreationModal}}>
            <POCreationModal isOpen={isOpen} onClose={()=>setIsOpen(false)}/>
            {children}
        </POCreationContext.Provider>
    );
}

export function usePOCreation(): POCreationContextType
{
    const context = useContext(POCreationContext);
    if (!context)
    {
        throw new Error("usePOCreation must be used within a POCreationProvider");
    }
    return context;
}