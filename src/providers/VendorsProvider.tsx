import {createContext, ReactNode, useContext, useMemo} from "react";
import {useVendors} from "../hooks/useVendors.ts";
import {usePurchaseOrdersContext} from "./PurchaseOrdersProvider.tsx";
import {Vendor} from "../components/vendors/types.ts";

interface VendorsContextType {
    vendors: Vendor[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

const VendorsContext = createContext<VendorsContextType | undefined>(undefined);

export function VendorsProvider({children}: { children: ReactNode }) {
    const vendorData = useVendors();
    const {purchaseOrders, isLoading: poLoading} = usePurchaseOrdersContext();

    // Enrich vendors with PO stats once both are loaded
    const enrichedVendors = useMemo(() => {
        if (vendorData.isLoading || poLoading) {
            return vendorData.vendors;
        }
        return vendorData.enrichVendorsWithPOStats(purchaseOrders);
    }, [vendorData, purchaseOrders, poLoading]);

    const contextValue: VendorsContextType = {
        vendors: enrichedVendors,
        isLoading: vendorData.isLoading,
        error: vendorData.error,
        refetch: vendorData.refetch,
    };

    return (
        <VendorsContext.Provider value={contextValue}>
            {children}
        </VendorsContext.Provider>
    );
}

export function useVendorsContext(): VendorsContextType {
    const context = useContext(VendorsContext);
    if (!context) {
        throw new Error("useVendorsContext must be used within a VendorsProvider");
    }
    return context;
}
