import {Tab, Tabs} from "@heroui/react";
import Stars from "../images/badge-exclamation-background.svg";
import Spike from "../images/spike-horizontal.svg";
import {Dispatch, ReactNode, useCallback, useEffect} from "react";
import {useScreenSize} from "../providers/ScreenSizeProvider.tsx";
import {UploadManifestForm} from "./forms/UploadManifestForm.tsx";

type SidebarProps = {
    selectedTab: TabConfig;
    onSelectionChange: Dispatch<TabConfig>
};

export type TabConfig = {
    title: string;
    subtitle: string;
    description: string;
    component: ReactNode;
};

export const SidebarTabs = {
    upload: {
        title: "Upload Manifest",
        subtitle: "Step 1",
        description: "If you have any manifests from a vendor, upload them here.",
        component: <UploadManifestForm/>
    }
} as const satisfies Record<string, TabConfig>;

// Create a type for valid tab keys
export type SidebarTabKey = keyof typeof SidebarTabs;

export function Sidebar(props: SidebarProps)
{
    const {selectedTab, onSelectionChange} = props;
    const {width} = useScreenSize();

    console.log("Selected Tab: ", selectedTab);
    const refreshSelectedTab = useCallback(() => onSelectionChange(selectedTab), [selectedTab]);

    useEffect(() =>
    {
        refreshSelectedTab();
    }, [width]);
    return (
        <>            {/* Desktop Sidebar Tabs */}
            <div className={"hidden lg:flex flex-col items-start justify-start py-16 gap-8 bg-primary border-primary text-center w-[500px] relative text-white p-4 bg-cover bg-center"} style={{backgroundImage: `url("${Stars}")`}}>
                <div className={"absolute w-4 -right-4 top-0 bottom-0 bg-repeat-y bg-contain"} style={{backgroundImage: `url("${Spike}")`}}/>
                <h2 className={"font-accent text-4xl font-bold"}>Steps</h2>
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
                    {Object.keys(SidebarTabs).map(key => (
                        <Tab key={key} title={SidebarTabs[key as SidebarTabKey].title}/>
                    ))}
                </Tabs>
            </div>
        </>
    );
}