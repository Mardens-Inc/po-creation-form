import {useState} from "react";
import {Sidebar, SidebarTabs, TabConfig} from "../components/Sidebar.tsx";
import {ErrorBoundary} from "../components/ErrorBoundry.tsx";

export function Home()
{
    const [selectedTab, setSelectedTab] = useState<TabConfig>(SidebarTabs.upload);
    return (
        <div className={"flex flex-col lg:flex-row w-full"}>
            <ErrorBoundary><Sidebar selectedTab={selectedTab} onSelectionChange={setSelectedTab}/></ErrorBoundary>

            {/* Form Content */}
            <ErrorBoundary>
                <div className={"flex flex-col gap-4 w-full py-12 items-center max-h-[calc(100vh-2rem)] overflow-y-auto"}>
                    <div className={"flex flex-col gap-4 w-[75%]"}>
                        <p className={"font-accent text-2xl sm:text-3xl md:text-4xl lg:text-5xl uppercase"}>{selectedTab.subtitle}</p>
                        <p className={"font-headers text-3xl sm:text-4xl md:text-5xl lg:text-6xl uppercase text-primary font-bold -mt-2"}>{selectedTab.title}</p>
                        <p className={"font-text text-sm sm:text-base"}>{selectedTab.description}</p>
                        <ErrorBoundary>
                            {selectedTab.component}
                        </ErrorBoundary>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
}
