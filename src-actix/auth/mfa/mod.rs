mod mfa_endpoint;
mod mfa_user_ext;

pub use mfa_endpoint::configure;
use anyhow::{anyhow, Result};
use qrcode::render::svg;
use qrcode::QrCode;
use rand::Rng;
use std::time::SystemTime;
use totp_lite::{totp_custom, Sha1};

const CODE_EXPIRATION_SECONDS: u64 = 30;
const CODE_LENGTH: u32 = 6;

pub fn generate_qrcode_svg(secret: &str, account: &str) -> Result<String> {
	let uri = generate_qr_uri(secret, account);
	let code = QrCode::new(uri)?;
	let image = code
		.render::<svg::Color>()
		.dark_color(svg::Color("#000000"))
		.light_color(svg::Color("#ffffff"))
		.build();
	Ok(image)
}

pub fn generate_qr_uri(secret: &str, account: &str) -> String {
	let issuer = "mfa_example";
	format!("otpauth://totp/{issuer}:{account}?secret={secret}&issuer={issuer}")
}

pub fn generate_totp(secret: &str) -> Result<String> {
	let secret_bytes = base32::decode(base32::Alphabet::Rfc4648 { padding: false }, secret)
		.ok_or(anyhow!("Invalid base32 secret"))?;

	let current_time_secs = SystemTime::now()
		.duration_since(SystemTime::UNIX_EPOCH)?
		.as_secs();

	let code = totp_custom::<Sha1>(
		CODE_EXPIRATION_SECONDS,
		CODE_LENGTH,
		&secret_bytes,
		current_time_secs,
	);

	Ok(format!("{:06}", code))
}

pub fn verify_totp(secret: &str, code: &str) -> Result<bool> {
	let secret_bytes = base32::decode(base32::Alphabet::Rfc4648 { padding: false }, secret)
		.ok_or(anyhow!("Invalid base32 secret"))?;

	let current_time_secs = SystemTime::now()
		.duration_since(SystemTime::UNIX_EPOCH)?
		.as_secs();

	// Check current window and adjacent windows for clock drift
	for time_offset in [-1, 0, 1] {
		let adjusted_time_seconds =
			(current_time_secs as i64 + time_offset * CODE_EXPIRATION_SECONDS as i64) as u64;
		let check_code = totp_custom::<Sha1>(
			CODE_EXPIRATION_SECONDS,
			CODE_LENGTH,
			&secret_bytes,
			adjusted_time_seconds,
		);
		if format!("{:06}", check_code) == code {
			return Ok(true);
		}
	}

	Ok(false)
}

pub fn generate_secret() -> String {
	let mut rng = rand::rng();
	let secret: Vec<u8> = (0..20).map(|_| rng.random()).collect();
	base32::encode(base32::Alphabet::Rfc4648 { padding: false }, &secret)
}
