use anyhow::Result;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{SmtpTransport, Transport};
use log::{debug, error};
use serde::Serialize;

const SMTP_HOST: &str = env!("SMTP_HOST");
const SMTP_USERNAME: &str = env!("SMTP_USERNAME");
const SMTP_PASSWORD: &str = env!("SMTP_PASSWORD");
const CONFIRM_EMAIL_TEMPLATE: &str =
    include_str!("../../templates/confirm_email_template.html.tera");
const RESET_PASSWORD_TEMPLATE: &str =
    include_str!("../../templates/reset_password_template.html.tera");
const VENDOR_CREATED_TEMPLATE: &str =
    include_str!("../../templates/vendor_created_template.html.tera");

pub struct EmailService {
    transport: SmtpTransport,
}

impl EmailService {
    pub fn new() -> Result<Self> {
        debug!("Creating SMTP transport for host: {}", SMTP_HOST);
        let creds = Credentials::new(SMTP_USERNAME.to_string(), SMTP_PASSWORD.to_string());
        let transport = SmtpTransport::starttls_relay(SMTP_HOST)?
            .credentials(creds)
            .build();
        Ok(Self { transport })
    }

    pub async fn send_confirmation_email(
        &self,
        email_address: &str,
        token: &str,
        first_name: &str,
    ) -> Result<()> {
        debug!("Sending confirmation email to {}", email_address);
        let mut context = tera::Context::new();
        context.insert("email", &uri_encode::encode_uri_component(email_address));
        context.insert("token", token);
        context.insert("first_name", first_name);
        let url = if cfg!(debug_assertions) {
            format!("http://localhost:{}", crate::PORT)
        } else {
            "https://potracker.mardens.com".to_string()
        };
        context.insert("url", &url);
        let body = tera::Tera::one_off(CONFIRM_EMAIL_TEMPLATE, &context, true)?;
        let email = lettre::Message::builder()
			.from(SMTP_USERNAME.parse()?)
			.to(email_address.parse()?)
			.subject("Confirm your email address")
			.header(ContentType::TEXT_HTML)
			.body(body)
			.map_err(|e| {
					error!("Failed to build email message: {}", e);
					anyhow::Error::from(e)
				})?;
        self.transport.send(&email)
                      .map_err(|e| {
	                      error!("Failed to send email to recipient");
	                      anyhow::Error::from(e)
                      })?;
        Ok(())
    }

    pub async fn send_reset_password_email(
        &self,
        email_address: &str,
        token: &str,
        first_name: &str,
    ) -> Result<()> {
        debug!("Sending password reset email to {}", email_address);
        let mut context = tera::Context::new();
        context.insert("email", &uri_encode::encode_uri_component(email_address));
        context.insert("token", token);
        context.insert("first_name", &uri_encode::encode_uri_component(first_name));
        let url = if cfg!(debug_assertions) {
            format!("http://localhost:{}", crate::PORT)
        } else {
            "https://potracker.mardens.com".to_string()
        };
        context.insert("url", &url);
        let body = tera::Tera::one_off(RESET_PASSWORD_TEMPLATE, &context, true)?;
        let email = lettre::Message::builder()
            .from(SMTP_USERNAME.parse()?)
            .to(email_address.parse()?)
            .subject("Reset Your Password")
            .header(ContentType::TEXT_HTML)
            .body(body)
            .map_err(|e| {
                error!("Failed to build reset password email message: {}", e);
                anyhow::Error::from(e)
            })?;
        self.transport.send(&email)
            .map_err(|e| {
                error!("Failed to send reset password email to recipient");
                anyhow::Error::from(e)
            })?;
        Ok(())
    }

    pub async fn send_vendor_created_email(
        &self,
        username: &str,
        vendor_name: &str,
        vendor_code: &str,
        contacts: &[impl Serialize],
        ship_locations: &[impl Serialize],
    ) -> Result<()> {
        debug!("Sending vendor created email to vendor.approvers@mardens.com");
        let mut context = tera::Context::new();
        context.insert("username", username);
        context.insert("vendor_name", vendor_name);
        context.insert("vendor_code", vendor_code);
        context.insert("contacts", contacts);
        context.insert("ship_locations", ship_locations);
        let body = tera::Tera::one_off(VENDOR_CREATED_TEMPLATE, &context, true)?;
        let email = lettre::Message::builder()
            .from(SMTP_USERNAME.parse()?)
            .to("drew.chase@mardens.com".parse()?)
//            .to("vendor.approvers@mardens.com".parse()?)
            .subject("New Vendor Creation Request")
            .header(ContentType::TEXT_HTML)
            .body(body)
            .map_err(|e| {
                error!("Failed to build vendor created email message: {}", e);
                anyhow::Error::from(e)
            })?;
        self.transport.send(&email)
            .map_err(|e| {
                error!("Failed to send vendor created email");
                anyhow::Error::from(e)
            })?;
        Ok(())
    }
}
