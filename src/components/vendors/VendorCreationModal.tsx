import {addToast, Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useEffect, useState} from "react";
import {PointOfContact, ShipLocation, Vendor} from "./types.ts";
import {VendorInfoSection} from "./VendorInfoSection.tsx";
import {ContactsSection} from "./ContactsSection.tsx";
import {ShipLocationsSection} from "./ShipLocationsSection.tsx";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {useVendorsContext} from "../../providers/VendorsProvider.tsx";

// ============== Modal ==============

type VendorCreationProperties = {
    isOpen: boolean;
    onClose: () => void;
    editingVendor: Vendor | null;
};

export function VendorCreationModal(props: VendorCreationProperties)
{
    const [vendorName, setVendorName] = useState("");
    const [vendorCode, setVendorCode] = useState("");
    const [vendorStatus, setVendorStatus] = useState<string>("Active");
    const [contacts, setContacts] = useState<PointOfContact[]>([]);
    const [shipLocations, setShipLocations] = useState<ShipLocation[]>([]);
    const {getToken} = useAuthentication();
    const {refetch} = useVendorsContext();

    // Populate fields when editing a vendor
    useEffect(() => {
        if (props.editingVendor) {
            setVendorName(props.editingVendor.name);
            setVendorCode(props.editingVendor.code);
            setVendorStatus(props.editingVendor.status);
            setContacts(props.editingVendor.contacts);
            setShipLocations(props.editingVendor.ship_locations);
        } else {
            // Reset fields for create mode
            setVendorName("");
            setVendorCode("");
            setVendorStatus("Active");
            setContacts([]);
            setShipLocations([]);
        }
    }, [props.editingVendor]);

    const handleSubmit = useCallback(async () =>
    {
        const isEditMode = props.editingVendor !== null;
        const url = isEditMode ? `/api/vendors/${props.editingVendor!.id}` : "/api/vendors";
        const method = isEditMode ? "PUT" : "POST";

        try
        {
            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "authorization": `Bearer ${getToken()}`
                },
                body: JSON.stringify({
                    name: vendorName,
                    code: vendorCode,
                    status: vendorStatus.toLowerCase(), // Send "active" or "inactive"
                    contacts: contacts.map(({first_name, last_name, email, phone}) => ({first_name, last_name, email, phone})),
                    ship_locations: shipLocations.map(({address}) => ({address}))
                })
            });

            if (!response.ok)
            {
                const body = await response.text();
                console.error("API Error:", body);
                if (body.includes("Duplicate entry"))
                {
                    throw new Error("Vendor with the same name and code already exists");
                } else
                {
                    throw new Error(`Error ${response.status}: ${body}`);
                }
            }

            await refetch();
            props.onClose();

            addToast({
                title: isEditMode ? "Vendor updated successfully" : "Vendor created successfully",
                color: "success"
            });
        } catch (e: Error | any)
        {
            addToast({
                title: isEditMode ? "Error updating vendor" : "Error creating vendor",
                description: e.message,
                color: "danger"
            });
        }

    }, [vendorName, vendorCode, vendorStatus, contacts, shipLocations, props, getToken, refetch]);

    const isValid = vendorName.trim().length > 0 && vendorCode.length === 3;

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
                        <ModalHeader className="font-headers font-black text-xl uppercase">
                            {props.editingVendor ? "Edit Vendor" : "Create Vendor"}
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            <VendorInfoSection
                                vendorName={vendorName}
                                onVendorNameChange={setVendorName}
                                vendorCode={vendorCode}
                                onVendorCodeChange={setVendorCode}
                                vendorStatus={vendorStatus}
                                onVendorStatusChange={setVendorStatus}
                            />

                            <Divider/>

                            <ContactsSection
                                contacts={contacts}
                                onContactsChange={setContacts}
                            />

                            <Divider/>

                            <ShipLocationsSection
                                locations={shipLocations}
                                onLocationsChange={setShipLocations}
                            />
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                radius="none"
                                endContent={<Icon icon="mdi:check" width={18} height={18}/>}
                                onPress={handleSubmit}
                                isDisabled={!isValid}
                            >
                                {props.editingVendor ? "Update Vendor" : "Create Vendor"}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

// ============== Context ==============

type VendorCreationContextType = {
    openVendorCreationModal: () => void;
    openVendorEditModal: (vendor: Vendor) => void;
    closeVendorCreationModal: () => void;
}

const VendorCreationContext = createContext<VendorCreationContextType | undefined>(undefined);

export function VendorCreationProvider({children}: { children: ReactNode })
{
    const [isOpen, setIsOpen] = useState(false);
    const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

    const openVendorCreationModal = useCallback(() => {
        setEditingVendor(null);
        setIsOpen(true);
    }, []);

    const openVendorEditModal = useCallback((vendor: Vendor) => {
        setEditingVendor(vendor);
        setIsOpen(true);
    }, []);

    const closeVendorCreationModal = useCallback(() => setIsOpen(false), []);

    return (
        <VendorCreationContext.Provider value={{openVendorCreationModal, openVendorEditModal, closeVendorCreationModal}}>
            <VendorCreationModal isOpen={isOpen} onClose={() => setIsOpen(false)} editingVendor={editingVendor}/>
            {children}
        </VendorCreationContext.Provider>
    );
}

export function useVendorCreation(): VendorCreationContextType
{
    const context = useContext(VendorCreationContext);
    if (!context)
    {
        throw new Error("useVendorCreation must be used within a VendorCreationProvider");
    }
    return context;
}
