import {useMemo, useState} from "react";
import {Button, Spinner} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useVendorsContext} from "../../providers/VendorsProvider.tsx";
import {useVendorFilters} from "../../hooks/useVendorFilters.ts";
import {VendorFilters} from "../../components/vendors/VendorFilters.tsx";
import {VendorTable} from "../../components/vendors/VendorTable.tsx";

export function ManageVendors()
{
    const {vendors, isLoading, error} = useVendorsContext();
    const {filters, setFilter, clearFilters, hasActiveFilters} = useVendorFilters();
    const [isFilterOpen, setIsFilterOpen] = useState(false);

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

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <div className="flex items-center justify-between">
                    <h1 className="font-headers font-bold text-2xl">Manage Vendors</h1>
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
