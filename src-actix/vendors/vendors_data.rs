use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum VendorStatus {
    #[default]
    Active = 0,
    Inactive = 1,
}

impl<'de> Deserialize<'de> for VendorStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct VendorStatusVisitor;

        impl<'de> serde::de::Visitor<'de> for VendorStatusVisitor {
            type Value = VendorStatus;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a VendorStatus")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(VendorStatus::Active),
                    1 => Ok(VendorStatus::Inactive),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for VendorStatus: {}",
                        value
                    ))),
                }
            }

            fn visit_u64<E>(self, value: u64) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                if value <= u8::MAX as u64 {
                    self.visit_u8(value as u8)
                } else {
                    Err(E::custom(format!(
                        "u64 value {} is out of range for u8",
                        value
                    )))
                }
            }

            fn visit_str<E>(self, value: &str) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value.to_lowercase().as_str() {
                    "active" => Ok(VendorStatus::Active),
                    "inactive" => Ok(VendorStatus::Inactive),
                    _ => Err(E::unknown_variant(value, &["Active", "Inactive"])),
                }
            }
        }

        deserializer.deserialize_any(VendorStatusVisitor)
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct Vendor {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
    pub name: String,
    pub code: String,
    pub status: VendorStatus,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub created_by: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct VendorContact {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
    pub vendor_id: u32,
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    pub phone: String,
}

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct VendorShipLocation {
    #[serde(skip_serializing_if = "Option::is_none")]
    pub id: Option<u32>,
    pub vendor_id: u32,
    pub address: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct VendorWithRelations {
    pub id: u32,
    pub name: String,
    pub code: String,
    pub status: VendorStatus,
    pub created_at: Option<chrono::NaiveDateTime>,
    pub created_by: u32,
    pub contacts: Vec<VendorContact>,
    pub ship_locations: Vec<VendorShipLocation>,
}

impl VendorWithRelations {
    pub fn from_vendor(vendor: Vendor, contacts: Vec<VendorContact>, ship_locations: Vec<VendorShipLocation>) -> Self {
        Self {
            id: vendor.id.unwrap_or(0),
            name: vendor.name,
            code: vendor.code,
            status: vendor.status,
            created_at: vendor.created_at,
            created_by: vendor.created_by,
            contacts,
            ship_locations,
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct CreateVendorRequest {
    pub name: String,
    pub code: String,
    pub contacts: Vec<CreateContactRequest>,
    pub ship_locations: Vec<CreateShipLocationRequest>,
}

#[derive(Debug, Deserialize)]
pub struct CreateContactRequest {
    pub first_name: String,
    pub last_name: String,
    pub email: String,
    #[serde(default)]
    pub phone: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateShipLocationRequest {
    pub address: String,
}

#[derive(Debug, Deserialize)]
pub struct UpdateVendorRequest {
    pub name: Option<String>,
    pub code: Option<String>,
    pub status: Option<VendorStatus>,
    pub contacts: Option<Vec<CreateContactRequest>>,
    pub ship_locations: Option<Vec<CreateShipLocationRequest>>,
}
