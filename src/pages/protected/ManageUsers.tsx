import {useCallback, useMemo, useState} from "react";
import {addToast, Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useUsersContext} from "../../providers/UsersProvider.tsx";
import {useUserFilters} from "../../hooks/useUserFilters.ts";
import {UserFilters} from "../../components/users/UserFilters.tsx";
import {UserTable} from "../../components/users/UserTable.tsx";
import {useUserEdit} from "../../components/users/UserEditModal.tsx";
import {StatCard} from "../../components/dashboard/StatCard.tsx";
import {User} from "../../providers/AuthenticationProvider.tsx";

type ConfirmAction = {
    title: string;
    description: string;
    color: "danger" | "warning";
    action: () => Promise<void>;
};

export function ManageUsers() {
    const {users, isLoading, error, getUserStats, forcePasswordReset, disableUserMFA, deleteUser} = useUsersContext();
    const {filters, setFilter, clearFilters, hasActiveFilters} = useUserFilters();
    const {openUserEditModal} = useUserEdit();
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<ConfirmAction | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    const stats = getUserStats();

    const filteredUsers = useMemo(() => {
        let result = [...users];

        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(u =>
                `${u.first_name} ${u.last_name}`.toLowerCase().includes(s)
                || u.email.toLowerCase().includes(s)
            );
        }
        if (filters.roles.length) {
            result = result.filter(u => filters.roles.includes(u.role ?? "Warehouse"));
        }
        if (filters.mfa === "enabled") {
            result = result.filter(u => u.mfa_enabled);
        } else if (filters.mfa === "disabled") {
            result = result.filter(u => !u.mfa_enabled);
        }
        if (filters.status === "active") {
            result = result.filter(u => u.has_confirmed_email && !u.needs_password_reset);
        } else if (filters.status === "pending_reset") {
            result = result.filter(u => u.needs_password_reset);
        } else if (filters.status === "unconfirmed") {
            result = result.filter(u => !u.has_confirmed_email);
        }

        return result;
    }, [users, filters]);

    const handleForceReset = useCallback((user: User) => {
        setConfirmAction({
            title: "Force Password Reset",
            description: `Are you sure you want to force a password reset for ${user.first_name} ${user.last_name}? They will be logged out and receive a reset email.`,
            color: "warning",
            action: async () => {
                await forcePasswordReset(user.id);
                addToast({
                    title: "Password reset forced",
                    description: `${user.first_name} ${user.last_name} will need to reset their password`,
                    color: "success",
                });
            },
        });
    }, [forcePasswordReset]);

    const handleDisableMFA = useCallback((user: User) => {
        setConfirmAction({
            title: "Disable MFA",
            description: `Are you sure you want to disable MFA for ${user.first_name} ${user.last_name}? They will need to re-enable it manually.`,
            color: "warning",
            action: async () => {
                await disableUserMFA(user.id);
                addToast({
                    title: "MFA disabled",
                    description: `MFA has been disabled for ${user.first_name} ${user.last_name}`,
                    color: "success",
                });
            },
        });
    }, [disableUserMFA]);

    const handleDelete = useCallback((user: User) => {
        setConfirmAction({
            title: "Delete User",
            description: `Are you sure you want to permanently delete ${user.first_name} ${user.last_name}? This action cannot be undone.`,
            color: "danger",
            action: async () => {
                await deleteUser(user.id);
                addToast({
                    title: "User deleted",
                    description: `${user.first_name} ${user.last_name} has been removed`,
                    color: "success",
                });
            },
        });
    }, [deleteUser]);

    const handleConfirm = useCallback(async () => {
        if (!confirmAction) return;
        setIsConfirming(true);
        try {
            await confirmAction.action();
        } catch (err) {
            addToast({
                title: "Error",
                description: err instanceof Error ? err.message : "An unexpected error occurred",
                color: "danger",
            });
        } finally {
            setIsConfirming(false);
            setConfirmAction(null);
        }
    }, [confirmAction]);

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Spinner size="lg" color="primary"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-danger">Failed to load users: {error}</p>
            </div>
        );
    }

    const cards = [
        {title: "Total Users", value: stats.total.toString(), icon: "mage:users", color: "primary" as const},
        {title: "Admins", value: stats.admins.toString(), icon: "mage:shield-check", color: "warning" as const},
        {title: "Buyers", value: stats.buyers.toString(), icon: "mage:checklist-note", color: "success" as const},
        {title: "MFA Enabled", value: stats.mfaEnabled.toString(), icon: "mage:lock", color: "secondary" as const},
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-warning/10 text-warning">
                            <Icon icon="mage:users" width={24} height={24}/>
                        </div>
                        <h1 className="font-headers font-bold text-2xl">Manage Users</h1>
                    </div>
                    <Button
                        variant={hasActiveFilters ? "flat" : "light"}
                        color={hasActiveFilters ? "primary" : "default"}
                        startContent={<Icon icon="mage:filter" width={18}/>}
                        onPress={() => setIsFilterOpen(true)}
                    >
                        Filters{hasActiveFilters ? " (active)" : ""}
                    </Button>
                </div>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {cards.map((card, i) => (
                        <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} index={i} color={card.color}/>
                    ))}
                </div>
                <p className="text-sm text-default-500">
                    Showing {filteredUsers.length} of {users.length} users
                </p>
                <UserTable
                    users={filteredUsers}
                    onEdit={openUserEditModal}
                    onForceReset={handleForceReset}
                    onDisableMFA={handleDisableMFA}
                    onDelete={handleDelete}
                />
            </div>
            <UserFilters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />

            {/* Confirmation Modal */}
            <Modal
                isOpen={confirmAction !== null}
                onClose={() => setConfirmAction(null)}
                size="md"
                backdrop="blur"
            >
                <ModalContent>
                    {(onClose) => (
                        <>
                            <ModalHeader className="font-headers font-bold">
                                {confirmAction?.title}
                            </ModalHeader>
                            <ModalBody>
                                <p>{confirmAction?.description}</p>
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="light" onPress={onClose} isDisabled={isConfirming}>
                                    Cancel
                                </Button>
                                <Button
                                    color={confirmAction?.color ?? "danger"}
                                    onPress={handleConfirm}
                                    isLoading={isConfirming}
                                    isDisabled={isConfirming}
                                >
                                    Confirm
                                </Button>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </div>
    );
}
