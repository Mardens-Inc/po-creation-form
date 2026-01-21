#[actix_web::main]
async fn main()->anyhow::Result<()>{
	po_creation_dashboard_lib::run().await
}
