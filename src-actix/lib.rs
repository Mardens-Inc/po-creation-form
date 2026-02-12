#![allow(dead_code)]

use crate::util::asset_endpoint::AssetsAppConfig;
use actix_cors::Cors;
use actix_web::{http::header, middleware, web, App, HttpResponse, HttpServer};
use anyhow::Result;
use log::*;
use serde_json::json;
use vite_actix::proxy_vite_options::ProxyViteOptions;
use vite_actix::start_vite_server;

mod app_db;
mod auth;
mod data;
pub mod events;
pub mod purchase_orders;
mod status_endpoint;
mod util;
mod vendors;

pub static DEBUG: bool = cfg!(debug_assertions);
const PORT: u16 = 8522;

pub async fn run() -> Result<()> {
    #[cfg(debug_assertions)]
    {
        if let Err(e) = std::env::set_current_dir("./target/dev-env") {
            eprintln!("Failed to change directory to dev-env: {}", e);
            std::process::exit(1);
        }
    }

    pretty_env_logger::env_logger::builder().init();

    app_db::initialize_database().await?;

    // Initialize JWT secrets and start rotation scheduler
    auth::auth_service::init_jwt_secrets();
    auth::auth_service::start_jwt_rotation_scheduler();

    let broadcaster = web::Data::new(events::broadcaster::Broadcaster::new());

    let server = HttpServer::new(move || {
        let cors = Cors::default()
            .allowed_origin("http://localhost:1420")
            .allowed_origin("http://127.0.0.1:1420")
            .allowed_origin("tauri://localhost")
            .allowed_origin("http://tauri.localhost")
            .allowed_methods(vec!["GET", "POST", "PUT", "DELETE", "OPTIONS"])
            .allowed_headers(vec![
                header::AUTHORIZATION,
                header::CONTENT_TYPE,
                header::ACCEPT,
                header::ACCESS_CONTROL_ALLOW_ORIGIN,
            ])
            .supports_credentials()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(middleware::Logger::default())
            .app_data(broadcaster.clone())
            .app_data(
                web::JsonConfig::default()
                    .limit(4096)
                    .error_handler(|err, _req| {
                        let error = json!({ "error": format!("{}", err) });
                        actix_web::error::InternalError::from_response(
                            err,
                            HttpResponse::BadRequest().json(error),
                        )
                        .into()
                    }),
            )
            .service(
                web::scope("api")
                    .configure(status_endpoint::configure)
                    .configure(data::configure)
                    .configure(auth::configure)
                    .configure(vendors::configure)
                    .configure(purchase_orders::configure)
                    .configure(events::configure),
            )
            .configure_frontend_routes()
    })
    .workers(4)
    .bind(format!("0.0.0.0:{port}", port = PORT))?
    .run();

    info!(
        "Starting {} server at http://127.0.0.1:{}...",
        if DEBUG { "development" } else { "production" },
        PORT
    );

    if DEBUG {
        tokio::spawn(async move {
            ProxyViteOptions::default().build()?;
            start_vite_server()
                .expect("Failed to start vite server")
                .wait()?;
            Ok::<(), anyhow::Error>(())
        });
    }

    let stop_result = server.await;
    debug!("Server stopped");

    Ok(stop_result?)
}
