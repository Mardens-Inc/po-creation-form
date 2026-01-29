import {Button, DatePicker, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem} from "@heroui/react";
import {CalendarDate, parseDate} from "@internationalized/date";
import {POFilterState} from "../../hooks/usePOFilters.ts";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";
import {STATUS_CONFIG} from "../dashboard/POStatusBadge.tsx";
import {POStatus} from "../../types/po.ts";

interface POFiltersProps
{
    isOpen: boolean;
    onClose: () => void;
    filters: POFilterState;
    setFilter: (key: string, value: string | null) => void;
    clearFilters: () => void;
    hasActiveFilters: boolean;
}

const statusEntries = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    key: Number(key) as POStatus,
    label: config.label
}));

function toCalendarDate(iso: string | null): CalendarDate | null
{
    if (!iso) return null;
    try
    {
        return parseDate(iso);
    } catch
    {
        return null;
    }
}

export function POFilters({isOpen, onClose, filters, setFilter, clearFilters, hasActiveFilters}: POFiltersProps)
{
    const {getUniqueBuyers, getUniqueVendors} = usePurchaseOrdersContext();
    const buyers = getUniqueBuyers();
    const vendors = getUniqueVendors();

    return (
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md" backdrop={"blur"}>
            <DrawerContent>
                <DrawerHeader className="font-headers font-bold text-lg">
                    Filter Purchase Orders
                </DrawerHeader>
                <DrawerBody className="gap-4">
                    <Select
                        label="Buyer"
                        selectionMode="multiple"
                        selectedKeys={new Set(filters.buyers.map(String))}
                        onSelectionChange={(keys) =>
                        {
                            const arr = [...keys].map(Number);
                            setFilter("buyers", arr.length ? JSON.stringify(arr) : null);
                        }}
                    >
                        {buyers.map(b => (
                            <SelectItem key={String(b.id)}>{b.name}</SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Vendor"
                        selectionMode="multiple"
                        selectedKeys={new Set(filters.vendors)}
                        onSelectionChange={(keys) =>
                        {
                            const arr = [...keys] as string[];
                            setFilter("vendors", arr.length ? JSON.stringify(arr) : null);
                        }}
                    >
                        {vendors.map(v => (
                            <SelectItem key={v}>{v}</SelectItem>
                        ))}
                    </Select>

                    <Select
                        label="Status"
                        selectionMode="multiple"
                        selectedKeys={new Set(filters.statuses.map(String))}
                        onSelectionChange={(keys) =>
                        {
                            const arr = [...keys].map(Number);
                            setFilter("status", arr.length ? JSON.stringify(arr) : null);
                        }}
                    >
                        {statusEntries.map(s => (
                            <SelectItem key={String(s.key)}>{s.label}</SelectItem>
                        ))}
                    </Select>

                    <DatePicker
                        label="Date From"
                        value={toCalendarDate(filters.dateFrom)}
                        onChange={(date) =>
                        {
                            setFilter("dateFrom", date ? date.toString() : null);
                        }}
                        showMonthAndYearPickers
                    />

                    <DatePicker
                        label="Date To"
                        value={toCalendarDate(filters.dateTo)}
                        onChange={(date) =>
                        {
                            setFilter("dateTo", date ? date.toString() : null);
                        }}
                        showMonthAndYearPickers
                    />

                    <Input
                        label="Min Amount"
                        type="number"
                        value={filters.minAmount !== null ? String(filters.minAmount) : ""}
                        onValueChange={(val) =>
                        {
                            setFilter("minAmount", val || null);
                        }}
                    />

                    <Input
                        label="Max Amount"
                        type="number"
                        value={filters.maxAmount !== null ? String(filters.maxAmount) : ""}
                        onValueChange={(val) =>
                        {
                            setFilter("maxAmount", val || null);
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
