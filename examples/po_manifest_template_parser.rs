use log::error;
use po_tracker_dashboard_lib::purchase_orders::manifest_parser::parse_manifest;

#[tokio::main]
async fn main() {
    pretty_env_logger::env_logger::builder()
        .format_timestamp(None)
        .init();
    if std::env::args().len() < 2 {
        error!(
            "Usage: cargo parse_manifest <path to manifest file>"
        );
        std::process::exit(1);
    }

    let manifest_path = std::env::args().nth(1).unwrap();
    let bytes = std::fs::read(manifest_path).unwrap();
    let result = parse_manifest(&bytes).unwrap();
    println!("{:#?}", result);
}
