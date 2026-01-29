export type PointOfContact = {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone: string;
}

export type ShipLocation = {
    id: string;
    address: string;
}

export enum VendorStatus {
    Active,
    Inactive,
}

export type Vendor = {
    id: number;
    name: string;
    code: string;
    status: VendorStatus;
    contacts: PointOfContact[];
    ship_locations: ShipLocation[];
    total_pos: number;
    total_spend: number;
    created_at: string;
}

let _contactId = 0;
export const nextContactId = () => `contact-${++_contactId}`;

let _locationId = 0;
export const nextLocationId = () => `location-${++_locationId}`;
