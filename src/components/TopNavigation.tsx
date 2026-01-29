import {useMemo, useRef, useState} from "react";
import {Avatar, Dropdown, DropdownItem, DropdownMenu, DropdownSection, DropdownTrigger, Input} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {usePurchaseOrdersContext} from "../providers/PurchaseOrdersProvider.tsx";
import {useVendorsContext} from "../providers/VendorsProvider.tsx";
import favicon from "../images/favicon.ico";

interface SearchSuggestion {
    label: string;
    category: string;
    icon: string;
}

export function TopNavigation() {
    const {currentUser, logout} = useAuthentication();
    const {purchaseOrders, getUniqueBuyers} = usePurchaseOrdersContext();
    const {vendors} = useVendorsContext();
    const [searchValue, setSearchValue] = useState("");
    const [isFocused, setIsFocused] = useState(false);
    const blurTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Build search suggestions from real data
    const allSuggestions = useMemo((): SearchSuggestion[] => {
        const suggestions: SearchSuggestion[] = [];

        // Add PO numbers
        for (const po of purchaseOrders) {
            suggestions.push({
                label: po.po_number,
                category: "Purchase Order",
                icon: "mdi:file-document-outline",
            });
        }

        // Add vendors
        for (const vendor of vendors) {
            suggestions.push({
                label: vendor.name,
                category: "Vendor",
                icon: "mdi:store-outline",
            });
        }

        // Add buyers
        const buyers = getUniqueBuyers();
        for (const buyer of buyers) {
            suggestions.push({
                label: buyer.name,
                category: "Buyer",
                icon: "mdi:account-outline",
            });
        }

        return suggestions;
    }, [purchaseOrders, vendors, getUniqueBuyers]);

    // Filter suggestions based on search value
    const filteredSuggestions = useMemo(() => {
        if (!searchValue.trim()) return [];
        const lower = searchValue.toLowerCase();
        return allSuggestions
            .filter(s => s.label.toLowerCase().includes(lower))
            .slice(0, 6);
    }, [searchValue, allSuggestions]);

    const showDropdown = isFocused && filteredSuggestions.length > 0;

    const initials = currentUser
        ? `${currentUser.first_name?.[0] ?? ""}${currentUser.last_name?.[0] ?? ""}`.toUpperCase() || currentUser.email[0].toUpperCase()
        : "?";

    const displayName = currentUser
        ? [currentUser.first_name, currentUser.last_name].filter(Boolean).join(" ") || currentUser.email
        : "";

    function handleFocus() {
        if (blurTimeout.current) clearTimeout(blurTimeout.current);
        setIsFocused(true);
    }

    function handleBlur() {
        blurTimeout.current = setTimeout(() => setIsFocused(false), 150);
    }

    function handleSelectSuggestion(suggestion: SearchSuggestion) {
        setSearchValue(suggestion.label);
        setIsFocused(false);
    }

    return (
        <div className="flex flex-row h-16 bg-navigation text-navigation-foreground items-center gap-4 px-8 py-2 justify-between">
            {/* Left: Logo */}
            <div className="flex flex-row items-center gap-3 shrink-0">
                <img src={favicon} alt="Logo" className="w-8 h-8"/>
                <span className="font-headers font-black text-lg hidden sm:block">PO Tracker</span>
            </div>

            {/* Center: Search with autocomplete */}
            <div className="relative w-full max-w-md">
                <Input
                    placeholder="Search POs, vendors, buyers..."
                    startContent={<Icon icon="mage:search"/>}
                    className="w-full"
                    size="sm"
                    radius="full"
                    value={searchValue}
                    onValueChange={setSearchValue}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    classNames={{
                        inputWrapper: "!bg-white/10 data-[hover=true]:!bg-white data-[focus=true]:!bg-white group",
                        input: "!text-white group-data-[hover=true]:!text-black group-data-[focus=true]:!text-black placeholder:!text-white/60 group-data-[hover=true]:placeholder:!text-black/60 group-data-[focus=true]:placeholder:!text-black/60",
                        innerWrapper: "text-white group-data-[hover=true]:text-black group-data-[focus=true]:text-black",
                    }}
                    isClearable
                />
                {showDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-lg border border-default-200 overflow-hidden z-50">
                        {filteredSuggestions.map((suggestion, i) => (
                            <button
                                key={`${suggestion.category}-${suggestion.label}`}
                                className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-default-100 transition-colors cursor-pointer"
                                onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelectSuggestion(suggestion);
                                }}
                            >
                                <Icon icon={suggestion.icon} width={18} height={18} className="text-default-500"/>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-foreground truncate">{suggestion.label}</p>
                                </div>
                                <span className="text-xs text-default-400 shrink-0">{suggestion.category}</span>
                                {i < filteredSuggestions.length - 1 && <span className="sr-only">,</span>}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Right: User dropdown */}
            <div className="flex flex-row items-center shrink-0">
                <Dropdown placement="bottom-end">
                    <DropdownTrigger>
                        <button className="flex items-center gap-2 cursor-pointer outline-none">
                            <Avatar
                                name={initials}
                                size="sm"
                                className="bg-primary text-white font-bold text-xs"
                            />
                            <span className="text-sm font-text hidden md:block">{displayName}</span>
                            <Icon icon="mdi:chevron-down" width={18} height={18} className="hidden md:block opacity-60"/>
                        </button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="User menu">
                        <DropdownSection showDivider>
                            <DropdownItem key="profile" isReadOnly className="opacity-100 cursor-default">
                                <p className="font-semibold">{displayName}</p>
                                <p className="text-xs text-default-400">{currentUser?.email}</p>
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection showDivider>
                            <DropdownItem key="account" startContent={<Icon icon="mdi:account-outline" width={18} height={18}/>}>
                                My Account
                            </DropdownItem>
                            <DropdownItem key="settings" startContent={<Icon icon="mdi:cog-outline" width={18} height={18}/>}>
                                Settings
                            </DropdownItem>
                        </DropdownSection>
                        <DropdownSection>
                            <DropdownItem key="logout" className="text-danger" color="danger" startContent={<Icon icon="mdi:logout" width={18} height={18}/>} onPress={logout}>
                                Log Out
                            </DropdownItem>
                        </DropdownSection>
                    </DropdownMenu>
                </Dropdown>
            </div>
        </div>
    );
}
