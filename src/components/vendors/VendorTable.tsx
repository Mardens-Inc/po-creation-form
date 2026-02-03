import {Button, Card, CardBody, Chip, Table, TableBody, TableCell, TableColumn, TableHeader, TableRow} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {Vendor} from "./types.ts";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {useVendorCreation} from "./VendorCreationModal.tsx";

interface VendorTableProps
{
    vendors: Vendor[];
}

export function VendorTable({vendors}: VendorTableProps)
{
    const {currentUser} = useAuthentication();
    const {openVendorEditModal} = useVendorCreation();
    const canEdit = currentUser?.role === "Admin";

    return (
        <Card shadow="sm">
            <CardBody className="px-3">
                <Table aria-label="Vendors" removeWrapper>
                    <TableHeader>
                        <TableColumn>Name</TableColumn>
                        <TableColumn>Code</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Contacts</TableColumn>
                        <TableColumn>Locations</TableColumn>
                        <TableColumn>Total POs</TableColumn>
                        <TableColumn>Total Spend</TableColumn>
                        <TableColumn>Created</TableColumn>
                        <TableColumn hidden={!canEdit}>Actions</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No vendors match the current filters.">
                        {vendors.map(vendor => (
                            <TableRow key={vendor.id}>
                                <TableCell className="font-medium">{vendor.name}</TableCell>
                                <TableCell className="font-mono text-sm">{vendor.code}</TableCell>
                                <TableCell>
                                    <Chip
                                        size="sm"
                                        variant="flat"
                                        color={vendor.status === "Active" ? "success" : "default"}
                                    >
                                        {vendor.status}
                                    </Chip>
                                </TableCell>
                                <TableCell>{vendor.contacts.length}</TableCell>
                                <TableCell>{vendor.ship_locations.length}</TableCell>
                                <TableCell>{vendor.total_pos}</TableCell>
                                <TableCell>${vendor.total_spend.toLocaleString("en-US", {minimumFractionDigits: 2})}</TableCell>
                                <TableCell>{new Date(vendor.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {canEdit && (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            aria-label="Edit vendor"
                                            onPress={() => openVendorEditModal(vendor)}
                                        >
                                            <Icon icon="mage:edit" width={16}/>
                                        </Button>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardBody>
        </Card>
    );
}
