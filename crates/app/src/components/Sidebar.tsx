import {Button, Tab, Tabs} from "@heroui/react";
import Stars from "../images/badge-exclamation-background.svg";
import Spike from "../images/spike-horizontal.svg";
import {ReactNode, useCallback, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {useScreenSize} from "../providers/ScreenSizeProvider.tsx";
import {HistoryForm} from "./forms/HistoryForm.tsx";
import {POInformationForm} from "./forms/POInformationForm.tsx";
import {InventoryItemsForm} from "./forms/InventoryItemsForm.tsx";
import {FinalizeForm} from "./forms/FinalizeForm.tsx";
import {Icon} from "@iconify-icon/react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";

export type TabConfig = {
    title: string;
    description: string;
    path: string;
    component: ReactNode;
};

export const SidebarTabs = {
    history: {
        title: "History",
        description: "If you want have any unsubmitted PO's you can submit them here.",
        path: "/history",
        component: <HistoryForm/>
    },
    po_number: {
        title: "Purchase Order",
        description: "Add information about the current PO here.",
        path: "/po-number",
        component: <POInformationForm/>
    },
    items: {
        title: "Inventory Items",
        description: "Reconcile the items in the PO with the inventory.",
        path: "/items",
        component: <InventoryItemsForm/>
    },
    finalize: {
        title: "Finalize",
        description: "Here you can either upload or save the PO.",
        path: "/finalize",
        component: <FinalizeForm/>
    }
} as const satisfies Record<string, TabConfig>;

// Create a type for valid tab keys
export type SidebarTabKey = keyof typeof SidebarTabs;

export function Sidebar()
{
    const navigate = useNavigate();
    const location = useLocation();
    const {width} = useScreenSize();
    const {logout} = useAuthentication();

    const handleSelectionChange = (key: string) => {
        const tab = SidebarTabs[key as SidebarTabKey];
        navigate(tab.path);
    };

    const refreshSelectedTab = useCallback(() => {
        // Trigger re-render on width change if needed
    }, [location.pathname, width]);

    useEffect(() =>
    {
        refreshSelectedTab();
    }, [width]);
    return (
        <>            {/* Desktop Sidebar Tabs */}
            <div className={"hidden lg:flex flex-col items-start justify-start py-16 gap-8 bg-primary border-primary text-center w-[500px] relative text-white p-4 bg-cover bg-center"} style={{backgroundImage: `url("${Stars}")`}}>
                <div className={"absolute w-4 -right-4 top-0 bottom-0 bg-repeat-y bg-contain"} style={{backgroundImage: `url("${Spike}")`}}/>
                <h2 className={"font-accent text-4xl font-bold"}>PO Creation Form</h2>
                <Tabs
                    isVertical
                    onSelectionChange={key => handleSelectionChange(key as string)}
                    selectedKey={Object.keys(SidebarTabs).find(key => SidebarTabs[key as SidebarTabKey].path === location.pathname)}
                    variant={"light"}
                    color={"secondary"}
                    radius={"none"}
                    className={"font-headers font-bold"}
                    size={"lg"}
                    defaultSelectedKey={"hr"}
                    classNames={{
                        base: "h-full w-full",
                        tabWrapper: "h-full w-full",
                        tabList: "h-full w-full",
                        tab: "uppercase justify-start text-2xl h-24",
                        tabContent: "text-secondary group-data-[selected=true]:text-primary group-data-[selected=true]:font-black"
                    }}
                >
                    {Object.keys(SidebarTabs).map((key, index) => (
                        <Tab key={key} title={
                            <div className={"flex flex-col text-start"}>
                                <p className={"font-accent text-lg"}>Step {index}</p>
                                <p className={"font-black font-headers text-3xl"}>{SidebarTabs[key as SidebarTabKey].title}</p>
                                <p className={"text-tiny font-unset lowercase font-normal truncate max-w-[300px] italic"}>{SidebarTabs[key as SidebarTabKey].description}</p>
                            </div>
                        }/>
                    ))}
                </Tabs>


                <Button
                    radius={"none"}
                    className={"font-headers font-bold"}
                    color={"secondary"}
                    size={"lg"}
                    fullWidth
                    endContent={<Icon icon="mdi:logout"/>}
                    onPress={logout}
                >
                    Logout
                </Button>
            </div>
        </>
    );
}