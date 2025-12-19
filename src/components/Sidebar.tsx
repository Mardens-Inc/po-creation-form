import {Tab, Tabs} from "@heroui/react";
import Stars from "../images/badge-exclamation-background.svg";
import Spike from "../images/spike-horizontal.svg";
import {Dispatch, ReactNode, useCallback, useEffect} from "react";
import {useScreenSize} from "../providers/ScreenSizeProvider.tsx";
import {HistoryForm} from "./forms/HistoryForm.tsx";
import {POInformationForm} from "./forms/POInformationForm.tsx";
import {InventoryItemsForm} from "./forms/InventoryItemsForm.tsx";
import {FinalizeForm} from "./forms/FinalizeForm.tsx";

type SidebarProps = {
    selectedTab: TabConfig;
    onSelectionChange: Dispatch<TabConfig>
};

export type TabConfig = {
    title: string;
    description: string;
    component: ReactNode;
};

export const SidebarTabs = {
    history: {
        title: "History",
        description: "If you want have any unsubmitted PO's you can submit them here.",
        component: <HistoryForm/>
    },
    po_number: {
        title: "Purchase Order",
        description: "Add information about the current PO here.",
        component: <POInformationForm/>
    },
    items: {
        title: "Inventory Items",
        description: "Reconcile the items in the PO with the inventory.",
        component: <InventoryItemsForm/>
    },
    finalize: {
        title: "Finalize",
        description: "Here you can either upload or save the PO.",
        component: <FinalizeForm/>
    }
} as const satisfies Record<string, TabConfig>;

// Create a type for valid tab keys
export type SidebarTabKey = keyof typeof SidebarTabs;

export function Sidebar(props: SidebarProps)
{
    const {selectedTab, onSelectionChange} = props;
    const {width} = useScreenSize();

    const refreshSelectedTab = useCallback(() => onSelectionChange(selectedTab), [selectedTab]);

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
                    onSelectionChange={key => onSelectionChange(SidebarTabs[key as SidebarTabKey])}
                    selectedKey={Object.keys(SidebarTabs).find(key => SidebarTabs[key as SidebarTabKey] === selectedTab)}
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
            </div>
        </>
    );
}