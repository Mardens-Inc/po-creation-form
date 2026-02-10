import {useMemo, useState} from "react";
import {Button, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useVendorsContext} from "../../providers/VendorsProvider.tsx";
import {useVendorFilters} from "../../hooks/useVendorFilters.ts";
import {VendorFilters} from "../../components/vendors/VendorFilters.tsx";
import {VendorTable} from "../../components/vendors/VendorTable.tsx";
import {StatCard} from "../../components/dashboard/StatCard.tsx";

export function ManageVendors()
{
    const {vendors, isLoading, error} = useVendorsContext();
    const {filters, setFilter, clearFilters, hasActiveFilters} = useVendorFilters();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const vendorStats = useMemo(() => {
        const activeCount = vendors.filter(v => v.status === "Active").length;
        const totalPOs = vendors.reduce((sum, v) => sum + v.total_pos, 0);
        const totalSpend = vendors.reduce((sum, v) => sum + v.total_spend, 0);
        return {total: vendors.length, active: activeCount, totalPOs, totalSpend};
    }, [vendors]);

    const filteredVendors = useMemo(() =>
    {
        let result = [...vendors];

        if (filters.search)
        {
            const term = filters.search.toLowerCase();
            result = result.filter(v =>
                v.name.toLowerCase().includes(term) || v.code.toLowerCase().includes(term)
            );
        }
        if (filters.statuses.length)
            result = result.filter(v => filters.statuses.includes(v.status));
        if (filters.minPOs != null)
            result = result.filter(v => v.total_pos >= filters.minPOs!);
        if (filters.maxPOs != null)
            result = result.filter(v => v.total_pos <= filters.maxPOs!);
        if (filters.minSpend != null)
            result = result.filter(v => v.total_spend >= filters.minSpend!);
        if (filters.maxSpend != null)
            result = result.filter(v => v.total_spend <= filters.maxSpend!);

        result.sort((a, b) => a.name.localeCompare(b.name));
        return result;
    }, [vendors, filters]);

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
                <p className="text-danger">Failed to load vendors: {error}</p>
            </div>
        );
    }

    const cards = [
        {title: "Total Vendors", value: vendorStats.total.toString(), icon: "mage:shop", color: "primary" as const},
        {title: "Active", value: vendorStats.active.toString(), icon: "mdi:check-circle-outline", color: "success" as const},
        {title: "Total POs", value: vendorStats.totalPOs.toString(), icon: "mdi:file-document-outline", color: "warning" as const},
        {title: "Total Spend", value: `$${vendorStats.totalSpend.toLocaleString("en-US", {minimumFractionDigits: 2})}`, icon: "mdi:currency-usd", color: "danger" as const},
    ];

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-danger/10 text-danger">
                            <Icon icon="mage:shop" width={24} height={24}/>
                        </div>
                        <h1 className="font-headers font-bold text-2xl">Manage Vendors</h1>
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
                    Showing {filteredVendors.length} of {vendors.length} vendors
                </p>
                <VendorTable vendors={filteredVendors}/>
            </div>
            <VendorFilters
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
