import {Divider, Listbox, ListboxItem} from "@heroui/react";
import {Icon} from "@iconify-icon/react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {useLocation} from "react-router-dom";

export function SidebarNavigation()
{
    const {pathname} = useLocation();
    const {currentUser} = useAuthentication();
    if (!currentUser) return null;
    return (
        <div className={"w-80 h-full bg-navigation text-navigation-foreground overflow-y-scroll border-t-2 border-white/10"}>
            <Listbox className={"text-xl"}>
                <ListboxItem
                    href={"/"}
                    startContent={<Icon icon={"mage:home-2"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/`}
                >
                    Home
                </ListboxItem>
                <ListboxItem
                    href={`/purchase-orders?users=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
                    startContent={<Icon icon={"mage:checklist-note"}/>}
                    className={"opacity-70 hover:opacity-75 data-[active=true]:opacity-100 rounded-none"}
                    data-active={pathname == `/purchase-orders?users=${encodeURIComponent(JSON.stringify([currentUser.id]))}`}
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
        </div>
    );
}