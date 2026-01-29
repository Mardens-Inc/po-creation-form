import {useAuthentication, UserRole} from "../../providers/AuthenticationProvider.tsx";
import {DashboardHeader} from "../../components/dashboard/DashboardHeader.tsx";
import {MonthlyPOChart} from "../../components/dashboard/MonthlyPOChart.tsx";
import {YearlyPOChart} from "../../components/dashboard/YearlyPOChart.tsx";
import {MyPurchaseOrders} from "../../components/dashboard/MyPurchaseOrders.tsx";
import {RecentPurchaseOrders} from "../../components/dashboard/RecentPurchaseOrders.tsx";

export function Dashboard() {
    const {currentUser} = useAuthentication();

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
