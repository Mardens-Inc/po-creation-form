import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {CalendarDate, parseDate} from "@internationalized/date";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {useVendors} from "../../hooks/useVendors.ts";
import {FOBSection, FOBType, MardensContactsSection, OrderDetailsSection, PONumberSection, ShippingInfoSection, UploadFileItem, UploadFileType, UploadManifestSection} from "./po-information";
import {POFile, POLineItem, POStatus} from "../../types/po.ts";
import {ModalSection} from "../ModalSection.tsx";

// Full PO data from backend
interface FullPurchaseOrder {
    id: number;
    po_number: string;
    vendor_id: number;
    buyer_id: number;
    status: POStatus;
    description: string;
    order_date: string;
    ship_date: string | null;
    cancel_date: string | null;
    shipping_notes: string | null;
    terms: string;
    ship_to_address: string;
    fob_type: number;
    fob_point: string;
    notes: string | null;
    total_amount: number;
    created_at: string | null;
    vendor_name: string;
    buyer_name: string;
    files: POFile[];
    line_items: POLineItem[];
}

type POEditModalProps = {
    isOpen: boolean;
    onClose: () => void;
    poId: number | null;
    onSaved?: () => void;
};

function parseBackendDate(dateStr: string | null): CalendarDate | null {
    if (!dateStr) return null;
    try {
        // Handle date string format "YYYY-MM-DD"
        const datePart = dateStr.split("T")[0];
        return parseDate(datePart);
    } catch {
        return null;
    }
}

