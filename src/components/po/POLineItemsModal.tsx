import {Modal, ModalBody, ModalContent, ModalHeader, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useCallback, useEffect, useState} from "react";
import {POLineItem} from "../../types/po.ts";
import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";

type POLineItemsModalProps = {
    isOpen: boolean;
    onClose: () => void;
    poId: number;
    poNumber: string;
};

export function POLineItemsModal({isOpen, onClose, poId, poNumber}: POLineItemsModalProps)
{
    const {getToken} = useAuthentication();
    const [lineItems, setLineItems] = useState<POLineItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadLineItems = useCallback(async () =>
    {
        const token = getToken();
        if (!token) return;

        setIsLoading(true);
        try
        {
            const response = await fetch(`/api/purchase-orders/${poId}/line-items`, {
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) throw new Error("Failed to load line items");

            const data: POLineItem[] = await response.json();
            setLineItems(data);
        } catch (error)
        {
            console.error("Error loading line items:", error);
            setLineItems([]);
        } finally
        {
            setIsLoading(false);
        }
    }, [getToken, poId]);

    useEffect(() =>
    {
        if (isOpen) loadLineItems();
    }, [isOpen, loadLineItems]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size="5xl"
            scrollBehavior="inside"
            backdrop="blur"
        >
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="font-headers font-black text-xl uppercase flex items-center gap-2">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-warning/10 text-warning">
                                <Icon icon="mdi:format-list-numbered" width={20} height={20}/>
                            </div>
                            Line Items - PO #{poNumber}
                        </ModalHeader>
                        <ModalBody className="pb-6">
                            {isLoading ? (
                                <div className="flex items-center justify-center py-20">
                                    <Spinner size="lg"/>
                                    <span className="ml-4">Loading line items...</span>
                                </div>
                            ) : lineItems.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-default-400">
                                    <Icon icon="mdi:format-list-numbered" width={48} height={48}/>
                                    <p className="mt-4 text-lg font-medium">No line items for this PO</p>
                                </div>
                            ) : (
                                <div className="flex flex-col overflow-hidden">
                                    <div className="overflow-y-auto flex-1">
                                        <table className="w-full text-sm">
                                            <thead className="bg-default-100 sticky top-0">
                                            <tr>
                                                <th className="text-left p-2">Item #</th>
                                                <th className="text-left p-2">UPC</th>
                                                <th className="text-left p-2">Description</th>
                                                <th className="text-right p-2">Qty</th>
                                                <th className="text-right p-2">Cost</th>
                                                <th className="text-right p-2">Price</th>
                                                <th className="text-right p-2">Comp Retail</th>
                                                <th className="text-left p-2">Dept</th>
                                                <th className="text-right p-2">Total</th>
                                            </tr>
                                            </thead>
                                            <tbody>
                                            {lineItems.map(item => (
                                                <tr key={item.id} className="border-b border-default-200">
                                                    <td className="p-2 font-mono">{item.item_number}</td>
                                                    <td className="p-2 font-mono">{item.upc}</td>
                                                    <td className="p-2 truncate max-w-[200px]">{item.description}</td>
                                                    <td className="p-2 text-right">{item.qty}</td>
                                                    <td className="p-2 text-right">${Number(item.mardens_cost).toFixed(2)}</td>
                                                    <td className="p-2 text-right">${Number(item.mardens_price).toFixed(2)}</td>
                                                    <td className="p-2 text-right">${Number(item.comp_retail).toFixed(2)}</td>
                                                    <td className="p-2">{item.department}</td>
                                                    <td className="p-2 text-right">${(Number(item.qty) * Number(item.mardens_cost)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="border-t border-default-200 bg-default-100 font-bold text-sm flex justify-end p-2 shrink-0">
                                        <span className="mr-4">Total:</span>
                                        <span>${lineItems.reduce((sum, item) => sum + Number(item.qty) * Number(item.mardens_cost), 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            )}
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
