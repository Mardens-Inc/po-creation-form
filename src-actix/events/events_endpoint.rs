use super::broadcaster::Broadcaster;
use crate::auth::auth_service::validate_jwt_token;
use actix_web::web::Bytes;
use actix_web::{get, web, HttpResponse, Result};
use futures_util::stream;
use serde::Deserialize;
use std::time::Duration;
use tokio::time::interval;

#[derive(Deserialize)]
pub struct EventsQuery {
    token: String,
}

#[get("")]
pub async fn sse_events(
    query: web::Query<EventsQuery>,
    broadcaster: web::Data<Broadcaster>,
) -> Result<HttpResponse> {
    // Authenticate via query parameter
    validate_jwt_token(&query.token).map_err(|_| {
        actix_web::error::ErrorUnauthorized("Invalid or expired token")
    })?;

    let receiver = broadcaster.subscribe();

    let event_stream = stream::unfold(
        (receiver, interval(Duration::from_secs(30))),
        |(mut rx, mut heartbeat)| async move {
            loop {
                tokio::select! {
                    result = rx.recv() => {
                        match result {
                            Ok(event) => {
                                let data = format!(
                                    "data: {{\"type\":\"{}\"}}\n\n",
                                    event.as_str()
                                );
                                return Some((Ok::<Bytes, actix_web::Error>(Bytes::from(data)), (rx, heartbeat)));
                            }
                            Err(tokio::sync::broadcast::error::RecvError::Lagged(_)) => {
                                // Missed some messages, continue receiving
                                continue;
                            }
                            Err(tokio::sync::broadcast::error::RecvError::Closed) => {
                                return None;
                            }
                        }
                    }
                    _ = heartbeat.tick() => {
                        // Send a heartbeat comment to keep the connection alive
                        let comment = ": heartbeat\n\n".to_string();
                        return Some((Ok::<Bytes, actix_web::Error>(Bytes::from(comment)), (rx, heartbeat)));
                    }
                }
            }
        },
    );

    Ok(HttpResponse::Ok()
        .insert_header(("Content-Type", "text/event-stream"))
        .insert_header(("Cache-Control", "no-cache"))
        .insert_header(("Connection", "keep-alive"))
        .insert_header(("X-Accel-Buffering", "no"))
        .streaming(event_stream))
}

pub fn configure(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/events").service(sse_events));
}
