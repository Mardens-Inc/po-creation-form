import {Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {PurchaseOrder} from "../../types/po.ts";
import {POStatusBadge} from "../dashboard/POStatusBadge.tsx";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";

interface POTableProps {
    purchaseOrders: PurchaseOrder[];
}

export function POTable({purchaseOrders}: POTableProps) {
    const {currentUser} = useAuthentication();

    const canEdit = (po: PurchaseOrder): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === "Admin") return true;
        return currentUser.id === po.buyer_id;
    };

    return (
        <Card shadow="sm">
            <CardBody className="px-3">
                <Table aria-label="Purchase orders" removeWrapper>
                    <TableHeader>
                        <TableColumn>PO Number</TableColumn>
                        <TableColumn>Vendor</TableColumn>
                        <TableColumn>Description</TableColumn>
                        <TableColumn>Buyer</TableColumn>
                        <TableColumn>Status</TableColumn>
                        <TableColumn>Amount</TableColumn>
                        <TableColumn>Date</TableColumn>
                        <TableColumn>Actions</TableColumn>
                    </TableHeader>
                    <TableBody emptyContent="No purchase orders match the current filters.">
                        {purchaseOrders.map(po => (
                            <TableRow key={po.id}>
                                <TableCell className="font-mono text-sm">{po.po_number}</TableCell>
                                <TableCell>{po.vendor}</TableCell>
                                <TableCell className="max-w-[200px] truncate">{po.description}</TableCell>
                                <TableCell>{po.buyer_name}</TableCell>
                                <TableCell><POStatusBadge status={po.status}/></TableCell>
                                <TableCell>${po.total_amount.toLocaleString("en-US", {minimumFractionDigits: 2})}</TableCell>
                                <TableCell>{new Date(po.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    {canEdit(po) && (
                                        <Button
                                            size="sm"
                                            variant="light"
                                            isIconOnly
                                            aria-label="Edit purchase order"
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
