import {useEffect, useRef} from "react";

interface RealtimeCallbacks {
    vendors: () => Promise<void>;
    purchaseOrders: () => Promise<void>;
    users: () => Promise<void>;
}

export function useRealtimeUpdates(token: string | null, callbacks: RealtimeCallbacks) {
    const callbacksRef = useRef(callbacks);
    callbacksRef.current = callbacks;

    useEffect(() => {
        if (!token) return;

        const eventSource = new EventSource(`/api/events?token=${encodeURIComponent(token)}`);

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                switch (data.type) {
                    case "vendors":
                        callbacksRef.current.vendors();
                        break;
                    case "purchase_orders":
                        callbacksRef.current.purchaseOrders();
                        break;
                    case "users":
                        callbacksRef.current.users();
                        break;
                }
            } catch {
                // Ignore parse errors (e.g. heartbeat comments)
            }
        };

        return () => {
            eventSource.close();
        };
    }, [token]);
}
