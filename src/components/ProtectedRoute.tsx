import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {Navigate, Outlet} from "react-router-dom";
import {ErrorBoundary} from "../ErrorBoundry.tsx";
import {Spinner} from "@heroui/react";
import {SidebarNavigation} from "./SidebarNavigation.tsx";
import {TopNavigation} from "./TopNavigation.tsx";
import {POCreationProvider} from "./po/POCreationModal.tsx";
import {POEditProvider} from "./po/POEditModal.tsx";
import {VendorCreationProvider} from "./vendors/VendorCreationModal.tsx";
import {PurchaseOrdersProvider, usePurchaseOrdersContext} from "../providers/PurchaseOrdersProvider.tsx";
import {VendorsProvider} from "../providers/VendorsProvider.tsx";

export function ProtectedRoute()
{
    const {isAuthenticated, isLoading, currentUser} = useAuthentication();

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
    if (!currentUser?.mfa_enabled) return <Navigate to="/mfa" replace/>;
    if (currentUser?.mfa_enabled && !currentUser?.has_validated_mfa) return <Navigate to="/account/mfa/link" replace/>;
    if (currentUser?.requires_mfa_verification) return <Navigate to="/mfa/verify" replace/>;

    return (
        <ErrorBoundary>
            <PurchaseOrdersProvider>
                <VendorsProvider>
                    <POCreationProvider>
                        <VendorCreationProvider>
                            <ProtectedRouteContent/>
                        </VendorCreationProvider>
                    </POCreationProvider>
                </VendorsProvider>
            </PurchaseOrdersProvider>
        </ErrorBoundary>
    );
}

// Separate component to access PurchaseOrdersContext for the onSaved callback
function ProtectedRouteContent()
{
    const {refetch} = usePurchaseOrdersContext();

    return (
        <POEditProvider onSaved={refetch}>
            <main className={"flex flex-col min-h-screen"}>
                <TopNavigation/>
                <div className={"flex flex-row h-[calc(100dvh-4rem)]"}>
                    <SidebarNavigation/>
                    <Outlet/>
                </div>
            </main>
        </POEditProvider>
    );
}