export function POEditModal(props: POEditModalProps) {
    const {getToken} = useAuthentication();
    const {vendors, isLoading: isLoadingVendors} = useVendors();
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [originalPO, setOriginalPO] = useState<FullPurchaseOrder | null>(null);

    const vendorOptions = useMemo(() =>
            vendors.map(v => ({key: String(v.id), label: v.name})),
        [vendors]
    );

    // Form state
    const [poNumber, setPoNumber] = useState("");
    const [vendorName, setVendorName] = useState("");
    const [orderDate, setOrderDate] = useState<CalendarDate | null>(null);
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
    const [status, setStatus] = useState<POStatus>(POStatus.Draft);

    // Load PO data when modal opens
    useEffect(() => {
        if (props.isOpen && props.poId) {
            loadPurchaseOrder(props.poId);
        }
    }, [props.isOpen, props.poId]);

    const loadPurchaseOrder = async (id: number) => {
        const token = getToken();
        if (!token) return;

        setIsLoading(true);
        try {
            const response = await fetch(`/api/purchase-orders/${id}`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                throw new Error("Failed to load purchase order");
            }

            const po: FullPurchaseOrder = await response.json();
            setOriginalPO(po);

            // Populate form fields
            setPoNumber(po.po_number);
            setVendorName(po.vendor_name);
            setOrderDate(parseBackendDate(po.order_date));
            setShipDate(parseBackendDate(po.ship_date));
            setCancelDate(parseBackendDate(po.cancel_date));
            setShippingNotes(po.shipping_notes || "");
            setDescription(po.description);
            setTerms(po.terms);
            setShipToAddress(po.ship_to_address);
            setFobType(po.fob_type === 0 ? "Pickup" : "Delivered");
            setFobPoint(po.fob_point);
            setNotes(po.notes || "");
            setStatus(po.status);
            setFiles([]); // New files to upload - existing files shown separately
        } catch (error) {
            console.error("Error loading PO:", error);
            addToast({
                title: "Error loading Purchase Order",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger"
            });
            props.onClose();
        } finally {
            setIsLoading(false);
        }
    };

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

    const handleSubmit = useCallback(async () => {
        const token = getToken();
        if (!token || !props.poId) {
            addToast({title: "Not authenticated", color: "danger"});
            return;
        }

        // Validate required fields
        if (!vendorName) {
            addToast({title: "Please select a vendor", color: "warning"});
            return;
        }

        if (!orderDate) {
            addToast({title: "Please select an order date", color: "warning"});
            return;
        }

        // Find vendor ID from vendor name
        const selectedVendor = vendors.find(v => v.name === vendorName || String(v.id) === vendorName);
        if (!selectedVendor) {
            addToast({title: "Invalid vendor selected", color: "danger"});
            return;
        }

        setIsSubmitting(true);

        try {
            // Format dates for API
            const formatDate = (date: CalendarDate | null) =>
                date ? `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}` : null;

            // Update the PO
            const updateResponse = await fetch(`/api/purchase-orders/${props.poId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    po_number: poNumber,
                    vendor_id: selectedVendor.id,
                    status: status,
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

            if (!updateResponse.ok) {
                const errorData = await updateResponse.json().catch(() => ({}));
                throw new Error(errorData.error || `Failed to update PO: ${updateResponse.status}`);
            }

            // Upload any new manifest files
            for (const file of files) {
                const assetType = file.asset_type === UploadFileType.Manifest ? 1 : 0;
                const uploadUrl = `/api/purchase-orders/${props.poId}/files?filename=${encodeURIComponent(file.filename)}&asset_type=${assetType}`;

                const fileBuffer = await file.file.arrayBuffer();

                const uploadResponse = await fetch(uploadUrl, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`,
                        "Content-Type": "application/octet-stream"
                    },
                    body: fileBuffer
                });

                if (!uploadResponse.ok) {
                    console.error(`Failed to upload file ${file.filename}:`, await uploadResponse.text());
                    addToast({
                        title: `Warning: Failed to upload ${file.filename}`,
                        color: "warning"
                    });
                }
            }

            addToast({
                title: "Purchase Order updated successfully",
                description: `PO #${poNumber} has been updated`,
                color: "success"
            });

            props.onSaved?.();
            props.onClose();
        } catch (error) {
            console.error("Error updating PO:", error);
            addToast({
                title: "Error updating Purchase Order",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger"
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [getToken, props, vendorName, orderDate, vendors, poNumber, status, description, shipDate, cancelDate, shippingNotes, terms, shipToAddress, fobType, fobPoint, notes, files]);

    const buyerId = originalPO?.buyer_id ?? 0;

    return (
        <Modal
            isOpen={props.isOpen}
            onClose={props.onClose}
            size="5xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="font-headers font-black text-xl uppercase flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <Icon icon="mage:box-3d-scan" width={20} height={20}/>
                            </div>
                            Edit Purchase Order {originalPO && `#${originalPO.po_number}`}
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Spinner size="lg"/>
                                    <span className="ml-4">Loading purchase order...</span>
                                </div>
                            ) : (
                                <>
                                    <ModalSection icon="mdi:pound" label="PO Number" color="primary" showDivider={false}>
                                        <PONumberSection
                                            poNumber={poNumber}
                                            buyerId={buyerId}
                                            onPoNumberChange={handlePoNumberChange}
                                        />
                                    </ModalSection>

                                    <ModalSection icon="mdi:file-document-outline" label="Order Details" color="primary">
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
                                    </ModalSection>

                                    <ModalSection icon="tabler:truck" label="Shipping" color="success">
                                        <ShippingInfoSection
                                            shipDate={shipDate}
                                            onShipDateChange={handleShipDateChange}
                                            cancelDate={cancelDate}
                                            onCancelDateChange={handleCancelDateChange}
                                            shippingNotes={shippingNotes}
                                            onShippingNotesChange={handleShippingNotesChange}
                                        />
                                    </ModalSection>

                                    <ModalSection icon="mdi:map-marker-outline" label="FOB" color="warning">
                                        <FOBSection
                                            fobType={fobType}
                                            onFobTypeChange={handleFobTypeChange}
                                            fobPoint={fobPoint}
                                            onFobPointChange={handleFobPointChange}
                                        />
                                    </ModalSection>

                                    <ModalSection icon="mdi:contacts-outline" label="Marden's Contacts" color="secondary">
                                        <MardensContactsSection/>
                                    </ModalSection>

                                    {/* Existing Files */}
                                    {originalPO && originalPO.files.length > 0 && (
                                        <ModalSection icon="tabler:file-spreadsheet" label="Existing Files" color="secondary">
                                            <div className="flex flex-col gap-2">
                                                {originalPO.files.map(file => (
                                                    <div key={file.id} className="flex items-center gap-4 p-3 bg-default-100 rounded-lg">
                                                        <Icon icon="tabler:file-spreadsheet" width={24}/>
                                                        <div className="flex-1">
                                                            <p className="font-medium">{file.filename}</p>
                                                            <p className="text-xs text-default-500">
                                                                {file.asset_type === 1 ? "Manifest" : "Asset"}
                                                                {file.uploaded_at && ` • Uploaded ${new Date(file.uploaded_at).toLocaleDateString()}`}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </ModalSection>
                                    )}

                                    <ModalSection icon="tabler:cloud-upload" label="Upload Manifest" color="danger">
                                        <UploadManifestSection
                                            files={files}
                                            onFilesChange={handleFilesChange}
                                        />
                                    </ModalSection>

                                    {/* Line Items Summary */}
                                    {originalPO && originalPO.line_items.length > 0 && (
                                        <ModalSection icon="mdi:format-list-numbered" label={`Line Items (${originalPO.line_items.length})`} color="warning">
                                            <div className="max-h-64 overflow-y-auto">
                                                <table className="w-full text-sm">
                                                    <thead className="bg-default-100 sticky top-0">
                                                    <tr>
                                                        <th className="text-left p-2">Item #</th>
                                                        <th className="text-left p-2">Description</th>
                                                        <th className="text-right p-2">Qty</th>
                                                        <th className="text-right p-2">Cost</th>
                                                        <th className="text-right p-2">Total</th>
                                                    </tr>
                                                    </thead>
                                                    <tbody>
                                                    {originalPO.line_items.map(item => (
                                                        <tr key={item.id} className="border-b border-default-200">
                                                            <td className="p-2 font-mono">{item.item_number}</td>
                                                            <td className="p-2 truncate max-w-[200px]">{item.description}</td>
                                                            <td className="p-2 text-right">{item.qty}</td>
                                                            <td className="p-2 text-right">${item.mardens_cost.toFixed(2)}</td>
                                                            <td className="p-2 text-right">${(item.qty * item.mardens_cost).toFixed(2)}</td>
                                                        </tr>
                                                    ))}
                                                    </tbody>
                                                    <tfoot className="bg-default-100 font-bold">
                                                    <tr>
                                                        <td colSpan={4} className="p-2 text-right">Total:</td>
                                                        <td className="p-2 text-right">
                                                            ${originalPO.line_items.reduce((sum, item) => sum + item.qty * item.mardens_cost, 0).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                    </tfoot>
                                                </table>
                                            </div>
                                            <p className="text-xs text-default-500">
                                                Upload a new manifest file to replace the existing line items.
                                            </p>
                                        </ModalSection>
                                    )}
                                </>
                            )}
                        </ModalBody>
                        <ModalFooter>
                            <Button
                                variant="light"
                                onPress={onClose}
                                isDisabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                radius="sm"
                                endContent={!isSubmitting && <Icon icon="mdi:check" width={18} height={18}/>}
                                onPress={handleSubmit}
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting || isLoading}
                            >
                                {isSubmitting ? "Saving..." : "Save Changes"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

// ============== Context ==============

type POEditContextType = {
    openPOEditModal: (poId: number) => void;
    closePOEditModal: () => void;
}

const POEditContext = createContext<POEditContextType | undefined>(undefined);

type POEditProviderProps = {
    children: ReactNode;
    onSaved?: () => void;
}

export function POEditProvider({children, onSaved}: POEditProviderProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingPoId, setEditingPoId] = useState<number | null>(null);

    const openPOEditModal = useCallback((poId: number) => {
        setEditingPoId(poId);
        setIsOpen(true);
    }, []);

    const closePOEditModal = useCallback(() => {
        setIsOpen(false);
        setEditingPoId(null);
    }, []);

    return (
        <POEditContext.Provider value={{openPOEditModal, closePOEditModal}}>
            <POEditModal
                isOpen={isOpen}
                onClose={closePOEditModal}
                poId={editingPoId}
                onSaved={onSaved}
            />
            {children}
        </POEditContext.Provider>
    );
}

export function usePOEdit(): POEditContextType {
    const context = useContext(POEditContext);
    if (!context) {
        throw new Error("usePOEdit must be used within a POEditProvider");
    }
    return context;
}
