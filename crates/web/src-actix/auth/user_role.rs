#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize, Default)]
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
