#[actix_web::main]
async fn main()->anyhow::Result<()>{
	dashboard_lib::run().await
}
