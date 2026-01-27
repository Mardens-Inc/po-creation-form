import {Button, Link} from "@heroui/react";
import {useEffect} from "react";
import {useRemoteServerConnection} from "../providers/RemoteServerConnectionProvider.tsx";
import {useNavigate} from "react-router-dom";

export function OfflinePage()
{
    const {isConnected: isConnectedToRemote} = useRemoteServerConnection();
    const navigate = useNavigate();
    useEffect(() =>
    {
        if (!isConnectedToRemote) return;
        navigate("/", {replace: true});
    }, [isConnectedToRemote]);
    return (
        <div className="flex items-center justify-center w-full h-full bg-gray-50">
            <div className="max-w-md w-full mx-4 p-8 bg-white rounded-lg shadow-lg text-center">
                <div className="mb-6">
                    <svg
                        className="mx-auto h-16 w-16 text-red-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
                        />
                    </svg>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    No Network Connection
                </h1>

                <p className="text-gray-600 mb-6">
                    You are not currently online. An active network connection is required to login or register.
                </p>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700 font-semibold mb-2">
                        To continue, please connect to:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 text-start">
                        <li>• Mardens Intranet at a company location</li>
                        <li>• Sophos VPN for remote access</li>
                    </ul>
                </div>

                <Button
                    as={Link}
                    radius="none"
                    color="primary"
                    fullWidth
                    href={"/"}
                >
                    Retry Connection
                </Button>
            </div>
        </div>
    );
}