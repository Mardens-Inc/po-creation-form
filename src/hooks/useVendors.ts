import {useCallback, useEffect, useState} from "react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {PointOfContact, ShipLocation, Vendor} from "../components/vendors/types.ts";

interface BackendContact {
    id: number;
    vendor_id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

interface BackendShipLocation {
    id: number;
    vendor_id: number;
    address: string;
}

interface BackendVendor {
    id: number;
    name: string;
    code: string;
    status: string; // "Active" or "Inactive"
    created_at: string | null;
    created_by: number;
    contacts: BackendContact[];
    ship_locations: BackendShipLocation[];
}

function mapContact(c: BackendContact): PointOfContact {
    return {
        id: String(c.id),
        first_name: c.first_name,
        last_name: c.last_name,
        email: c.email,
        phone: c.phone,
    };
}

function mapShipLocation(l: BackendShipLocation): ShipLocation {
    return {
        id: String(l.id),
        address: l.address,
    };
}

function mapBackendVendor(v: BackendVendor): Omit<Vendor, "total_pos" | "total_spend"> {
    return {
        id: v.id,
        name: v.name,
        code: v.code,
        status: v.status,
        contacts: v.contacts.map(mapContact),
        ship_locations: v.ship_locations.map(mapShipLocation),
        created_at: v.created_at ?? new Date().toISOString(),
    };
}

export function useVendors() {
    const {getToken, isAuthenticated} = useAuthentication();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchVendors = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/vendors", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch vendors");
            }

            const data: BackendVendor[] = await response.json();

            // Map vendors - total_pos and total_spend will be set later when PO data is available
            const mappedVendors: Vendor[] = data.map(v => ({
                ...mapBackendVendor(v),
                total_pos: 0,
                total_spend: 0,
            }));

            setVendors(mappedVendors);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchVendors();
        }
    }, [isAuthenticated, fetchVendors]);

    // Function to enrich vendors with PO stats from purchase orders context
    const enrichVendorsWithPOStats = useCallback((
        purchaseOrders: { vendor: string; total_amount: number }[]
    ): Vendor[] => {
        // Build a map of vendor name -> {count, spend}
        const vendorStats = new Map<string, { count: number; spend: number }>();

        for (const po of purchaseOrders) {
            const existing = vendorStats.get(po.vendor) || {count: 0, spend: 0};
            existing.count += 1;
            existing.spend += po.total_amount;
            vendorStats.set(po.vendor, existing);
        }

        return vendors.map(v => {
            const stats = vendorStats.get(v.name) || {count: 0, spend: 0};
            return {
                ...v,
                total_pos: stats.count,
                total_spend: stats.spend,
            };
        });
    }, [vendors]);

    return {
        vendors,
        isLoading,
        error,
        refetch: fetchVendors,
        enrichVendorsWithPOStats,
    };
}
