use serde::Serialize;
use tokio::sync::broadcast;

#[derive(Debug, Clone, Serialize)]
#[serde(rename_all = "snake_case")]
pub enum SSEEvent {
    Vendors,
    PurchaseOrders,
    Users,
}

impl SSEEvent {
    pub fn as_str(&self) -> &'static str {
        match self {
            SSEEvent::Vendors => "vendors",
            SSEEvent::PurchaseOrders => "purchase_orders",
            SSEEvent::Users => "users",
        }
    }
}

pub struct Broadcaster {
    sender: broadcast::Sender<SSEEvent>,
}

impl Default for Broadcaster {
    fn default() -> Self {
        Self::new()
    }
}

impl Broadcaster {
    pub fn new() -> Self {
        let (sender, _) = broadcast::channel(128);
        Self { sender }
    }

    pub fn send(&self, event: SSEEvent) {
        // Ignore error (no active receivers)
        let _ = self.sender.send(event);
    }

    pub fn subscribe(&self) -> broadcast::Receiver<SSEEvent> {
        self.sender.subscribe()
    }
}
