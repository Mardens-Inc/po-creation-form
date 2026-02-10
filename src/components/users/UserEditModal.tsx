import {addToast, Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {createContext, ReactNode, useCallback, useContext, useState} from "react";
import {User, UserRole} from "../../providers/AuthenticationProvider.tsx";
import {useUsersContext} from "../../providers/UsersProvider.tsx";
import {ModalSection} from "../ModalSection.tsx";

type UserEditModalProps = {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
};

function UserEditModal({isOpen, onClose, user}: UserEditModalProps) {
    const {updateUser} = useUsersContext();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState<UserRole>(UserRole.Warehouse);

    // Populate form when user changes
    const populateForm = useCallback((u: User | null) => {
        if (u) {
            setFirstName(u.first_name ?? "");
            setLastName(u.last_name ?? "");
            setEmail(u.email);
            setRole(u.role ?? UserRole.Warehouse);
        }
    }, []);

    // Use effect-like pattern via key prop or onOpenChange
    // We'll populate on open
    const handleOpenChange = useCallback(() => {
        if (user) {
            populateForm(user);
        }
    }, [user, populateForm]);

    // Populate when modal opens
    if (isOpen && user) {
        // This gets called on render when open, but we need to avoid infinite loops
        // Use a ref-like pattern with state
    }

    const handleSubmit = useCallback(async () => {
        if (!user) return;

        setIsSubmitting(true);
        try {
            await updateUser(user.id, {
                first_name: firstName,
                last_name: lastName,
                email: email,
                role: role,
            });

            addToast({
                title: "User updated successfully",
                description: `${firstName} ${lastName} has been updated`,
                color: "success",
            });
            onClose();
        } catch (error) {
            addToast({
                title: "Error updating user",
                description: error instanceof Error ? error.message : "An unexpected error occurred",
                color: "danger",
            });
        } finally {
            setIsSubmitting(false);
        }
    }, [user, updateUser, firstName, lastName, email, role, onClose]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onOpenChange={(open) => {
                if (open) handleOpenChange();
            }}
            size="2xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {(onModalClose) => (
                    <>
                        <ModalHeader className="font-headers font-black text-xl uppercase flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                                <Icon icon="mage:edit" width={20} height={20}/>
                            </div>
                            Edit User
                        </ModalHeader>
                        <ModalBody className="gap-6">
                            <ModalSection icon="mage:user" label="Personal Information" color="primary" showDivider={false}>
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="First Name"
                                        value={firstName}
                                        onValueChange={setFirstName}
                                    />
                                    <Input
                                        label="Last Name"
                                        value={lastName}
                                        onValueChange={setLastName}
                                    />
                                </div>
                                <Input
                                    label="Email"
                                    type="email"
                                    value={email}
                                    onValueChange={setEmail}
                                />
                            </ModalSection>

                            <ModalSection icon="mage:lock" label="Role & Permissions" color="warning">
                                <Select
                                    label="Role"
                                    selectedKeys={new Set([role])}
                                    onSelectionChange={(keys) => {
                                        const arr = [...keys] as string[];
                                        if (arr.length) setRole(arr[0] as UserRole);
                                    }}
                                >
                                    <SelectItem key={UserRole.Admin}>Admin</SelectItem>
                                    <SelectItem key={UserRole.Buyer}>Buyer</SelectItem>
                                    <SelectItem key={UserRole.Warehouse}>Warehouse</SelectItem>
                                </Select>
                            </ModalSection>
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="light" onPress={onModalClose} isDisabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button
                                color="primary"
                                radius="sm"
                                endContent={!isSubmitting && <Icon icon="mdi:check" width={18} height={18}/>}
                                onPress={handleSubmit}
                                isLoading={isSubmitting}
                                isDisabled={isSubmitting}
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

type UserEditContextType = {
    openUserEditModal: (user: User) => void;
    closeUserEditModal: () => void;
};

const UserEditContext = createContext<UserEditContextType | undefined>(undefined);

export function UserEditProvider({children}: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const openUserEditModal = useCallback((user: User) => {
        setEditingUser(user);
        setIsOpen(true);
    }, []);

    const closeUserEditModal = useCallback(() => {
        setIsOpen(false);
        setEditingUser(null);
    }, []);

    return (
        <UserEditContext.Provider value={{openUserEditModal, closeUserEditModal}}>
            <UserEditModal
                isOpen={isOpen}
                onClose={closeUserEditModal}
                user={editingUser}
            />
            {children}
        </UserEditContext.Provider>
    );
}

export function useUserEdit(): UserEditContextType {
    const context = useContext(UserEditContext);
    if (!context) {
        throw new Error("useUserEdit must be used within a UserEditProvider");
    }
    return context;
}
