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

let _contactId = 0;
export const nextContactId = () => `contact-${++_contactId}`;

let _locationId = 0;
export const nextLocationId = () => `location-${++_locationId}`;
