use anyhow::Result;
use serde::{Deserialize, Serialize};
use crate::auth::user_role::UserRole;

#[derive(Debug, Serialize, Deserialize, Clone, sqlx::FromRow)]
pub struct User{
	#[serde(skip_serializing_if="Option::is_none")]
	pub id: Option<u32>,
	pub first_name: String,
	pub last_name: String,
	pub email: String,
	pub password: String,
	pub role: UserRole
}

impl PartialEq for User{
	fn eq(&self, other: &Self) -> bool {
		self.id == other.id
	}
}

impl User{
	pub async fn get_users()->Result<Vec<User>>
	{
		crate::auth::users_db::get_users().await
	}

	pub async fn register(&mut self)->Result<()>
	{

		Ok(())
	}

}