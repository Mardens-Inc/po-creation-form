import {createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState} from "react";
import {getApiRoute} from "../api_route.ts";
import {addToast} from "@heroui/react";
import { fetch } from '@tauri-apps/plugin-http';

interface RemoteServerConnectionContextType
{
    isConnected: boolean;
}

const RemoteServerConnectionContext = createContext<RemoteServerConnectionContextType | undefined>(undefined);

export function RemoteServerConnectionProvider({children}: { children: ReactNode })
{
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [serverUrl, setServerUrl] = useState<string | undefined>(undefined);

    // Use a ref to track current status without causing re-renders
    const isConnectedRef = useRef(isConnected);

    useEffect(() =>
    {
        getApiRoute().then(setServerUrl);
    }, []);

    const updateIsConnectedStatus = useCallback(
        (connected: boolean) =>
        {

            if (connected !== isConnectedRef.current)
            {
                console.info("Changing connected status from ", isConnectedRef.current, " to ", connected, " (remote server url: ", serverUrl, ")");
                isConnectedRef.current = connected;
                setIsConnected(connected);

                if (connected)
                {
                    addToast({
                        title: "Remote Connection Established",
                        description: "Successfully connected to remote server.",
                        color: "success"
                    });
                } else
                {
                    addToast({
                        title: "Remote Connection Lost",
                        description: "Lost connection to remote server. This means you will not be able to upload PO requests",
                        color: "danger"
                    });
                }
            }
        },
        [serverUrl]
    );


    useEffect(() =>
    {
        if (!serverUrl) return;
        const tryConnect = async () =>
        {
            try
            {
                const response = await fetch(`${serverUrl}/status/health`);
                console.info("Remote server health check response: ", response.status);
                updateIsConnectedStatus(response.status === 200);
            } catch
            {
                updateIsConnectedStatus(false);
            }
        };
        tryConnect();
        let interval = setInterval(tryConnect, 5000);

        return () =>
        {
            clearInterval(interval);
        };
    }, [serverUrl]);


    return (
        <RemoteServerConnectionContext.Provider value={{isConnected}}>
            {children}
        </RemoteServerConnectionContext.Provider>
    );
}

export function useRemoteServerConnection(): RemoteServerConnectionContextType
{
    const context = useContext(RemoteServerConnectionContext);
    if (!context)
    {
        throw new Error("useRemoteServerConnection must be used within a RemoteServerConnectionProvider");
    }
    return context;
}