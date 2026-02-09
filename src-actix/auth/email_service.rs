use anyhow::Result;
use lettre::message::header::ContentType;
use lettre::transport::smtp::authentication::Credentials;
use lettre::{SmtpTransport, Transport};
use log::{debug, error};

const SMTP_HOST: &str = env!("SMTP_HOST");
const SMTP_USERNAME: &str = env!("SMTP_USERNAME");
const SMTP_PASSWORD: &str = env!("SMTP_PASSWORD");
const CONFIRM_EMAIL_TEMPLATE: &str =
    include_str!("../../templates/confirm_email_template.html.tera");
const RESET_PASSWORD_TEMPLATE: &str =
    include_str!("../../templates/reset_password_template.html.tera");

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
        context.insert("email", email_address);
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
        context.insert("email", email_address);
        context.insert("token", token);
        context.insert("first_name", first_name);
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
}
