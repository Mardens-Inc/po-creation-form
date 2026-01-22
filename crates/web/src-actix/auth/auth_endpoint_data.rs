use crate::auth::user_role::UserRole;
use crate::auth::users_data::User;

#[derive(serde::Deserialize, Debug, Clone)]
pub struct UserRegistrationBody{
	#[serde(alias="firstName")]
	pub first_name: String,
	#[serde(alias="lastName")]
	pub last_name: String,
	pub email: String,
	pub password: String,
	pub role: UserRole
}

impl From<UserRegistrationBody> for User {
	fn from(val: UserRegistrationBody) -> Self {
		User {
			id: None,
			first_name: val.first_name,
			last_name: val.last_name,
			email: val.email,
			password: val.password,
			role: val.role,
		}
	}
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct ConfirmEmailBody{
	pub token: String,
	pub email: String
}