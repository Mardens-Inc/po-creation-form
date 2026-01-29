import {Card, CardBody, CardHeader, Table, TableHeader, TableColumn, TableBody, TableRow, TableCell} from "@heroui/react";
import {motion} from "framer-motion";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {getMyPOs} from "../../data/mock-pos.ts";
import {POStatusBadge} from "./POStatusBadge.tsx";

export function MyPurchaseOrders() {
    const {currentUser} = useAuthentication();
    const myPOs = getMyPOs(currentUser?.id ?? 0).slice(0, 5);

    return (
        <motion.div
            initial={{opacity: 0, y: 30}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.4, delay: 0.5}}
        >
            <Card shadow="sm">
                <CardHeader className="px-6 pt-5">
                    <h2 className="font-headers font-bold text-lg">My Purchase Orders</h2>
                </CardHeader>
                <CardBody className="px-3">
                    <Table aria-label="My purchase orders" removeWrapper>
                        <TableHeader>
                            <TableColumn>PO Number</TableColumn>
                            <TableColumn>Vendor</TableColumn>
                            <TableColumn>Description</TableColumn>
                            <TableColumn>Status</TableColumn>
                            <TableColumn>Amount</TableColumn>
                            <TableColumn>Date</TableColumn>
                        </TableHeader>
                        <TableBody emptyContent="No purchase orders found.">
                            {myPOs.map(po => (
                                <TableRow key={po.id}>
                                    <TableCell className="font-mono text-sm">{po.po_number}</TableCell>
                                    <TableCell>{po.vendor}</TableCell>
                                    <TableCell className="max-w-[200px] truncate">{po.description}</TableCell>
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
