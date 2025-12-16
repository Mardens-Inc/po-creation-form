import {useState} from "react";
import {Sidebar, SidebarTabs, TabConfig} from "../components/Sidebar.tsx";
import {ErrorBoundary} from "../components/ErrorBoundry.tsx";

export function Home()
{
    const [selectedTab, setSelectedTab] = useState<TabConfig>(SidebarTabs.po_number);
    return (
        <div className={"flex flex-col lg:flex-row w-full"}>
            <ErrorBoundary><Sidebar selectedTab={selectedTab} onSelectionChange={setSelectedTab}/></ErrorBoundary>

            {/* Form Content */}
            <ErrorBoundary>
                <div className={"flex flex-col gap-4 w-full py-12 items-center max-h-[calc(100vh-2rem)] overflow-y-auto"}>
                    <div className={"flex flex-col gap-4 w-[75%]"}>
                        <ErrorBoundary>
                            {selectedTab.component}
                        </ErrorBoundary>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
}
