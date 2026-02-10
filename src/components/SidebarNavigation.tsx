import {cn, Divider, Listbox, ListboxItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useAuthentication, UserRole} from "../providers/AuthenticationProvider.tsx";
import {useLocation} from "react-router-dom";
import {usePOCreation} from "./po/POCreationModal.tsx";
import {useVendorCreation} from "./vendors/VendorCreationModal.tsx";
import {doesUserHaveRequiredRole, RequireRole} from "./RequireRole.tsx";
import {usePurchaseOrdersContext} from "../providers/PurchaseOrdersProvider.tsx";
import {useVendorsContext} from "../providers/VendorsProvider.tsx";
import {useUsersContext} from "../providers/UsersProvider.tsx";
import {ReactNode} from "react";

function IconWrapper({children, className}: { children: ReactNode, className?: string })
{
    return (
        <div className={cn("flex items-center rounded-small justify-center w-7 h-7", className)}>
            {children}
        </div>
    );
}

function ItemCounter({count}: { count: number })
{
    return (
        <div className="flex items-center gap-1 text-default-400">
            <span className="text-small">{count}</span>
            <Icon icon="mage:chevron-right" className="text-xl"/>
        </div>
    );
}

const itemClasses = "px-3 rounded-md gap-3 h-12 data-[hover=true]:bg-default-100/5 data-[hover=true]:text-white data-[active=true]:bg-primary/10 data-[active=true]:text-primary-300";

export function SidebarNavigation()
{
    const {pathname} = useLocation();
    const {currentUser} = useAuthentication();
    const {openPOCreationModal} = usePOCreation();
    const {openVendorCreationModal} = useVendorCreation();
    const {purchaseOrders} = usePurchaseOrdersContext();
    const {vendors} = useVendorsContext();
    const {users} = useUsersContext();
    if (!currentUser) return null;
    return (
        <div className={"w-80 h-full bg-navigation text-navigation-foreground overflow-y-scroll border-t-2 border-white/10"}>
            <Listbox
                aria-label="Main Navigation"
                className={"text-xl py-4"}
                itemClasses={{base: itemClasses}}
            >
                <ListboxItem
                    key="home"
                    href={"/"}
                    startContent={
                        <IconWrapper className="bg-primary/10 text-primary">
                            <Icon icon={"mage:home-2"} className="text-lg"/>
                        </IconWrapper>
                    }
                    data-active={pathname === `/`}
                >
                    Home
                </ListboxItem>
                {doesUserHaveRequiredRole(currentUser.role!, UserRole.Buyer, false) ? (
                    <ListboxItem
                        key="my-pos"
                        href={`/purchase-orders?buyers=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
                        startContent={
                            <IconWrapper className="bg-success/10 text-success">
                                <Icon icon={"mage:checklist-note"} className="text-lg"/>
                            </IconWrapper>
                        }
                        data-active={pathname === `/purchase-orders?buyers=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
                    >
                        My PO's
                    </ListboxItem>
                ) : null}

                {doesUserHaveRequiredRole(currentUser.role!, UserRole.Admin) ? (
                    <ListboxItem
                        key="manage-users"
                        href={`/users`}
                        endContent={<ItemCounter count={users.length}/>}
                        startContent={
                            <IconWrapper className="bg-warning/10 text-warning">
                                <Icon icon={"mage:users"} className="text-lg"/>
                            </IconWrapper>
                        }
                        data-active={pathname === `/users`}
                    >
                        Manage Users
                    </ListboxItem>
                ) : null}

                <ListboxItem
                    key="inbox"
                    href={"/account/inbox"}
                    startContent={
                        <IconWrapper className="bg-secondary/10 text-secondary">
                            <Icon icon={"mage:inbox"} className="text-lg"/>
                        </IconWrapper>
                    }
                    data-active={pathname === `/account/inbox`}
                >
                    Inbox
                </ListboxItem>
            </Listbox>
            <Divider orientation={"horizontal"} className={"bg-white/10"}/>
            <Listbox
                aria-label="Purchase Orders"
                className={"text-xl py-4"}
                itemClasses={{base: itemClasses}}
            >
                {doesUserHaveRequiredRole(currentUser.role!, UserRole.Buyer) ? (
                    <ListboxItem
                        key="create-po"
                        startContent={
                            <IconWrapper className="bg-success/10 text-success">
                                <Icon icon={"mage:plus-square"} className="text-lg"/>
                            </IconWrapper>
                        }
                        onPress={openPOCreationModal}
                    >
                        Create Purchase Order
                    </ListboxItem>
                ) : null}
                <ListboxItem
                    key="manage-pos"
                    href={`/purchase-orders`}
                    endContent={<ItemCounter count={purchaseOrders.length}/>}
                    startContent={
                        <IconWrapper className="bg-primary/10 text-primary-300">
                            <Icon icon={"mage:box-3d-scan"} className="text-lg"/>
                        </IconWrapper>
                    }
                    data-active={pathname === `/purchase-orders`}
                >
                    Manage Purchase Orders
                </ListboxItem>
            </Listbox>
            <RequireRole requiredRoles={UserRole.Buyer}>
                <Divider orientation={"horizontal"} className={"bg-white/10"}/>
                <Listbox
                    aria-label="Vendors"
                    className={"text-xl py-4"}
                    itemClasses={{base: itemClasses}}
                >
                    <ListboxItem
                        key="create-vendor"
                        startContent={
                            <IconWrapper className="bg-success/10 text-success">
                                <Icon icon={"mage:plus-square"} className="text-lg"/>
                            </IconWrapper>
                        }
                        onPress={openVendorCreationModal}
                    >
                        Create Vendor
                    </ListboxItem>
                    <ListboxItem
                        key="manage-vendors"
                        href={`/vendors`}
                        endContent={<ItemCounter count={vendors.length}/>}
                        startContent={
                            <IconWrapper className="bg-danger/10 text-primary-300">
                                <Icon icon={"mage:shop"} className="text-lg"/>
                            </IconWrapper>
                        }
                        data-active={pathname === `/vendors`}
                    >
                        Manage Vendors
                    </ListboxItem>
                </Listbox>
                <Divider orientation={"horizontal"} className={"bg-white/10"}/>
            </RequireRole>
        </div>
    );
}
