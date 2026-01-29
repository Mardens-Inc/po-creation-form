import {Spinner} from "@heroui/react";
import {useAuthentication, UserRole} from "../../providers/AuthenticationProvider.tsx";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";
import {DashboardHeader} from "../../components/dashboard/DashboardHeader.tsx";
import {MonthlyPOChart} from "../../components/dashboard/MonthlyPOChart.tsx";
import {YearlyPOChart} from "../../components/dashboard/YearlyPOChart.tsx";
import {MyPurchaseOrders} from "../../components/dashboard/MyPurchaseOrders.tsx";
import {RecentPurchaseOrders} from "../../components/dashboard/RecentPurchaseOrders.tsx";

export function Dashboard() {
    const {currentUser} = useAuthentication();
    const {isLoading, error} = usePurchaseOrdersContext();

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <Spinner size="lg" color="primary"/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex-1 flex items-center justify-center">
                <p className="text-danger">Failed to load purchase orders: {error}</p>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto">
            <div className="p-6 lg:p-8 space-y-6 max-w-[1600px]">
                <DashboardHeader/>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <MonthlyPOChart/>
                    <YearlyPOChart/>
                </div>

                {currentUser?.role === UserRole.Buyer && <MyPurchaseOrders/>}

                <RecentPurchaseOrders/>
            </div>
        </div>
    );
}
