import {DashboardStats, MonthlyPOData, POStatus, PurchaseOrder, YearlyPOData} from "../types/po.ts";

export const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [
    {id: 1, po_number: "PO-2026-00142", vendor: "Grainger", description: "Industrial safety gloves and goggles", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Approved, total_amount: 2340.00, created_at: "2026-01-28T14:30:00Z"},
    {id: 2, po_number: "PO-2026-00141", vendor: "Uline", description: "Shipping boxes and packing tape", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Submitted, total_amount: 1875.50, created_at: "2026-01-27T10:15:00Z"},
    {id: 3, po_number: "PO-2026-00140", vendor: "McMaster-Carr", description: "Stainless steel fasteners assortment", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Draft, total_amount: 567.80, created_at: "2026-01-26T09:00:00Z"},
    {id: 4, po_number: "PO-2026-00139", vendor: "Fastenal", description: "Power tools and drill bits", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Received, total_amount: 4210.00, created_at: "2026-01-25T16:45:00Z"},
    {id: 5, po_number: "PO-2026-00138", vendor: "HD Supply", description: "Plumbing fixtures and valves", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Approved, total_amount: 3150.25, created_at: "2026-01-24T11:20:00Z"},
    {id: 6, po_number: "PO-2026-00137", vendor: "W.W. Grainger", description: "Electrical conduit and wiring", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Cancelled, total_amount: 890.00, created_at: "2026-01-23T08:30:00Z"},
    {id: 7, po_number: "PO-2026-00136", vendor: "Global Industrial", description: "Warehouse shelving units", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Approved, total_amount: 7825.00, created_at: "2026-01-22T13:00:00Z"},
    {id: 8, po_number: "PO-2026-00135", vendor: "Staples Business", description: "Office supplies and printer paper", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Received, total_amount: 432.10, created_at: "2026-01-20T15:10:00Z"},
    {id: 9, po_number: "PO-2026-00134", vendor: "MSC Industrial", description: "Cutting tools and abrasives", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Submitted, total_amount: 1654.30, created_at: "2026-01-18T10:45:00Z"},
    {id: 10, po_number: "PO-2026-00133", vendor: "Zoro", description: "Janitorial cleaning supplies", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Draft, total_amount: 298.75, created_at: "2026-01-15T09:30:00Z"},
    {id: 11, po_number: "PO-2025-00132", vendor: "Grainger", description: "HVAC filters and belts", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Received, total_amount: 1120.00, created_at: "2025-12-18T14:00:00Z"},
    {id: 12, po_number: "PO-2025-00131", vendor: "Uline", description: "Stretch wrap and pallets", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Approved, total_amount: 2650.00, created_at: "2025-11-22T11:30:00Z"},
    {id: 13, po_number: "PO-2025-00130", vendor: "McMaster-Carr", description: "Bearings and seals", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Received, total_amount: 3480.60, created_at: "2025-10-14T08:15:00Z"},
    {id: 14, po_number: "PO-2025-00129", vendor: "Fastenal", description: "Welding rods and gas cylinders", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Approved, total_amount: 1945.00, created_at: "2025-09-05T16:20:00Z"},
    {id: 15, po_number: "PO-2025-00128", vendor: "HD Supply", description: "LED lighting fixtures", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Received, total_amount: 5230.00, created_at: "2025-08-12T10:00:00Z"},
    {id: 16, po_number: "PO-2025-00127", vendor: "Global Industrial", description: "Conveyor belt components", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Cancelled, total_amount: 8900.00, created_at: "2025-07-01T13:45:00Z"},
    {id: 17, po_number: "PO-2025-00126", vendor: "Staples Business", description: "Toner cartridges and labels", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Received, total_amount: 687.25, created_at: "2025-06-15T09:00:00Z"},
    {id: 18, po_number: "PO-2024-00125", vendor: "MSC Industrial", description: "Machine shop tooling", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Received, total_amount: 4120.00, created_at: "2024-11-20T14:30:00Z"},
    {id: 19, po_number: "PO-2024-00124", vendor: "Zoro", description: "Safety signage and barriers", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Received, total_amount: 765.50, created_at: "2024-08-08T11:00:00Z"},
    {id: 20, po_number: "PO-2024-00123", vendor: "Grainger", description: "Motor and pump replacements", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Approved, total_amount: 6340.00, created_at: "2024-05-14T10:15:00Z"},
    {id: 21, po_number: "PO-2024-00122", vendor: "Uline", description: "Bubble mailers and poly bags", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Received, total_amount: 1230.00, created_at: "2024-02-28T08:45:00Z"},
    {id: 22, po_number: "PO-2023-00121", vendor: "McMaster-Carr", description: "Pneumatic fittings and hoses", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Received, total_amount: 2870.00, created_at: "2023-10-10T15:00:00Z"},
    {id: 23, po_number: "PO-2023-00120", vendor: "Fastenal", description: "Anchor bolts and concrete screws", buyer_id: 2, buyer_name: "Sarah Chen", status: POStatus.Received, total_amount: 945.30, created_at: "2023-06-22T12:30:00Z"},
    {id: 24, po_number: "PO-2023-00119", vendor: "HD Supply", description: "Pipe insulation materials", buyer_id: 1, buyer_name: "John Mitchell", status: POStatus.Received, total_amount: 1580.00, created_at: "2023-03-15T09:20:00Z"},
    {id: 25, po_number: "PO-2023-00118", vendor: "Global Industrial", description: "Dock levelers and bumpers", buyer_id: 3, buyer_name: "Mike Torres", status: POStatus.Received, total_amount: 9450.00, created_at: "2023-01-08T14:10:00Z"},
];

export const MOCK_MONTHLY_DATA: MonthlyPOData[] = [
    {month: "Jan", count: 10, amount: 24500},
    {month: "Feb", count: 7, amount: 18200},
    {month: "Mar", count: 12, amount: 31400},
    {month: "Apr", count: 9, amount: 22800},
    {month: "May", count: 14, amount: 35600},
    {month: "Jun", count: 8, amount: 19700},
    {month: "Jul", count: 11, amount: 28900},
    {month: "Aug", count: 6, amount: 15300},
    {month: "Sep", count: 13, amount: 33100},
    {month: "Oct", count: 10, amount: 25400},
    {month: "Nov", count: 15, amount: 38200},
    {month: "Dec", count: 9, amount: 21600},
];

export const MOCK_YEARLY_DATA: YearlyPOData[] = [
    {year: 2023, count: 87, amount: 198400},
    {year: 2024, count: 112, amount: 265800},
    {year: 2025, count: 134, amount: 312500},
    {year: 2026, count: 42, amount: 98700},
];

export function getDashboardStats(): DashboardStats {
    const totalPOs = MOCK_PURCHASE_ORDERS.length;
    const pendingPOs = MOCK_PURCHASE_ORDERS.filter(po => po.status === POStatus.Submitted || po.status === POStatus.Draft).length;
    const approvedPOs = MOCK_PURCHASE_ORDERS.filter(po => po.status === POStatus.Approved).length;
    const totalSpend = MOCK_PURCHASE_ORDERS.reduce((sum, po) => sum + po.total_amount, 0);
    return {totalPOs, pendingPOs, approvedPOs, totalSpend};
}

export function getMyPOs(userId: number): PurchaseOrder[] {
    return MOCK_PURCHASE_ORDERS.filter(po => po.buyer_id === userId)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export function getRecentPOs(limit: number = 10): PurchaseOrder[] {
    return [...MOCK_PURCHASE_ORDERS]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, limit);
}
