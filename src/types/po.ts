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

export interface POFile {
    id: number;
    po_id: number;
    filename: string;
    asset_type: number;
    disk_path: string;
    uploaded_at: string | null;
    uploaded_by: number;
}

export interface POLineItem {
    id: number;
    po_id: number;
    item_number: string;
    upc: string;
    description: string;
    case_pack: string;
    cases: string;
    qty: number;
    mardens_cost: number;
    mardens_price: number;
    comp_retail: number;
    department: string;
    category: string;
    sub_category: string;
    season: string;
    buyer_notes: string | null;
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
