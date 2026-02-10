import {useMemo, useState} from "react";
import {Button, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";
import {usePOFilters} from "../../hooks/usePOFilters.ts";
import {POFilters} from "../../components/po/POFilters.tsx";
import {POTable} from "../../components/po/POTable.tsx";
import {StatCard} from "../../components/dashboard/StatCard.tsx";

export function ManagePurchaseOrders() {
    const {purchaseOrders, isLoading, error, getDashboardStats} = usePurchaseOrdersContext();
    const {filters, setFilter, clearFilters, hasActiveFilters} = usePOFilters();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const stats = getDashboardStats();

    const filteredPOs = useMemo(() => {
        let result = [...purchaseOrders];

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
    }, [purchaseOrders, filters]);

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
                <p className="text-danger">Failed to load purchase orders: {error}</p>
            </div>
        );
    }

    const cards = [
        {title: "Total POs", value: stats.totalPOs.toString(), icon: "mdi:file-document-outline", color: "primary" as const},
        {title: "Pending", value: stats.pendingPOs.toString(), icon: "mdi:clock-outline", color: "warning" as const},
        {title: "Approved", value: stats.approvedPOs.toString(), icon: "mdi:check-circle-outline", color: "success" as const},
        {title: "Total Spend", value: `$${stats.totalSpend.toLocaleString("en-US", {minimumFractionDigits: 2})}`, icon: "mdi:currency-usd", color: "secondary" as const},
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary">
                            <Icon icon="mage:box-3d-scan" width={24} height={24}/>
                        </div>
                        <h1 className="font-headers font-bold text-2xl">Manage Purchase Orders</h1>
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
                    Showing {filteredPOs.length} of {purchaseOrders.length} purchase orders
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
