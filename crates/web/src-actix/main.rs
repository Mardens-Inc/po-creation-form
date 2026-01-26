#[actix_web::main]
async fn main()->anyhow::Result<()>{
	po_tracker_dashboard_lib::run().await
}
