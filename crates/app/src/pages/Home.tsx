import {Outlet} from "react-router-dom";
import {Sidebar} from "../components/Sidebar.tsx";
import {ErrorBoundary} from "../components/ErrorBoundry.tsx";

export function Home()
{
    return (
        <div className={"flex flex-col lg:flex-row w-full"}>
            <ErrorBoundary><Sidebar/></ErrorBoundary>

            {/* Form Content */}
            <ErrorBoundary>
                <div className={"flex flex-col gap-4 w-full py-12 items-center max-h-[calc(100vh-2rem)] overflow-y-auto overflow-x-hidden mx-8"}>
                    <div className={"flex flex-col gap-4 w-full h-full"}>
                        <Outlet/>
                    </div>
                </div>
            </ErrorBoundary>
        </div>
    );
}
