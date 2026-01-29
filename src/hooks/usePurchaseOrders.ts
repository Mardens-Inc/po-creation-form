import {useCallback, useEffect, useState} from "react";
import {useAuthentication} from "../providers/AuthenticationProvider.tsx";
import {DashboardStats, MonthlyPOData, POStatus, PurchaseOrder, YearlyPOData} from "../types/po.ts";

interface BackendPO {
    id: number;
    po_number: string;
    vendor_id: number;
    buyer_id: number;
    status: POStatus;
    description: string;
    order_date: string;
    ship_date: string | null;
    cancel_date: string | null;
    shipping_notes: string | null;
    terms: string;
    ship_to_address: string;
    fob_type: number;
    fob_point: string;
    notes: string | null;
    total_amount: number;
    created_at: string | null;
    vendor_name: string;
    buyer_name: string;
    files: unknown[];
    line_items: unknown[];
}

function mapBackendPO(po: BackendPO): PurchaseOrder {
    return {
        id: po.id,
        po_number: po.po_number,
        vendor: po.vendor_name,
        description: po.description,
        buyer_id: po.buyer_id,
        buyer_name: po.buyer_name,
        status: po.status,
        total_amount: po.total_amount,
        created_at: po.created_at ?? new Date().toISOString(),
    };
}

export function usePurchaseOrders() {
    const {getToken, isAuthenticated} = useAuthentication();
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPurchaseOrders = useCallback(async () => {
        const token = getToken();
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch("/api/purchase-orders", {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Failed to fetch purchase orders");
            }

            const data: BackendPO[] = await response.json();
            setPurchaseOrders(data.map(mapBackendPO));
        } catch (err) {
            setError(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        if (isAuthenticated) {
            fetchPurchaseOrders();
        }
    }, [isAuthenticated, fetchPurchaseOrders]);

    const getDashboardStats = useCallback((): DashboardStats => {
        const totalPOs = purchaseOrders.length;
        const pendingPOs = purchaseOrders.filter(
            po => po.status === POStatus.Submitted || po.status === POStatus.Draft
        ).length;
        const approvedPOs = purchaseOrders.filter(
            po => po.status === POStatus.Approved
        ).length;
        const totalSpend = purchaseOrders.reduce((sum, po) => sum + po.total_amount, 0);
        return {totalPOs, pendingPOs, approvedPOs, totalSpend};
    }, [purchaseOrders]);

    const getMonthlyData = useCallback((): MonthlyPOData[] => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const currentYear = new Date().getFullYear();

        const monthlyMap = new Map<number, { count: number; amount: number }>();
        for (let i = 0; i < 12; i++) {
            monthlyMap.set(i, {count: 0, amount: 0});
        }

        purchaseOrders.forEach(po => {
            const date = new Date(po.created_at);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                const entry = monthlyMap.get(month)!;
                entry.count += 1;
                entry.amount += po.total_amount;
            }
        });

        return months.map((month, index) => ({
            month,
            count: monthlyMap.get(index)!.count,
            amount: monthlyMap.get(index)!.amount,
        }));
    }, [purchaseOrders]);

    const getYearlyData = useCallback((): YearlyPOData[] => {
        const yearlyMap = new Map<number, { count: number; amount: number }>();

        purchaseOrders.forEach(po => {
            const year = new Date(po.created_at).getFullYear();
            if (!yearlyMap.has(year)) {
                yearlyMap.set(year, {count: 0, amount: 0});
            }
            const entry = yearlyMap.get(year)!;
            entry.count += 1;
            entry.amount += po.total_amount;
        });

        return Array.from(yearlyMap.entries())
            .map(([year, data]) => ({year, count: data.count, amount: data.amount}))
            .sort((a, b) => a.year - b.year);
    }, [purchaseOrders]);

    const getMyPOs = useCallback((userId: number): PurchaseOrder[] => {
        return purchaseOrders
            .filter(po => po.buyer_id === userId)
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }, [purchaseOrders]);

    const getRecentPOs = useCallback((limit: number = 10): PurchaseOrder[] => {
        return [...purchaseOrders]
            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
            .slice(0, limit);
    }, [purchaseOrders]);

    const getUniqueBuyers = useCallback((): { id: number; name: string }[] => {
        const seen = new Map<number, string>();
        for (const po of purchaseOrders) {
            if (!seen.has(po.buyer_id)) {
                seen.set(po.buyer_id, po.buyer_name);
            }
        }
        return Array.from(seen, ([id, name]) => ({id, name}));
    }, [purchaseOrders]);

    const getUniqueVendors = useCallback((): string[] => {
        return [...new Set(purchaseOrders.map(po => po.vendor))].sort();
    }, [purchaseOrders]);

    return {
        purchaseOrders,
        isLoading,
        error,
        refetch: fetchPurchaseOrders,
        getDashboardStats,
        getMonthlyData,
        getYearlyData,
        getMyPOs,
        getRecentPOs,
        getUniqueBuyers,
        getUniqueVendors,
    };
}
