import {useAuthentication} from "../../providers/AuthenticationProvider.tsx";
import {usePurchaseOrdersContext} from "../../providers/PurchaseOrdersProvider.tsx";
import {StatCard} from "./StatCard.tsx";

export function DashboardHeader() {
    const {currentUser} = useAuthentication();
    const {getDashboardStats} = usePurchaseOrdersContext();
    const stats = getDashboardStats();

    const firstName = currentUser?.first_name || "User";

    const cards = [
        {title: "Total POs", value: stats.totalPOs.toString(), icon: "mdi:file-document-outline"},
        {title: "Pending", value: stats.pendingPOs.toString(), icon: "mdi:clock-outline"},
        {title: "Approved", value: stats.approvedPOs.toString(), icon: "mdi:check-circle-outline"},
        {title: "Total Spend", value: `$${stats.totalSpend.toLocaleString("en-US", {minimumFractionDigits: 2})}`, icon: "mdi:currency-usd"},
    ];

    return (
        <div className="space-y-4">
            <h1 className="font-headers font-black text-3xl">Welcome back, {firstName}</h1>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, i) => (
                    <StatCard key={card.title} title={card.title} value={card.value} icon={card.icon} index={i}/>
                ))}
            </div>
        </div>
    );
}
