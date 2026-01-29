import {Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import {motion} from "framer-motion";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";
import {POStatusBadge} from "./POStatusBadge.tsx";

export function RecentPurchaseOrders() {
    const {getRecentPOs} = usePurchaseOrdersContext();
    const recentPOs = getRecentPOs(10);

    return (
        <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.5}}
        >
            <Card shadow="sm">
                <CardHeader className="px-6 pt-5">
                    <h2 className="font-headers font-bold text-lg">Recent Purchase Orders</h2>
                </CardHeader>
                <CardBody className="px-3">
                    <Table aria-label="Recent purchase orders" removeWrapper>
                        <TableHeader>
                            <TableColumn>PO Number</TableColumn>
                            <TableColumn>Vendor</TableColumn>
                            <TableColumn>Description</TableColumn>
                            <TableColumn>Buyer</TableColumn>
                            <TableColumn>Status</TableColumn>
                            <TableColumn>Amount</TableColumn>
                            <TableColumn>Date</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No purchase orders found.">
                            {recentPOs.map(po => (
                                <TableRow key={po.id}>
                                    <TableCell className="font-mono text-sm">{po.po_number}</TableCell>
                                    <TableCell>{po.vendor}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{po.description}</TableCell>
                                    <TableCell>{po.buyer_name}</TableCell>
                                    <TableCell><POStatusBadge status={po.status}/></TableCell>
                                    <TableCell>${po.total_amount.toLocaleString("en-US", {minimumFractionDigits: 2})}</TableCell>
                                    <TableCell>{new Date(po.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardBody>
            </Card>
        </motion.div>
    );
}
