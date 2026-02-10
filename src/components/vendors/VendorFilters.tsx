import {Button, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem} from "@heroui/react";
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
                <DrawerBody className="gap-4">
                    <Input
                        label="Search"
                        placeholder="Search by name or code..."
                        value={filters.search ?? ""}
                        onValueChange={(val) =>
                        {
                            setFilter("search", val || null);
                        }}
                    />

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

                    <Input
                        label="Min Spend"
                        type="number"
                        value={filters.minSpend !== null ? String(filters.minSpend) : ""}
                        onValueChange={(val) =>
                        {
                            setFilter("minSpend", val || null);
                        }}
                    />

                    <Input
                        label="Max Spend"
                        type="number"
                        value={filters.maxSpend !== null ? String(filters.maxSpend) : ""}
                        onValueChange={(val) =>
                        {
                            setFilter("maxSpend", val || null);
                        }}
                    />
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
