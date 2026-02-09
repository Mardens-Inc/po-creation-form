use serde::{Deserialize, Deserializer, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Default, sqlx::Type)]
#[repr(u8)]
pub enum UploadFileType {
    #[default]
    Asset = 0,
    Manifest = 1,
}

impl<'de> Deserialize<'de> for UploadFileType {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: Deserializer<'de>,
    {
        struct UploadFileTypeVisitor;

        impl<'de> serde::de::Visitor<'de> for UploadFileTypeVisitor {
            type Value = UploadFileType;

            fn expecting(&self, formatter: &mut std::fmt::Formatter) -> std::fmt::Result {
                formatter.write_str("a string or u8 representing an UploadFileType")
            }

            fn visit_u8<E>(self, value: u8) -> Result<Self::Value, E>
            where
                E: serde::de::Error,
            {
                match value {
                    0 => Ok(UploadFileType::Asset),
                    1 => Ok(UploadFileType::Manifest),
                    _ => Err(E::custom(format!(
                        "invalid u8 value for UploadFileType: {}",
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
                    "asset" => Ok(UploadFileType::Asset),
                    "manifest" => Ok(UploadFileType::Manifest),
                    _ => Err(E::unknown_variant(value, &["Asset", "Manifest"])),
                }
            }
        }

        deserializer.deserialize_any(UploadFileTypeVisitor)
    }
}
