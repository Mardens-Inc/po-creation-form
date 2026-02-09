use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum POStatus {
    #[default]
    Draft = 0,
    Submitted = 1,
    Approved = 2,
    Received = 3,
    Cancelled = 4,
}

impl<'de> Deserialize<'de> for POStatus {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct POStatusVisitor;

        impl<'de> serde::de::Visitor<'de> for POStatusVisitor {
            type Value = POStatus;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing a POStatus")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(POStatus::Draft),
                    1 => Ok(POStatus::Submitted),
                    2 => Ok(POStatus::Approved),
                    3 => Ok(POStatus::Received),
                    4 => Ok(POStatus::Cancelled),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for POStatus: {}",
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
                    "draft" => Ok(POStatus::Draft),
                    "submitted" => Ok(POStatus::Submitted),
                    "approved" => Ok(POStatus::Approved),
                    "received" => Ok(POStatus::Received),
                    "cancelled" => Ok(POStatus::Cancelled),
                    _ => Err(E::unknown_variant(
                        value,
                        &["Draft", "Submitted", "Approved", "Received", "Cancelled"],
                    )),
                }
            }
        }

        deserializer.deserialize_any(POStatusVisitor)
    }
}