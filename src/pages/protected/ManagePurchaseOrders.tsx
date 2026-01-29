import {useMemo, useState} from "react";
import {Button} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {MOCK_PURCHASE_ORDERS} from "../../data/mock-pos.ts";
import {usePOFilters} from "../../hooks/usePOFilters.ts";
import {POFilters} from "../../components/po/POFilters.tsx";
import {POTable} from "../../components/po/POTable.tsx";

export function ManagePurchaseOrders() {
    const {filters, setFilter, clearFilters, hasActiveFilters} = usePOFilters();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const filteredPOs = useMemo(() => {
        let result = [...MOCK_PURCHASE_ORDERS];

        if (filters.buyers.length)
            result = result.filter(po => filters.buyers.includes(po.buyer_id));
        if (filters.vendors.length)
            result = result.filter(po => filters.vendors.includes(po.vendor));
        if (filters.statuses.length)
            result = result.filter(po => filters.statuses.includes(po.status));
        if (filters.dateFrom)
            result = result.filter(po => new Date(po.created_at) >= new Date(filters.dateFrom!));
        if (filters.dateTo) {
            const to = new Date(filters.dateTo);
            to.setHours(23, 59, 59, 999);
            result = result.filter(po => new Date(po.created_at) <= to);
        }
        if (filters.minAmount != null)
            result = result.filter(po => po.total_amount >= filters.minAmount!);
        if (filters.maxAmount != null)
            result = result.filter(po => po.total_amount <= filters.maxAmount!);

        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return result;
    }, [filters]);

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <h1 className="font-headers font-bold text-2xl">Manage Purchase Orders</h1>
                    <Button
                        variant={hasActiveFilters ? "flat" : "light"}
                        color={hasActiveFilters ? "primary" : "default"}
                        startContent={<Icon icon="mage:filter" width={18}/>}
                        onPress={() => setIsFilterOpen(true)}
                    >
                        Filters{hasActiveFilters ? " (active)" : ""}
                    </Button>
                </div>
                <p className="text-sm text-default-500">
                    Showing {filteredPOs.length} of {MOCK_PURCHASE_ORDERS.length} purchase orders
                </p>
                <POTable purchaseOrders={filteredPOs}/>
            </div>
            <POFilters
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                filters={filters}
                setFilter={setFilter}
                clearFilters={clearFilters}
                hasActiveFilters={hasActiveFilters}
            />
        </div>
    );
}
