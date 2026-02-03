import {Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {CalendarDate, getLocalTimeZone, today} from "@internationalized/date";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {useVendors} from "../../hooks/useVendors.ts";
import {FOBSection, FOBType, MardensContactsSection, OrderDetailsSection, PONumberSection, ShippingInfoSection, UploadFileItem, UploadManifestSection} from "./po-information";

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
    const {currentUser} = useAuthentication();
    const buyerId = currentUser?.id ?? 0;
    const {vendors, isLoading: isLoadingVendors} = useVendors();

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

    const handleSubmit = useCallback(() =>
    {
        // TODO: Submit PO to API
        console.log("Submitting PO:", {
            po_number: poNumber,
            buyer_id: buyerId,
            vendor_name: vendorName,
            order_date: orderDate,
            ship_date: shipDate,
            cancel_date: cancelDate,
            shipping_notes: shippingNotes,
            description,
            terms,
            ship_to_address: shipToAddress,
            fob_type: fobType,
            fob_point: fobPoint,
            notes,
            files
        });
        props.onClose();
    }, [poNumber, buyerId, vendorName, orderDate, shipDate, cancelDate, shippingNotes, description, terms, shipToAddress, fobType, fobPoint, notes, files, props]);

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
                                endContent={<Icon icon="mdi:check" width={18} height={18}/>}
                                onPress={handleSubmit}
                            >
                                Create PO
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