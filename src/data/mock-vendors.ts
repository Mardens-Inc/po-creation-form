import {Vendor, VendorStatus} from "../components/vendors/types.ts";

export const MOCK_VENDORS: Vendor[] = [
    {
        id: 1, name: "Grainger", code: "GRN", status: VendorStatus.Active,
        contacts: [{id: "c1", first_name: "Tom", last_name: "Harris", email: "tom.harris@grainger.com", phone: "(312) 555-0101"}],
        ship_locations: [{id: "l1", address: "100 Grainger Pkwy, Lake Forest, IL 60045"}],
        total_pos: 3, total_spend: 9710.00, created_at: "2022-06-15T10:00:00Z",
    },
    {
        id: 2, name: "Uline", code: "ULN", status: VendorStatus.Active,
        contacts: [{id: "c2", first_name: "Lisa", last_name: "Park", email: "lisa.park@uline.com", phone: "(262) 555-0202"}],
        ship_locations: [{id: "l2", address: "12575 Uline Dr, Pleasant Prairie, WI 53158"}],
        total_pos: 3, total_spend: 5755.50, created_at: "2022-08-20T09:00:00Z",
    },
    {
        id: 3, name: "McMaster-Carr", code: "MCM", status: VendorStatus.Active,
        contacts: [
            {id: "c3", first_name: "Dave", last_name: "Nguyen", email: "dave.nguyen@mcmaster.com", phone: "(630) 555-0303"},
            {id: "c4", first_name: "Amy", last_name: "Reed", email: "amy.reed@mcmaster.com", phone: "(630) 555-0304"},
        ],
        ship_locations: [{id: "l3", address: "600 N County Line Rd, Elmhurst, IL 60126"}],
        total_pos: 3, total_spend: 6918.40, created_at: "2022-03-10T14:00:00Z",
    },
    {
        id: 4, name: "Fastenal", code: "FST", status: VendorStatus.Active,
        contacts: [{id: "c5", first_name: "Brian", last_name: "Clark", email: "brian.clark@fastenal.com", phone: "(507) 555-0404"}],
        ship_locations: [{id: "l4", address: "2001 Theurer Blvd, Winona, MN 55987"}],
        total_pos: 3, total_spend: 7100.30, created_at: "2023-01-05T11:00:00Z",
    },
    {
        id: 5, name: "HD Supply", code: "HDS", status: VendorStatus.Active,
        contacts: [{id: "c6", first_name: "Karen", last_name: "White", email: "karen.white@hdsupply.com", phone: "(770) 555-0505"}],
        ship_locations: [
            {id: "l5", address: "3400 Cumberland Blvd, Atlanta, GA 30339"},
            {id: "l6", address: "1020 Industrial Pkwy, Dallas, TX 75201"},
        ],
        total_pos: 3, total_spend: 9960.25, created_at: "2022-11-01T08:30:00Z",
    },
    {
        id: 6, name: "W.W. Grainger", code: "WWG", status: VendorStatus.Inactive,
        contacts: [{id: "c7", first_name: "Steve", last_name: "Brown", email: "steve.brown@wwgrainger.com", phone: "(312) 555-0606"}],
        ship_locations: [{id: "l7", address: "300 MacArthur Blvd, Northbrook, IL 60062"}],
        total_pos: 1, total_spend: 890.00, created_at: "2023-04-18T13:00:00Z",
    },
    {
        id: 7, name: "Global Industrial", code: "GLB", status: VendorStatus.Active,
        contacts: [{id: "c8", first_name: "Janet", last_name: "Lopez", email: "janet.lopez@globalindustrial.com", phone: "(516) 555-0707"}],
        ship_locations: [{id: "l8", address: "11 Harbor Park Dr, Port Washington, NY 11050"}],
        total_pos: 3, total_spend: 26175.00, created_at: "2022-09-22T10:15:00Z",
    },
    {
        id: 8, name: "Staples Business", code: "STP", status: VendorStatus.Active,
        contacts: [{id: "c9", first_name: "Rachel", last_name: "Kim", email: "rachel.kim@staples.com", phone: "(508) 555-0808"}],
        ship_locations: [{id: "l9", address: "500 Staples Dr, Framingham, MA 01702"}],
        total_pos: 2, total_spend: 1119.35, created_at: "2023-02-14T09:45:00Z",
    },
    {
        id: 9, name: "MSC Industrial", code: "MSC", status: VendorStatus.Active,
        contacts: [{id: "c10", first_name: "Paul", last_name: "Martin", email: "paul.martin@mscindustrial.com", phone: "(516) 555-0909"}],
        ship_locations: [{id: "l10", address: "75 Maxess Rd, Melville, NY 11747"}],
        total_pos: 2, total_spend: 5774.30, created_at: "2023-05-30T15:00:00Z",
    },
    {
        id: 10, name: "Zoro", code: "ZRO", status: VendorStatus.Active,
        contacts: [{id: "c11", first_name: "Emily", last_name: "Davis", email: "emily.davis@zoro.com", phone: "(847) 555-1010"}],
        ship_locations: [{id: "l11", address: "920 Lake Cook Rd, Buffalo Grove, IL 60089"}],
        total_pos: 2, total_spend: 1064.25, created_at: "2023-07-12T12:00:00Z",
    },
];

export function getUniqueVendorStatuses(): { key: VendorStatus; label: string }[] {
    return [
        {key: VendorStatus.Active, label: "Active"},
        {key: VendorStatus.Inactive, label: "Inactive"},
    ];
}
