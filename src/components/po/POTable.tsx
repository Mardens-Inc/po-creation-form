import {Button, Card, CardBody, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell, Tooltip} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useState} from "react";
import {PurchaseOrder} from "../../types/po.ts";
import {POStatusBadge} from "../dashboard/POStatusBadge.tsx";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {usePOEdit} from "./POEditModal.tsx";
import {POLineItemsModal} from "./POLineItemsModal.tsx";
import {POFilesModal} from "./POFilesModal.tsx";

interface POTableProps {
    purchaseOrders: PurchaseOrder[];
}

export function POTable({purchaseOrders}: POTableProps) {
    const {currentUser} = useAuthentication();
    const {openPOEditModal} = usePOEdit();
    const [lineItemsModal, setLineItemsModal] = useState<{ poId: number; poNumber: string } | null>(null);
    const [filesModal, setFilesModal] = useState<{ poId: number; poNumber: string } | null>(null);

    const canEdit = (po: PurchaseOrder): boolean => {
        if (!currentUser) return false;
        if (currentUser.role === "Admin") return true;
        return currentUser.id === po.buyer_id;
    };

    const handleEdit = (po: PurchaseOrder) => {
        openPOEditModal(po.id);
    };

    return (
        <>
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
                                        <div className="flex gap-1">
                                            <Tooltip content="View Line Items">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
                                                    aria-label="View line items"
                                                    onPress={() => setLineItemsModal({poId: po.id, poNumber: po.po_number})}
                                                >
                                                    <Icon icon="mdi:format-list-numbered" width={16}/>
                                                </Button>
                                            </Tooltip>
                                            <Tooltip content="View Files">
                                                <Button
                                                    size="sm"
                                                    variant="light"
                                                    isIconOnly
                                                    aria-label="View files"
                                                    onPress={() => setFilesModal({poId: po.id, poNumber: po.po_number})}
                                                >
                                                    <Icon icon="tabler:file-spreadsheet" width={16}/>
                                                </Button>
                                            </Tooltip>
                                            {canEdit(po) && (
                                                <Tooltip content="Edit PO">
                                                    <Button
                                                        size="sm"
                                                        variant="light"
                                                        isIconOnly
                                                        aria-label="Edit purchase order"
                                                        onPress={() => handleEdit(po)}
                                                    >
                                                        <Icon icon="mage:edit" width={16}/>
                                                    </Button>
                                                </Tooltip>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>

            {lineItemsModal && (
                <POLineItemsModal
                    isOpen={true}
                    onClose={() => setLineItemsModal(null)}
                    poId={lineItemsModal.poId}
                    poNumber={lineItemsModal.poNumber}
                />
            )}

            {filesModal && (
                <POFilesModal
                    isOpen={true}
                    onClose={() => setFilesModal(null)}
                    poId={filesModal.poId}
                    poNumber={filesModal.poNumber}
                />
            )}
        </>
    );
}
