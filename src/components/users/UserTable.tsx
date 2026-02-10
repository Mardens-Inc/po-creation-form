import {Button, Card, CardBody, Chip, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {User} from "../../providers/AuthenticationProvider.tsx";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";

interface UserTableProps {
    users: User[];
    onEdit: (user: User) => void;
    onForceReset: (user: User) => void;
    onDisableMFA: (user: User) => void;
    onDelete: (user: User) => void;
}

const roleColorMap: Record<string, "primary" | "success" | "warning" | "default"> = {
    Admin: "primary",
    Buyer: "success",
    Warehouse: "warning",
};

function getUserStatus(user: User): { label: string; color: "success" | "warning" | "danger" } {
    if (user.needs_password_reset) return {label: "Pending Reset", color: "warning"};
    if (!user.has_confirmed_email) return {label: "Unconfirmed", color: "danger"};
    return {label: "Active", color: "success"};
}

export function UserTable({users, onEdit, onForceReset, onDisableMFA, onDelete}: UserTableProps) {
    const {currentUser} = useAuthentication();

    return (
        <Card shadow="sm">
            <CardBody className="px-3">
                <Table aria-label="Users" removeWrapper>
                    <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Email</TableColumn>
                        <TableColumn>Role</TableColumn>
                        <TableColumn>MFA</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No users match the current filters.">
                        {users.map(user => {
                            const status = getUserStatus(user);
                            const isSelf = currentUser?.id === user.id;
                            return (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        {user.first_name} {user.last_name}
                                    </TableCell>
                                    <TableCell>{user.email}</TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={roleColorMap[user.role ?? "Warehouse"] ?? "default"}
                                        >
                                            {user.role ?? "Warehouse"}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={user.mfa_enabled ? "success" : "default"}
                                        >
                                            {user.mfa_enabled ? "Enabled" : "Disabled"}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            size="sm"
                                            variant="flat"
                                            color={status.color}
                                        >
                                            {status.label}
                                        </Chip>
                                    </TableCell>
                                    <TableCell>
                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button size="sm" variant="light" isIconOnly aria-label="Actions">
                                                    <Icon icon="mage:dots" width={16}/>
                                                </Button>
                                            </DropdownTrigger>
                                            <DropdownMenu aria-label="User actions">
                                                <DropdownItem
                                                    key="edit"
                                                    startContent={<Icon icon="mage:edit" width={16}/>}
                                                    onPress={() => onEdit(user)}
                                                >
                                                    Edit
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="force-reset"
                                                    startContent={<Icon icon="mage:key" width={16}/>}
                                                    onPress={() => onForceReset(user)}
                                                >
                                                    Force Password Reset
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="disable-mfa"
                                                    startContent={<Icon icon="mage:lock-off" width={16}/>}
                                                    isDisabled={!user.mfa_enabled}
                                                    onPress={() => onDisableMFA(user)}
                                                >
                                                    Disable MFA
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="delete"
                                                    className="text-danger"
                                                    color="danger"
                                                    startContent={<Icon icon="mage:trash" width={16}/>}
                                                    isDisabled={isSelf}
                                                    onPress={() => onDelete(user)}
                                                >
                                                    Delete
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
