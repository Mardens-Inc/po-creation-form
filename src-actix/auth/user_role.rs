use serde::{Deserialize, Deserializer};

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum UserRole {
    Admin = 0,
    Buyer = 1,
    #[default]
    Warehouse = 2,
}

impl UserRole {
    pub fn is_admin(&self) -> bool {
        *self == UserRole::Admin
    }
    pub fn is_warehouse(&self) -> bool {
        *self == UserRole::Warehouse
    }
    pub fn is_buyer(&self) -> bool {
        *self == UserRole::Buyer
    }
    pub fn values() -> [Self; 3] {
        [UserRole::Admin, UserRole::Warehouse, UserRole::Buyer]
    }
}

impl<'de> Deserialize<'de> for UserRole {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct UserRoleVisitor;

        impl<'de> serde::de::Visitor<'de> for UserRoleVisitor {
            type Value = UserRole;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a UserRole")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(UserRole::Admin),
                    1 => Ok(UserRole::Buyer),
                    2 => Ok(UserRole::Warehouse),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for UserRole: {}",
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
                    "admin" => Ok(UserRole::Admin),
                    "buyer" => Ok(UserRole::Buyer),
                    "warehouse" => Ok(UserRole::Warehouse),
                    _ => Err(E::unknown_variant(value, &["Admin", "Buyer", "Warehouse"])),
                }
            }
        }

        deserializer.deserialize_any(UserRoleVisitor)
    }
}
