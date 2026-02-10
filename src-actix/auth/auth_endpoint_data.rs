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
			has_confirmed_email: false,
			needs_password_reset: false,
			mfa_enabled: false,
			mfa_secret: None,
			has_validated_mfa: false,
			last_ip: None,
			requires_mfa_verification: false,
		}
	}
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct ConfirmEmailBody{
	pub token: String,
	pub email: String
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct LoginRequestBody{
	pub email: String,
	pub password: String
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct RequestPasswordResetBody{
	pub email: String
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct ResetPasswordBody{
	pub email: String,
	pub token: String,
	pub password: String
}

#[derive(serde::Deserialize, Debug, Clone)]
pub struct UpdateUserBody {
	pub first_name: Option<String>,
	pub last_name: Option<String>,
	pub email: Option<String>,
	pub role: Option<UserRole>,
}