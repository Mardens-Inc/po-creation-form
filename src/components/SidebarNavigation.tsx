import {Divider, Listbox, ListboxItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {useLocation} from "react-router-dom";
import {usePOCreation} from "./po/POCreationModal.tsx";
import {useVendorCreation} from "./vendors/VendorCreationModal.tsx";

export function SidebarNavigation()
{
    const {pathname} = useLocation();
    const {currentUser} = useAuthentication();
    const {openPOCreationModal} = usePOCreation();
    const {openVendorCreationModal} = useVendorCreation();
    if (!currentUser) return null;
    return (
        <div className={"w-80 h-full bg-navigation text-navigation-foreground overflow-y-scroll border-t-2 border-white/10"}>
            <Listbox className={"text-xl py-4"} color={"primary"}>
                <ListboxItem
                    href={"/"}
                    startContent={<Icon icon={"mage:home-2"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/`}
                >
                    Home
                </ListboxItem>
                <ListboxItem
                    href={`/purchase-orders?buyers=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
                    startContent={<Icon icon={"mage:checklist-note"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/purchase-orders?buyers=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
                >
                    My PO's
                </ListboxItem>
                <ListboxItem
                    href={"/account/inbox"}
                    startContent={<Icon icon={"mage:inbox"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/account/inbox`}
                >
                    Inbox
                </ListboxItem>
            </Listbox>
            <Divider orientation={"horizontal"} className={"bg-white/10"}/>
            <Listbox className={"text-xl py-4"}>
                <ListboxItem
                    startContent={<Icon icon={"mage:plus-square"}/>}
                    className={"opacity-70 hover:opacity-75 rounded-none"}
                    onPress={openPOCreationModal}
                >
                    Create Purchase Order
                </ListboxItem>
                <ListboxItem
                    href={`/purchase-orders`}
                    startContent={<Icon icon={"mage:box-3d-scan"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/purchase-orders`}
                >
                    Manage Purchase Orders
                </ListboxItem>
            </Listbox>
            <Divider orientation={"horizontal"} className={"bg-white/10"}/>
            <Listbox className={"text-xl py-4"}>
                <ListboxItem
                    startContent={<Icon icon={"mage:user-plus"}/>}
                    className={"opacity-70 hover:opacity-75 rounded-none"}
                    onPress={openVendorCreationModal}
                >
                    Create Vendor
                </ListboxItem>
                <ListboxItem
                    href={`/vendors`}
                    startContent={<Icon icon={"mage:contact-book"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/vendors`}
                >
                    Manage Vendors
                </ListboxItem>
            </Listbox>
            <Divider orientation={"horizontal"} className={"bg-white/10"}/>
        </div>
    );
}