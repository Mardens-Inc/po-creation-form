import {Button, DatePicker, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {CalendarDate, parseDate} from "@internationalized/date";
import {ReactNode} from "react";
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

const colorClasses: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    warning: "bg-warning/10 text-warning",
    success: "bg-success/10 text-success",
    secondary: "bg-secondary/10 text-secondary",
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

const statusEntries = Object.entries(STATUS_CONFIG).map(([key, config]) => ({
    key: String(key) as POStatus,
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
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md" backdrop={"opaque"}>
            <DrawerContent>
                <DrawerHeader className="font-headers font-bold text-lg">
                    Filter Purchase Orders
                </DrawerHeader>
                <DrawerBody className="gap-6">
                    <FilterSection icon="mage:users" label="Assignment" color="primary">
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
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:clock-outline" label="Status" color="warning">
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
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:calendar-range" label="Date Range" color="success">
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
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:currency-usd" label="Amount Range" color="secondary">
                        <Input
                            label="Min Amount"
                            type="number"
                            startContent={<span className="text-default-400 text-sm">$</span>}
                            value={filters.minAmount !== null ? String(filters.minAmount) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("minAmount", val || null);
                            }}
                        />

                        <Input
                            label="Max Amount"
                            type="number"
                            startContent={<span className="text-default-400 text-sm">$</span>}
                            value={filters.maxAmount !== null ? String(filters.maxAmount) : ""}
                            onValueChange={(val) =>
                            {
                                setFilter("maxAmount", val || null);
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
