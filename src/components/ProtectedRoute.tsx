import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {Navigate, Outlet} from "react-router-dom";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Spinner} from "@heroui/react";
import {SidebarNavigation} from "./SidebarNavigation.tsx";
import {TopNavigation} from "./TopNavigation.tsx";
import {POCreationProvider} from "./po/POCreationModal.tsx";
import {VendorCreationProvider} from "./vendors/VendorCreationModal.tsx";
import {PurchaseOrdersProvider} from "../providers/PurchaseOrdersProvider.tsx";
import {VendorsProvider} from "../providers/VendorsProvider.tsx";

export function ProtectedRoute()
{
    const {isAuthenticated, isLoading} = useAuthentication();

    // Show loading spinner while checking authentication
    if (isLoading)
    {
        return (
            <div className="flex items-center justify-center w-full h-full">
                <Spinner size="lg" color="primary"/>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) return <Navigate to="/login" replace/>;

    return (
        <ErrorBoundary>
            <PurchaseOrdersProvider>
                <VendorsProvider>
                    <POCreationProvider>
                        <VendorCreationProvider>
                            <main className={"flex flex-col min-h-screen"}>
                                <TopNavigation/>
                                <div className={"flex flex-row h-[calc(100dvh-4rem)]"}>
                                    <SidebarNavigation/>
                                    <Outlet/>
                                </div>
                            </main>
                        </VendorCreationProvider>
                    </POCreationProvider>
                </VendorsProvider>
            </PurchaseOrdersProvider>
        </ErrorBoundary>
    );
}
