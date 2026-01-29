import {Button, Divider, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import {PointOfContact, ShipLocation} from "./types.ts";
import {VendorInfoSection} from "./VendorInfoSection.tsx";
import {ContactsSection} from "./ContactsSection.tsx";
import {ShipLocationsSection} from "./ShipLocationsSection.tsx";

// ============== Modal ==============

type VendorCreationProperties = {
    isOpen: boolean;
    onClose: () => void;
};

export function VendorCreationModal(props: VendorCreationProperties)
{
    const [vendorName, setVendorName] = useState("");
    const [vendorCode, setVendorCode] = useState("");
    const [contacts, setContacts] = useState<PointOfContact[]>([]);
    const [shipLocations, setShipLocations] = useState<ShipLocation[]>([]);

    const handleSubmit = useCallback(() =>
    {
        // TODO: Submit vendor to API
        console.log("Submitting Vendor:", {
            vendor_name: vendorName,
            vendor_code: vendorCode,
            contacts,
            ship_locations: shipLocations,
        });
        props.onClose();
    }, [vendorName, vendorCode, contacts, shipLocations, props]);

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
                            Create Vendor
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            <VendorInfoSection
                                vendorName={vendorName}
                                onVendorNameChange={setVendorName}
                                vendorCode={vendorCode}
                                onVendorCodeChange={setVendorCode}
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
                                Create Vendor
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
    closeVendorCreationModal: () => void;
}

const VendorCreationContext = createContext<VendorCreationContextType | undefined>(undefined);

export function VendorCreationProvider({children}: { children: ReactNode })
{
    const [isOpen, setIsOpen] = useState(false);

    const openVendorCreationModal = useCallback(() => setIsOpen(true), []);
    const closeVendorCreationModal = useCallback(() => setIsOpen(false), []);

    return (
        <VendorCreationContext.Provider value={{openVendorCreationModal, closeVendorCreationModal}}>
            <VendorCreationModal isOpen={isOpen} onClose={() => setIsOpen(false)}/>
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
