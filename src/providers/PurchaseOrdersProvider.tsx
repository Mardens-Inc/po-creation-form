import {createContext, ReactNode, useContext} from "react";
import {usePurchaseOrders} from "../hooks/usePurchaseOrders.ts";
import {DashboardStats, MonthlyPOData, PurchaseOrder, YearlyPOData} from "../types/po.ts";

interface PurchaseOrdersContextType {
    purchaseOrders: PurchaseOrder[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    getDashboardStats: () => DashboardStats;
    getMonthlyData: () => MonthlyPOData[];
    getYearlyData: () => YearlyPOData[];
    getMyPOs: (userId: number) => PurchaseOrder[];
    getRecentPOs: (limit?: number) => PurchaseOrder[];
    getUniqueBuyers: () => { id: number; name: string }[];
    getUniqueVendors: () => string[];
}

const PurchaseOrdersContext = createContext<PurchaseOrdersContextType | undefined>(undefined);

export function PurchaseOrdersProvider({children}: { children: ReactNode }) {
    const poData = usePurchaseOrders();

    return (
        <PurchaseOrdersContext.Provider value={poData}>
            {children}
        </PurchaseOrdersContext.Provider>
    );
}

export function usePurchaseOrdersContext(): PurchaseOrdersContextType {
    const context = useContext(PurchaseOrdersContext);
    if (!context) {
        throw new Error("usePurchaseOrdersContext must be used within a PurchaseOrdersProvider");
    }
    return context;
}
