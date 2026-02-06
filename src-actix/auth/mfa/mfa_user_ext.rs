use crate::auth::mfa;
use crate::auth::users_data::User;
use anyhow::{anyhow, Result};

impl User {
    pub async fn enable_mfa(&mut self) -> Result<()> {
        self.mfa_enabled = true;
        let secret = mfa::generate_secret();
        self.mfa_secret = Some(secret);
        crate::auth::users_db::update_user(self.clone()).await?;
        Ok(())
    }
    pub async fn disable_mfa(&mut self) -> Result<()> {
        self.mfa_enabled = false;
        self.mfa_secret = None;
        crate::auth::users_db::update_user(self.clone()).await?;
        Ok(())
    }
    pub async fn get_link_qrcode(&self) -> Result<String> {
        if !self.is_mfa_enabled() {
            return Err(anyhow!("MFA is not enabled for this user"));
        }
        mfa::generate_qrcode_svg(self.mfa_secret.as_ref().unwrap(), &self.email)
    }

    pub fn verify_code(&self, code: &str) -> Result<bool> {
        if !self.is_mfa_enabled() {
            return Err(anyhow!("MFA is not enabled for this user"));
        }

        mfa::verify_totp(self.mfa_secret.as_ref().unwrap(), code)
    }

    pub fn is_mfa_enabled(&self) -> bool {
        self.mfa_enabled && self.mfa_secret.is_some()
    }
}
