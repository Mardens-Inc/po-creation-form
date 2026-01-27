import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {Navigate, Outlet} from "react-router-dom";
import {ErrorBoundary} from "./ErrorBoundry.tsx";
import {Spinner} from "@heroui/react";
import {useRemoteServerConnection} from "../providers/RemoteServerConnectionProvider.tsx";

export function ProtectedRoute()
{
    const {isAuthenticated, isLoading} = useAuthentication();
    const {isConnected: isConnectedToRemote} = useRemoteServerConnection();

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
    if (!isAuthenticated)
    {
        if (!isConnectedToRemote)
            return <Navigate to="/offline" replace/>;
        return <Navigate to="/login" replace/>;
    }

    return (
        <ErrorBoundary>
            <Outlet/>
        </ErrorBoundary>
    );
}
