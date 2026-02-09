export enum POStatus {
    Draft = "Draft",
    Submitted = "Submitted",
    Approved = "Approved",
    Received = "Received",
    Cancelled = "Cancelled",
}

export interface PurchaseOrder {
    id: number;
    po_number: string;
    vendor: string;
    description: string;
    buyer_id: number;
    buyer_name: string;
    status: POStatus;
    total_amount: number;
    created_at: string;
}

export interface MonthlyPOData {
    month: string;
    count: number;
    amount: number;
}

export interface YearlyPOData {
    year: number;
    count: number;
    amount: number;
}

export interface DashboardStats {
    totalPOs: number;
    pendingPOs: number;
    approvedPOs: number;
    totalSpend: number;
}
