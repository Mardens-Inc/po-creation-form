use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum FOBType {
    #[default]
    Pickup = 0,
    Delivered = 1,
}

impl<'de> Deserialize<'de> for FOBType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct FOBTypeVisitor;

        impl<'de> serde::de::Visitor<'de> for FOBTypeVisitor {
            type Value = FOBType;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a FOBType")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(FOBType::Pickup),
                    1 => Ok(FOBType::Delivered),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for FOBType: {}",
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
                    "pickup" => Ok(FOBType::Pickup),
                    "delivered" => Ok(FOBType::Delivered),
                    _ => Err(E::unknown_variant(value, &["Pickup", "Delivered"])),
                }
            }
        }

        deserializer.deserialize_any(FOBTypeVisitor)
    }
}