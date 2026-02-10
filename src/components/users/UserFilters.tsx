import {Button, Divider, Drawer, DrawerBody, DrawerContent, DrawerFooter, DrawerHeader, Input, Select, SelectItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {ReactNode} from "react";
import {UserFilterState} from "../../hooks/useUserFilters.ts";

interface UserFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    filters: UserFilterState;
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

function FilterSection({icon, label, color, children}: { icon: string; label: string; color: string; children: ReactNode }) {
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

const roleOptions = [
    {key: "Admin", label: "Admin"},
    {key: "Buyer", label: "Buyer"},
    {key: "Warehouse", label: "Warehouse"},
];

const mfaOptions = [
    {key: "enabled", label: "Enabled"},
    {key: "disabled", label: "Disabled"},
];

const statusOptions = [
    {key: "active", label: "Active"},
    {key: "pending_reset", label: "Pending Reset"},
    {key: "unconfirmed", label: "Unconfirmed"},
];

export function UserFilters({isOpen, onClose, filters, setFilter, clearFilters, hasActiveFilters}: UserFiltersProps) {
    return (
        <Drawer isOpen={isOpen} onClose={onClose} placement="right" size="md" backdrop={"opaque"}>
            <DrawerContent>
                <DrawerHeader className="font-headers font-bold text-lg">
                    Filter Users
                </DrawerHeader>
                <DrawerBody className="gap-6">
                    <FilterSection icon="mage:search" label="Search" color="primary">
                        <Input
                            label="Search"
                            placeholder="Search by name or email..."
                            value={filters.search ?? ""}
                            onValueChange={(val) => {
                                setFilter("search", val || null);
                            }}
                        />
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mage:users" label="Role" color="success">
                        <Select
                            label="Role"
                            selectionMode="multiple"
                            selectedKeys={new Set(filters.roles)}
                            onSelectionChange={(keys) => {
                                const arr = [...keys] as string[];
                                setFilter("roles", arr.length ? JSON.stringify(arr) : null);
                            }}
                        >
                            {roleOptions.map(s => (
                                <SelectItem key={s.key}>{s.label}</SelectItem>
                            ))}
                        </Select>
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mage:lock" label="MFA Status" color="warning">
                        <Select
                            label="MFA"
                            selectedKeys={filters.mfa ? new Set([filters.mfa]) : new Set()}
                            onSelectionChange={(keys) => {
                                const arr = [...keys] as string[];
                                setFilter("mfa", arr.length ? arr[0] : null);
                            }}
                        >
                            {mfaOptions.map(s => (
                                <SelectItem key={s.key}>{s.label}</SelectItem>
                            ))}
                        </Select>
                    </FilterSection>

                    <Divider/>

                    <FilterSection icon="mdi:check-circle-outline" label="Account Status" color="danger">
                        <Select
                            label="Status"
                            selectedKeys={filters.status ? new Set([filters.status]) : new Set()}
                            onSelectionChange={(keys) => {
                                const arr = [...keys] as string[];
                                setFilter("status", arr.length ? arr[0] : null);
                            }}
                        >
                            {statusOptions.map(s => (
                                <SelectItem key={s.key}>{s.label}</SelectItem>
                            ))}
                        </Select>
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
