use crate::auth::user_role::UserRole;

pub struct User{
	pub id: u32,
	pub first_name: String,
	pub last_name: String,
	pub email: String,
	pub password: String,
	pub role: UserRole

}