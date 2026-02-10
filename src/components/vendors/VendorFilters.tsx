import {Button, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {ReactNode} from "react";
import {VendorFilterState} from "../../hooks/useVendorFilters.ts";

interface VendorFiltersProps
{
    isOpen: boolean;
    onClose: () => void;
    filters: VendorFilterState;
    setFilter: (key: string, value: string | null) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    danger: "bg-danger/10 text-danger",
};

function FilterSection({icon, label, color, children}: { icon: string; label: string; color: string; children: ReactNode })
{
    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <div className={`flex items-center justify-center w-7 h-7 rounded-small ${colorClasses[color]}`}>
                    <Icon icon={icon} className="text-lg"/>
                </div>
                <span className="font-headers font-semibold text-sm">{label}</span>
            </div>
            {children}
        </div>
    );
}

const vendorStatuses = [
    {key: "Active", label: "Active"},
    {key: "Inactive", label: "Inactive"},
];

export function VendorFilters({isOpen, onClose, filters, setFilter, clearFilters, hasActiveFilters}: VendorFiltersProps)
{
    return (
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md" backdrop={"opaque"}>
            <DrawerContent>
                <DrawerHeader className="font-headers font-bold text-lg">
                    Filter Vendors
                </DrawerHeader>
                <DrawerBody className="gap-6">
                    <FilterSection icon="mage:search" label="Search" color="primary">
                        <Input
                            label="Search"
                            placeholder="Search by name or code..."
                            value={filters.search ?? ""}
                            onValueChange={(val) =>
                            {
                                setFilter("search", val || null);
                            }}
                        />
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:check-circle-outline" label="Status" color="success">
                        <Select
                            label="Status"
                            selectionMode="multiple"
                            selectedKeys={new Set(filters.statuses)}
                            onSelectionChange={(keys) =>
                            {
                                const arr = [...keys] as string[];
                                setFilter("status", arr.length ? JSON.stringify(arr) : null);
                            }}
                        >
                            {vendorStatuses.map(s => (
                                <SelectItem key={s.key}>{s.label}</SelectItem>
                            ))}
                        </Select>
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:file-document-outline" label="Purchase Orders" color="warning">
                        <Input
                            label="Min POs"
                            type="number"
                            value={filters.minPOs !== null ? String(filters.minPOs) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("minPOs", val || null);
                            }}
                        />

                        <Input
                            label="Max POs"
                            type="number"
                            value={filters.maxPOs !== null ? String(filters.maxPOs) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("maxPOs", val || null);
                            }}
                        />
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:currency-usd" label="Spending" color="danger">
                        <Input
                            label="Min Spend"
                            type="number"
                            startContent={<span className="text-default-400 text-sm">$</span>}
                            value={filters.minSpend !== null ? String(filters.minSpend) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("minSpend", val || null);
                            }}
                        />

                        <Input
                            label="Max Spend"
                            type="number"
                            startContent={<span className="text-default-400 text-sm">$</span>}
                            value={filters.maxSpend !== null ? String(filters.maxSpend) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("maxSpend", val || null);
                            }}
                        />
                    </FilterSection>
                </DrawerBody>
                <DrawerFooter>
                    {hasActiveFilters && (
                        <Button variant="light" color="danger" onPress={clearFilters}>
                            Clear Filters
                        </Button>
                    )}
                    <Button color="primary" onPress={onClose}>
                        Done
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
