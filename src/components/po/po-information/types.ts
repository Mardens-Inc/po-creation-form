import {CalendarDate} from "@internationalized/date";

export type FOBType = "Pickup" | "Delivered";

export type UploadFileItem = {
    key: string;
    filename: string;
    file: File;
    asset_type: UploadFileType;
}

export enum UploadFileType
{
    Asset = "Asset",
    Manifest = "Manifest",
}

export type POInformationFormData = {
    po_number: string; // Format: 1{buyerId}{number}[-extension], e.g., "110014", "110014-a", max 10 chars
    buyer_id: number;
    vendor_name: string;
    order_date: CalendarDate;
    ship_date: CalendarDate | null;
    cancel_date: CalendarDate | null;
    shipping_notes: string;
    description: string;
    terms: string;
    ship_to_address: string;
    fob_type: FOBType;
    fob_point: string;
    notes: string;
    files: UploadFileItem[];
}

export const PO_NUMBER_MAX_LENGTH = 10;

export const manifestExtensions = ["xlsx"];

export interface ManifestParseResult {
    buyer_name: string;
    po_number: string;
    vendor_name: string;
    terms: string;
    ship_to_address: string;
    ship_from_address: string;
    notes: string;
    line_items: unknown[];
}

export const shipToAddressOptions = [
    {key: "address-1", label: "123 Main Street, Waterville, ME 04901"},
    {key: "address-2", label: "456 Oak Avenue, Portland, ME 04101"},
    {key: "address-3", label: "789 Warehouse Drive, Bangor, ME 04401"},
    {key: "address-4", label: "321 Distribution Center, Lewiston, ME 04240"},
];
